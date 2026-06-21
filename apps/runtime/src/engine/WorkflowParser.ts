import { WorkflowDefinition, WorkflowNode } from '@m2a/sdk';
import { AgentRunner } from './AgentRunner.js';
import { nodeHandlers } from './NodeHandlers.js';
import type { UserContext } from './MemoryRouter.js';
import { coordinator } from './AgentCoordinator.js';
import { dpa } from './DataProcessingAgent.js';
import { db } from '../db.js';

export interface WorkflowEvent {
  type: 'node:start' | 'node:complete' | 'node:error' | 'workflow:complete';
  nodeId?: string;
  nodeLabel?: string;
  output?: string;
  error?: string;
  status?: string;
  results?: Record<string, string>;
  timestamp: number;
}

export interface WorkflowState {
  outputs: Record<string, string>;
  status: 'pending' | 'running' | 'completed' | 'failed';
  retries: Record<string, number>;
}

export class WorkflowParser {
  constructor(private agentRunner: AgentRunner) {}

  async execute(
    workflow: WorkflowDefinition,
    initialInput: string,
    userContext: UserContext & { delegateKey: string; accountId: string },
    onEvent?: (event: WorkflowEvent) => void
  ): Promise<WorkflowState> {
    console.log(`[WorkflowParser] Starting execution: ${workflow.name}`);
    coordinator.clear();

    const depMap = new Map<string, string[]>();
    for (const node of workflow.nodes) {
      depMap.set(node.id, []);
    }
    for (const edge of workflow.edges) {
      const deps = depMap.get(edge.target);
      if (deps) {
        deps.push(edge.source);
      }
    }

    const enrichedNodes = workflow.nodes.map(node => {
      const existingDeps = (node as any).dependencies;
      if (existingDeps && existingDeps.length > 0) return node;
      const computed = depMap.get(node.id);
      if (computed && computed.length > 0) {
        return { ...node, dependencies: computed };
      }
      return node;
    });

    const state: WorkflowState = {
      outputs: { 'start': initialInput },
      status: 'running',
      retries: {}
    };

    const completedNodes = new Set<string>();
    const pendingNodes = new Set<string>(enrichedNodes.map(n => n.id));

    try {
      while (pendingNodes.size > 0) {
        const readyNodes = enrichedNodes.filter(node => {
          if (!pendingNodes.has(node.id)) return false;
          const deps = (node as any).dependencies as string[] | undefined;
          if (!deps || deps.length === 0) return true;
          return deps.every(depId => completedNodes.has(depId));
        });

        if (readyNodes.length === 0 && pendingNodes.size > 0) {
          throw new Error('Deadlock detected in workflow DAG. Check for circular dependencies.');
        }

        await Promise.all(readyNodes.map(async (node) => {
          const nodeLabel = node.label || (node.data as any)?.label || node.id;
          const inputs = ((node as any).dependencies as string[] | undefined)
            ?.map((depId: string) => state.outputs[depId]) || [initialInput];

          if (node.type !== 'agent') {
            onEvent?.({
              type: 'node:start',
              nodeId: node.id,
              nodeLabel,
              timestamp: Date.now(),
            });

            const handler = nodeHandlers.find(h => h.canHandle(node as WorkflowNode));
            if (handler) {
              try {
                const result = await handler.execute(node as WorkflowNode, inputs, userContext);
                state.outputs[node.id] = result.output;
                coordinator.send({
                  type: 'finding',
                  fromAgentId: node.id,
                  data: `Completed. Output: ${result.output.slice(0, 500)}`,
                  timestamp: Date.now(),
                });
                dpa.receiveInteraction({
                  source: node.id,
                  type: 'workflow_step',
                  content: state.outputs[node.id] || '',
                  metadata: { nodeType: node.type, workflowName: workflow.name },
                  timestamp: Date.now(),
                });
                onEvent?.({
                  type: 'node:complete',
                  nodeId: node.id,
                  nodeLabel,
                  output: result.output,
                  timestamp: Date.now(),
                });
              } catch (e: any) {
                state.status = 'failed';
                onEvent?.({
                  type: 'node:error',
                  nodeId: node.id,
                  nodeLabel,
                  error: e.message,
                  timestamp: Date.now(),
                });
                console.error(`   ❌ Node [${node.id}] failed:`, e.message);
                throw e;
              }
            }

            completedNodes.add(node.id);
            pendingNodes.delete(node.id);
            return;
          }

          const coordinationCtx = coordinator.getContextFor(node.id);
          const combinedInput = coordinationCtx
            ? `${coordinationCtx}\n\n---\n\n${inputs.join('\n\n---\n\n')}`
            : inputs.join('\n\n---\n\n');

          let lastError: Error | undefined;
          for (let attempt = 1; attempt <= 3; attempt++) {
            try {
              if (attempt === 1) {
                onEvent?.({
                  type: 'node:start',
                  nodeId: node.id,
                  nodeLabel,
                  timestamp: Date.now(),
                });
              }

              const result = await this.agentRunner.runStep(node as any, combinedInput, userContext);

              state.outputs[node.id] = result;
              completedNodes.add(node.id);
              pendingNodes.delete(node.id);

              coordinator.send({
                type: 'finding',
                fromAgentId: node.id,
                data: `Completed task. Output: ${result.slice(0, 500)}`,
                timestamp: Date.now(),
              });

              if ((node.data as any)?.dependsOn) {
                coordinator.send({
                  type: 'completion_flag',
                  fromAgentId: node.id,
                  toAgentId: (node.data as any).dependsOn,
                  data: `Dependency ${node.id} completed`,
                  timestamp: Date.now(),
                });
              }

              dpa.receiveInteraction({
                source: node.id,
                type: 'agent_output',
                content: state.outputs[node.id] || '',
                metadata: { nodeType: node.type, workflowName: workflow.name },
                timestamp: Date.now(),
              });

              onEvent?.({
                type: 'node:complete',
                nodeId: node.id,
                nodeLabel,
                output: result,
                timestamp: Date.now(),
              });

              console.log(`   ✓ Node [${node.id}] completed.`);
              return;
            } catch (e: any) {
              lastError = e;
              if (attempt < 3) {
                state.retries[node.id] = (state.retries[node.id] || 0) + 1;
                const delayMs = attempt === 1 ? 1000 : 2000;
                console.log(`   ⚠ Node [${node.id}] failed (attempt ${attempt}/3). Retrying in ${delayMs}ms...`);
                await new Promise(resolve => setTimeout(resolve, delayMs));
              }
            }
          }

          console.error(`   ❌ Node [${node.id}] failed after 3 attempts:`, (lastError as Error).message);
          onEvent?.({
            type: 'node:error',
            nodeId: node.id,
            nodeLabel,
            error: (lastError as Error).message,
            timestamp: Date.now(),
          });
          completedNodes.add(node.id);
          pendingNodes.delete(node.id);
        }));
      }

      state.status = 'completed';
    } catch (e: any) {
      if (e.message?.startsWith('Deadlock')) {
        throw e;
      }
      if (state.status !== 'failed') {
        state.status = 'failed';
      }
      state.outputs['_error'] = e.message;
    }

    onEvent?.({
      type: 'workflow:complete',
      status: state.status,
      results: state.outputs,
      timestamp: Date.now(),
    });

    const MAX_FALLBACK_DEPTH = 3;
    if (state.status === 'failed' && workflow.errorFallbackId) {
      const visitedWorkflows = new Set<string>();
      try {
        await this.executeErrorFallback(workflow, state, userContext, onEvent, visitedWorkflows, 0, MAX_FALLBACK_DEPTH);
      } catch (fbErr) {
        console.error('[WorkflowParser] Error fallback also failed:', fbErr);
      }
    }

    console.log(`[WorkflowParser] Workflow '${workflow.name}' finished with status: ${state.status}`);
    return state;
  }

  private async executeErrorFallback(
    workflow: WorkflowDefinition,
    state: WorkflowState,
    userContext: UserContext & { delegateKey: string; accountId: string },
    onEvent: ((event: WorkflowEvent) => void) | undefined,
    visitedWorkflows: Set<string>,
    depth: number,
    maxDepth: number
  ): Promise<void> {
    if (depth >= maxDepth) {
      console.error(`[WorkflowParser] Max fallback depth (${maxDepth}) reached. Stopping fallback chain.`);
      return;
    }

    if (!workflow.errorFallbackId) return;

    if (visitedWorkflows.has(workflow.errorFallbackId)) {
      console.error(`[WorkflowParser] Cycle detected: ${workflow.id || workflow.name} -> ${workflow.errorFallbackId}. Stopping fallback chain.`);
      return;
    }
    visitedWorkflows.add(workflow.errorFallbackId);

    const fallbackWorkflow = await db.getWorkflow(workflow.errorFallbackId);
    if (!fallbackWorkflow) {
      console.error(`[WorkflowParser] Error fallback workflow '${workflow.errorFallbackId}' not found.`);
      return;
    }

    console.log(`[WorkflowParser] Running error fallback (depth ${depth + 1}): ${fallbackWorkflow.name}`);
    const errorContext = {
      originalWorkflow: workflow.name,
      error: state.outputs['_error'] || 'Unknown error',
      state,
    };
    const fallbackState = await this.execute(fallbackWorkflow, JSON.stringify(errorContext), userContext, onEvent);

    if (fallbackState.status === 'failed' && fallbackWorkflow.errorFallbackId) {
      await this.executeErrorFallback(fallbackWorkflow, fallbackState, userContext, onEvent, visitedWorkflows, depth + 1, maxDepth);
    }
  }
}
