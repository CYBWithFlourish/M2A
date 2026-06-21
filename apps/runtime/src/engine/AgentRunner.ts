import { AgentWorkflowNode } from '@m2a/sdk';
import { providers } from './providers/ProviderRegistry.js';
import { MemoryRouter } from './MemoryRouter.js';
import type { UserContext } from './MemoryRouter.js';
import { toolRegistry } from './tools/index.js';
import { authorizeM2AAction } from '../m2a/authz.js';
import { dpa } from './DataProcessingAgent.js';

function parseToolCalls(text: string): Array<{ name: string; parameters: Record<string, unknown> }> {
  const calls: Array<{ name: string; parameters: Record<string, unknown> }> = [];

  // Strategy 1: Markdown fenced code blocks (```tool or ```json)
  const fenceRegex = /```(?:tool|json)?\s*\n?(\{[\s\S]*?\})\s*\n?```/g;
  let match;
  while ((match = fenceRegex.exec(text)) !== null) {
    try {
      const parsed = JSON.parse(match[1]);
      if (parsed && typeof parsed === 'object' && parsed.name && parsed.parameters) {
        calls.push({ name: parsed.name, parameters: parsed.parameters });
      }
    } catch {
      // skip malformed JSON in fenced blocks
    }
  }

  // Strategy 2: XML-style <tool> tags
  const xmlRegex = /<tool>([\s\S]*?)<\/tool>/g;
  while ((match = xmlRegex.exec(text)) !== null) {
    try {
      const parsed = JSON.parse(match[1].trim());
      if (parsed && typeof parsed === 'object' && parsed.name && parsed.parameters) {
        if (!calls.some(c => c.name === parsed.name)) {
          calls.push({ name: parsed.name, parameters: parsed.parameters });
        }
      }
    } catch {
      // skip malformed XML content
    }
  }

  // Strategy 3: Bare JSON object at start of line with tool signature
  const jsonLineRegex = /^\{[\s\S]*?"name"[\s\S]*?"parameters"[\s\S]*?\}/gm;
  while ((match = jsonLineRegex.exec(text)) !== null) {
    try {
      const parsed = JSON.parse(match[0]);
      if (parsed && typeof parsed === 'object' && parsed.name && parsed.parameters) {
        if (!calls.some(c => c.name === parsed.name)) {
          calls.push({ name: parsed.name, parameters: parsed.parameters });
        }
      }
    } catch {
      // skip
    }
  }

  return calls;
}

// Backward compatibility: parse old tool_call wrapper format
function parseLegacyToolCalls(text: string): Array<{ name: string; parameters: Record<string, unknown> }> {
  const calls: Array<{ name: string; parameters: Record<string, unknown> }> = [];
  const legacyRegex = /\{"tool_call":\s*\{[^}]*\}\}/gs;
  let match;
  while ((match = legacyRegex.exec(text)) !== null) {
    try {
      const parsed = JSON.parse(match[0]);
      if (parsed.tool_call?.name) {
        calls.push({
          name: parsed.tool_call.name,
          parameters: parsed.tool_call.args || parsed.tool_call.parameters || {},
        });
      }
    } catch {
      // skip
    }
  }
  return calls;
}

export interface AgentMetadata {
  creator: string;
  version: string;
  revenueSplit: number; // percentage (0-100)
  budgetLimit?: number; // in mist/sui
}

export class AgentRunner {
  constructor(private memoryRouter: MemoryRouter) {}

  async runStep(
    node: AgentWorkflowNode, 
    userInput: string, 
    userContext: UserContext & { delegateKey: string; accountId: string },
    metadata?: AgentMetadata,
    onToken?: (token: string) => void
  ): Promise<string> {
    console.log(`[AgentRunner] Dispatching Node [${node.id}] (Tools: ${node.tools?.length || 0})...`);

    const stepAuthz = await authorizeM2AAction({
      agentId: node.id,
      action: 'agent.runStep',
      namespace: node.memory_tier?.write?.[0] || node.memory_tier?.read?.[0],
      tools: (userContext as any).tools,
      protocols: (userContext as any).protocols,
    });

    if (!stepAuthz.allowed) {
      throw new Error(stepAuthz.reason || `agent ${node.id} is not allowed to run`);
    }

    const context = await this.memoryRouter.hydrateContext(node.memory_tier, userInput, userContext);
    const modelName = node.model || (node.data as any)?.model || 'llama-3.3-70b-versatile';
    const role = node.role || (node.data as any)?.role || (node.data as any)?.directives || 'You are a helpful assistant.';
    const tools = node.tools || (node.data as any)?.tools || [];
    const nodeData: any = node.data || {};
    const provider = providers.resolveProviderForModel(modelName);

    // 1. Resolve Tools
    const availableTools = (tools || []).map(name => toolRegistry.getTool(name)).filter(Boolean);
    const toolDefinitions = availableTools.map(t => ({
      name: t?.name,
      description: t?.description,
      parameters: t?.parameters
    }));

    const toolPrompt = availableTools.length > 0 
      ? `\n\n### AVAILABLE TOOLS ###\nYou can use the following tools by outputting a JSON object with "name" and "parameters" fields:\n\n\`\`\`json\n{"name": "tool_name", "parameters": {...}}\n\`\`\`\n\nTools:\n${JSON.stringify(toolDefinitions, null, 2)}`
      : '';

    let currentMessages: any[] = [
      { 
        role: 'system', 
        content: `${role}\n\n### HISTORICAL CONTEXT (via MemWal) ###\n${context}${toolPrompt}` 
      },
      { 
        role: 'user', 
        content: userInput 
      }
    ];

    let totalTokensUsed = 0;
    const MAX_TOOL_LOOPS = parseInt(process.env.AGENT_RUNNER_MAX_LOOPS || '25', 10);
    let toolLoopCount = 0;

    while (toolLoopCount < MAX_TOOL_LOOPS) {
      const result = await provider.generate(currentMessages, { model: modelName, temperature: 0.7 });
      totalTokensUsed += result.usage?.totalTokens ?? 0;
      const text = result.text;

      // Emit tokens for streaming if callback is provided
      if (onToken) {
        onToken(text);
      }

      // 2. Check for Tool Call (robust parser)
      let toolCalls = parseToolCalls(text);
      if (toolCalls.length === 0) {
        toolCalls = parseLegacyToolCalls(text);
      }
      let toolExecuted = false;
      for (const call of toolCalls) {
        const tool = toolRegistry.getTool(call.name);
        if (tool) {
          const toolAuthz = await authorizeM2AAction({
            agentId: node.id,
            action: 'tool.execute',
            namespace: node.memory_tier?.write?.[0] || node.memory_tier?.read?.[0],
            tool: call.name,
            tools: (userContext as any).tools,
            protocols: (userContext as any).protocols,
          });

          if (!toolAuthz.allowed) {
            throw new Error(toolAuthz.reason || `tool ${call.name} is not allowed`);
          }

          console.log(`   🛠️  Executing tool: ${call.name}`);
          const toolResult = await tool.execute(call.parameters, userContext);
          
          currentMessages.push({ role: 'assistant', content: text });
          currentMessages.push({ role: 'user', content: `Tool result for ${call.name}: ${JSON.stringify(toolResult)}` });

          toolLoopCount++;
          if (toolLoopCount > MAX_TOOL_LOOPS) {
            currentMessages.push({ role: 'assistant', content: "I've reached the maximum number of tool calls. Here's what I've done so far..." });
            break;
          }
          toolExecuted = true;
          break; // Execute one tool call per loop
        }
      }
      if (toolLoopCount > MAX_TOOL_LOOPS) break;
      if (toolExecuted) {
        continue;
      }

      // 3. Persist result back to MemWal (if configured)
      if ((node.memory_tier?.write?.length ?? 0) > 0) {
        await this.memoryRouter.saveArtifacts(node.memory_tier, text, userContext);
      }

      dpa.receiveInteraction({
        source: node.id,
        type: 'agent_output',
        content: text,
        metadata: { model: modelName, toolCalls: toolLoopCount, role: node.role },
        timestamp: Date.now(),
      });

      console.log(`[AgentRunner] Total tokens used: ${totalTokensUsed}`);
      return text;
    }

    throw new Error(`Max tool loop count (${MAX_TOOL_LOOPS}) reached.`);
  }
}



