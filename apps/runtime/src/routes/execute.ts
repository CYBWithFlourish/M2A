import { Router } from 'express';
import { WorkflowDefinitionSchema, WorkflowNode } from '@m2a/sdk';
import { workflowParser, platformAccountId, platformDelegateKey } from '../engine/components.js';
import { db } from '../db.js';
import { authorizeM2AAction } from '../m2a/authz.js';
import { Transaction } from '@mysten/sui/transactions';
import { createSuiClient } from '../config.js';

export const router = Router();

const client = createSuiClient();

function parseJsonField(val: any): string[] {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') try { return JSON.parse(val); } catch { return []; }
  return [];
}

/**
 * POST /api/v1/execute
 * Executes a registered workflow by its ID.
 */
router.post('/', async (req, res) => {
  const runId = `run_${Date.now()}`;
  const startTime = Date.now();
  try {
    const { workflowId, inputs, input, agentWallet, agentId } = req.body;
    if (!workflowId) return res.status(400).json({ error: 'workflowId is required' });

    const workflow = await db.getWorkflow(workflowId);
    if (!workflow) return res.status(404).json({ error: `Workflow '${workflowId}' not found` });

    const initialInput = input || (inputs && inputs.userInput) || 'Start the mission.';

    let agentRecord: any = null;
    if (agentId) {
      const result = await db.query('SELECT * FROM agents WHERE id = $1', [agentId]);
      if (result.rows.length > 0) {
        agentRecord = result.rows[0];
      }
    }

    const resolvedWallet = agentRecord?.wallet_address || agentWallet || platformAccountId;

    const parseJsonField = (val: any): string[] => {
      if (Array.isArray(val)) return val;
      if (typeof val === 'string') try { return JSON.parse(val); } catch { return []; }
      return [];
    };

    const workflowAuthz = await authorizeM2AAction({
      agentId: agentId || workflowId,
      action: 'workflow.execute',
      namespace: 'workflow',
      agentWallet: resolvedWallet,
      protocols: parseJsonField(agentRecord?.protocols),
      tools: parseJsonField(agentRecord?.tools),
    });

    if (!workflowAuthz.allowed) {
      return res.status(403).json({ error: workflowAuthz.reason || 'workflow execution denied' });
    }

    console.log(`[Engine] Triggering execution for registered workflow: ${workflow.name} (${workflowId})`);

    let userContext: Record<string, any>;
    if (agentRecord) {
      userContext = {
        userId: agentRecord.wallet_address,
        accountId: agentRecord.wallet_address,
        delegateKey: agentRecord.wallet_address,
        agentWallet: agentRecord.wallet_address,
        agentId: agentRecord.id,
        agentName: agentRecord.name,
        budgetCap: agentRecord.budget_cap,
        protocols: parseJsonField(agentRecord.protocols),
        tools: parseJsonField(agentRecord.tools),
      };
    } else {
      userContext = {
        accountId: platformAccountId,
        delegateKey: platformDelegateKey,
        agentWallet: agentWallet || null,
      };
    }

    const state = await workflowParser.execute(workflow, initialInput, userContext as any);

    const duration = Date.now() - startTime;
    const nodeResults = workflow.nodes.map((n: WorkflowNode) => ({
      nodeId: n.id,
      status: state.outputs[n.id] ? 'completed' : 'pending',
      output: state.outputs[n.id] || null,
    }));
    await db.query(
      `INSERT INTO execution_history (id, workflow_id, workflow_name, status, node_results, started_at, completed_at, inputs, outputs, run_duration_ms)
       VALUES ($1, $2, $3, $4, $5, to_timestamp($6::double precision / 1000), to_timestamp($7::double precision / 1000), $8, $9, $10)`,
      [runId, workflow.id || workflowId, workflow.name, state.status, JSON.stringify(nodeResults), startTime, Date.now(), JSON.stringify({ input: initialInput }), JSON.stringify(state.outputs), duration]
    );

    return res.json({
      success: true,
      runId,
      workflow: workflow.name,
      status: state.status,
      results: state.outputs
    });
  } catch (error: any) {
    console.error('Execution failed:', error);
    const duration = Date.now() - startTime;
    db.query(
      `INSERT INTO execution_history (id, workflow_id, workflow_name, status, node_results, started_at, completed_at, inputs, outputs, run_duration_ms, error_message)
       VALUES ($1, $2, $3, $4, $5, to_timestamp($6::double precision / 1000), to_timestamp($7::double precision / 1000), $8, $9, $10, $11)`,
      [runId, req.body.workflowId || '', req.body.workflowId || '', 'failed', '[]', startTime, Date.now(), JSON.stringify({ input: req.body.input || (req.body.inputs && req.body.inputs.userInput) || 'Start the mission.' }), '{}', duration, error.message]
    ).catch(() => {});
    return res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/v1/execute/raw
 * Submits a raw graph and executes via the M2A Engine.
 */
router.post('/raw', async (req, res) => {
  const runId = `run_${Date.now()}`;
  const startTime = Date.now();
  try {
    const validation = WorkflowDefinitionSchema.safeParse(req.body.workflow);

    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid Workflow Graph Definition',
        issues: validation.error.issues
      });
    }

    const workflow = validation.data;
    const initialInput = req.body.input || 'Start the mission.';
    const { agentWallet, agentId } = req.body;

    let agentRecord: any = null;
    if (agentId) {
      const result = await db.query('SELECT * FROM agents WHERE id = $1', [agentId]);
      if (result.rows.length > 0) {
        agentRecord = result.rows[0];
      }
    }

    const resolvedWallet = agentRecord?.wallet_address || agentWallet || platformAccountId;

    const workflowAuthz = await authorizeM2AAction({
      agentId: agentId || workflow.name,
      action: 'workflow.execute',
      namespace: 'workflow',
      agentWallet: resolvedWallet,
      protocols: parseJsonField(agentRecord?.protocols),
      tools: parseJsonField(agentRecord?.tools),
    });

    if (!workflowAuthz.allowed) {
      return res.status(403).json({ error: workflowAuthz.reason || 'workflow execution denied' });
    }

    // Persist the workflow so it can be called by ID later (e.g. from MCP)
    await db.saveWorkflow(workflow);

    console.log(`[Engine] Triggering live execution for: ${workflow.name}`);

    let userContext: Record<string, any>;
    if (agentRecord) {
      userContext = {
        userId: agentRecord.wallet_address,
        accountId: agentRecord.wallet_address,
        delegateKey: agentRecord.wallet_address,
        agentWallet: agentRecord.wallet_address,
        agentId: agentRecord.id,
        agentName: agentRecord.name,
        budgetCap: agentRecord.budget_cap,
        protocols: parseJsonField(agentRecord.protocols),
        tools: parseJsonField(agentRecord.tools),
      };
    } else {
      userContext = {
        accountId: platformAccountId,
        delegateKey: platformDelegateKey,
        agentWallet: agentWallet || null,
      };
    }

    const state = await workflowParser.execute(workflow as any, initialInput, userContext as any);

    const duration = Date.now() - startTime;
    const nodeResults = workflow.nodes.map((n: WorkflowNode) => ({
      nodeId: n.id,
      status: state.outputs[n.id] ? 'completed' : 'pending',
      output: state.outputs[n.id] || null,
    }));
    await db.query(
      `INSERT INTO execution_history (id, workflow_id, workflow_name, status, node_results, started_at, completed_at, inputs, outputs, run_duration_ms)
       VALUES ($1, $2, $3, $4, $5, to_timestamp($6::double precision / 1000), to_timestamp($7::double precision / 1000), $8, $9, $10)`,
      [runId, workflow.id, workflow.name, state.status, JSON.stringify(nodeResults), startTime, Date.now(), JSON.stringify({ input: initialInput }), JSON.stringify(state.outputs), duration]
    );

    return res.json({
      success: true,
      runId,
      workflow: workflow.name,
      status: state.status,
      results: state.outputs
    });

  } catch (error: any) {
    console.error('Execution engine failed:', error);
    const duration = Date.now() - startTime;
    db.query(
      `INSERT INTO execution_history (id, workflow_id, workflow_name, status, node_results, started_at, completed_at, inputs, outputs, run_duration_ms, error_message)
       VALUES ($1, $2, $3, $4, $5, to_timestamp($6::double precision / 1000), to_timestamp($7::double precision / 1000), $8, $9, $10, $11)`,
      [runId, req.body.workflow?.id || '', req.body.workflow?.name || '', 'failed', '[]', startTime, Date.now(), JSON.stringify({ input: req.body.input || 'Start the mission.' }), '{}', duration, error.message]
    ).catch(() => {});
    return res.status(500).json({
      error: error.message || 'Internal execution fault',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * POST /api/v1/execute/raw/stream
 * Executes a raw workflow and streams per-node events via SSE.
 */
router.post('/raw/stream', async (req, res) => {
  try {
    const validation = WorkflowDefinitionSchema.safeParse(req.body.workflow);

    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid Workflow Graph Definition',
        issues: validation.error.issues
      });
    }

    const workflow = validation.data;
    const initialInput = req.body.input || 'Start the mission.';
    const { agentWallet, agentId } = req.body;

    let agentRecord: any = null;
    if (agentId) {
      const result = await db.query('SELECT * FROM agents WHERE id = $1', [agentId]);
      if (result.rows.length > 0) {
        agentRecord = result.rows[0];
      }
    }

    const resolvedWallet = agentRecord?.wallet_address || agentWallet || platformAccountId;

    const workflowAuthz = await authorizeM2AAction({
      agentId: agentId || workflow.name,
      action: 'workflow.execute',
      namespace: 'workflow',
      agentWallet: resolvedWallet,
      protocols: parseJsonField(agentRecord?.protocols),
      tools: parseJsonField(agentRecord?.tools),
    });

    if (!workflowAuthz.allowed) {
      return res.status(403).json({ error: workflowAuthz.reason || 'workflow execution denied' });
    }

    await db.saveWorkflow(workflow);

    console.log(`[Engine] Triggering SSE streaming execution for: ${workflow.name}`);

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    let userContext: Record<string, any>;
    if (agentRecord) {
      userContext = {
        userId: agentRecord.wallet_address,
        accountId: agentRecord.wallet_address,
        delegateKey: agentRecord.wallet_address,
        agentWallet: agentRecord.wallet_address,
        agentId: agentRecord.id,
        agentName: agentRecord.name,
        budgetCap: agentRecord.budget_cap,
        protocols: parseJsonField(agentRecord.protocols),
        tools: parseJsonField(agentRecord.tools),
      };
    } else {
      userContext = {
        accountId: platformAccountId,
        delegateKey: platformDelegateKey,
        agentWallet: agentWallet || null,
      };
    }

    req.on('close', () => {
      console.log('[SSE] Client disconnected');
    });

    try {
      await workflowParser.execute(
        workflow as any,
        initialInput,
        userContext as any,
        (event) => {
          res.write(`data: ${JSON.stringify(event)}\n\n`);
        }
      );
    } catch (e: any) {
      res.write(`data: ${JSON.stringify({ type: 'workflow:complete', status: 'failed', results: {}, timestamp: Date.now() })}\n\n`);
    }

    res.end();
  } catch (error: any) {
    console.error('SSE execution failed:', error);
    if (!res.headersSent) {
      return res.status(500).json({ error: error.message });
    }
    res.end();
  }
});

router.get('/history', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM execution_history ORDER BY started_at DESC LIMIT 50'
    );
    res.json(result.rows);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/history/workflow/:workflowId', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM execution_history WHERE workflow_id = $1 ORDER BY started_at DESC LIMIT 50',
      [req.params.workflowId]
    );
    res.json(result.rows);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/history/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM execution_history WHERE id = $1', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Execution not found' });
    res.json(result.rows[0]);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * POST /api/v1/execute/sign
 * Signs and executes a transaction with an agent's zkLogin wallet.
 */
router.post('/trigger/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const allWorkflows = await db.listWorkflows();
    const workflow = allWorkflows.find((w: any) => {
      const nodes = w.definition?.nodes || w.nodes || [];
      return nodes.some((n: any) => n.data?.webhookToken === token);
    });

    if (!workflow) return res.status(404).json({ error: 'No workflow found for this webhook' });

    const fullWorkflow = await db.getWorkflow(workflow.id);
    if (!fullWorkflow.deployed) return res.status(403).json({ error: 'Workflow is not deployed' });
    const state = await workflowParser.execute(fullWorkflow, JSON.stringify(req.body), {
      accountId: platformAccountId,
      delegateKey: platformDelegateKey,
      agentWallet: null,
    } as any);

    res.json({ triggered: true, workflow: fullWorkflow.name, results: state.outputs });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * POST /api/v1/execute/sign
 * Signs and executes a transaction with an agent's zkLogin wallet.
 */
router.get('/history/:id/chain', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM execution_history WHERE id = $1', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Execution not found' });

    const execution = result.rows[0];
    const nodeResults = execution.node_results || [];
    const workflow = await db.getWorkflow(execution.workflow_id);

    res.json({
      runId: execution.id,
      workflowName: execution.workflow_name,
      status: execution.status,
      startedAt: execution.started_at,
      duration: execution.run_duration_ms,
      nodes: (workflow?.nodes || []).map((n: any) => {
        const nodeResult = (nodeResults as any[]).find((r: any) => r.nodeId === n.id);
        return {
          nodeId: n.id,
          type: n.type,
          label: n.data?.label || n.type,
          executed: !!nodeResult,
          status: nodeResult?.status || 'pending',
        };
      }),
      edges: workflow?.edges || [],
    });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.post('/sign', async (req, res) => {
  try {
    const { txBytes, agentWallet, secretKey, proofPoints, issBase64Details, headerBase64, salt, maxEpoch } = req.body;

    if (!txBytes || !agentWallet || !secretKey) {
      return res.status(400).json({ error: 'txBytes, agentWallet, and secretKey are required' });
    }

    // For zkLogin: construct a zkLogin signature
    const { Ed25519Keypair } = await import('@mysten/sui/keypairs/ed25519');
    const { getZkLoginSignature } = await import('@mysten/sui/zklogin');
    const { decodeSuiPrivateKey } = await import('@mysten/sui/cryptography');

    // Reconstruct keypair from secret key
    let secretKeyBytes: Uint8Array;
    if (secretKey.startsWith('suiprivkey')) {
      secretKeyBytes = decodeSuiPrivateKey(secretKey).secretKey;
    } else if (typeof secretKey === 'string' && secretKey.length === 64) {
      const { fromHex } = await import('@mysten/sui/utils');
      secretKeyBytes = fromHex(secretKey);
    } else {
      secretKeyBytes = new Uint8Array(secretKey);
    }
    const keypair = Ed25519Keypair.fromSecretKey(secretKeyBytes);

    // Sign the transaction bytes
    const { fromHex } = await import('@mysten/sui/utils');
    const bytes = typeof txBytes === 'string' ? fromHex(txBytes) : new Uint8Array(txBytes);
    const { signature } = await keypair.signTransaction(bytes);

    let finalSignature = signature;

    // If zkLogin proofs are provided, wrap the signature
    if (proofPoints && issBase64Details && headerBase64 && salt) {
      const zkSignature = getZkLoginSignature({
        inputs: {
          proofPoints,
          issBase64Details,
          headerBase64,
          addressSeed: '',
        },
        maxEpoch: Number(maxEpoch || 100),
        userSignature: signature,
      });

      finalSignature = zkSignature;
    }

    // Execute the transaction
    const result = await client.executeTransaction({
      transaction: txBytes,
      signatures: [finalSignature],
      include: { effects: true, events: true },
    });

    const txResult = result.$kind === 'Transaction' ? result.Transaction : result.FailedTransaction;
    if (result.$kind === 'Transaction') {
      await client.waitForTransaction({ digest: txResult.digest });
    }

    res.json({
      digest: txResult.digest,
      status: result.$kind === 'Transaction' ? 'success' : 'failed',
      effects: txResult.effects,
      events: result.$kind === 'Transaction' ? txResult.events : undefined,
    });
  } catch (error: any) {
    console.error('Sign & execute failed:', error);
    res.status(500).json({ error: error.message });
  }
});
