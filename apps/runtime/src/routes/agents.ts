import { Router } from 'express';
import { db } from '../db.js';
import crypto from 'crypto';
import { createSuiClient } from '../config.js';
import { fromBase64 } from '@mysten/sui/utils';

export const router = Router();

interface AgentRecord {
  id: string;
  name: string;
  wallet_address: string;
  owner_address: string;
  budget_cap: number;
  protocols: string[];
  tools: string[];
  on_chain_agent_id: string;
  tx_digest: string;
  created_at: string;
  last_run_at: string | null;
}

// GET /api/v1/agents — list all agents
router.get('/', async (req, res) => {
  try {
    const owner = (req.headers['x-user-address'] as string) || '';
    const query = owner
      ? 'SELECT * FROM agents WHERE owner_address = $1 ORDER BY created_at DESC'
      : 'SELECT * FROM agents ORDER BY created_at DESC';
    const result = await db.query(query, owner ? [owner] : []);
    res.json(result.rows || []);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/v1/agents/:id — get single agent
router.get('/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM agents WHERE id = $1', [req.params.id]);
    if (!result.rows[0]) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    res.json(result.rows[0]);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/v1/agents — relay signed tx to Sui, store agent record
router.post('/', async (req, res) => {
  try {
    const { txBytes, digest, name, walletAddress, ownerAddress, budgetCap, protocols, tools, signatures } = req.body;

    if (!txBytes) {
      return res.status(400).json({ error: 'txBytes is required' });
    }

    const suiClient = createSuiClient();
    const txBytesBytes = fromBase64(txBytes);

    const response = await suiClient.executeTransaction({
      transaction: txBytesBytes,
      signatures: signatures || [],
      include: { effects: true, events: true },
    });

    if (response.$kind !== 'Transaction') {
      return res.status(500).json({ error: 'Transaction failed', details: response.FailedTransaction });
    }

    const txDigest = response.Transaction.digest || digest;

    let onChainAgentId = '';
    const changedObjects: Array<{ objectId: string; idOperation: string | null }> =
      (response.Transaction.effects as any)?.changedObjects || [];
    const created = changedObjects.filter((c) => c.idOperation === 'Created');
    if (created.length > 0) {
      onChainAgentId = created[0].objectId;
    }

    const agentId = crypto.randomUUID();
    const result = await db.query(
      `INSERT INTO agents (id, name, wallet_address, owner_address, budget_cap, protocols, tools, on_chain_agent_id, tx_digest, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
       ON CONFLICT (id) DO UPDATE
       SET on_chain_agent_id = EXCLUDED.on_chain_agent_id,
           tx_digest = EXCLUDED.tx_digest
       RETURNING *`,
      [
        agentId,
        name || `Agent ${agentId.slice(0, 8)}`,
        walletAddress || '',
        ownerAddress || '',
        budgetCap || 0,
        JSON.stringify(protocols || []),
        JSON.stringify(tools || []),
        onChainAgentId,
        txDigest,
      ],
    );

    res.status(201).json({
      id: result.rows[0].id,
      name: result.rows[0].name,
      status: 'active',
      budgetUsed: 0,
      budgetCap: result.rows[0].budget_cap,
      address: result.rows[0].wallet_address,
      onChainId: result.rows[0].on_chain_agent_id,
      txDigest: result.rows[0].tx_digest,
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// PUT /api/v1/agents/:id — update agent metadata
router.put('/:id', async (req, res) => {
  try {
    const { name, budgetCap, protocols, tools } = req.body;
    const result = await db.query(
      `UPDATE agents SET name = COALESCE($1, name), budget_cap = COALESCE($2, budget_cap), protocols = COALESCE($3, protocols), tools = COALESCE($4, tools) WHERE id = $5 RETURNING *`,
      [
        name || null,
        budgetCap != null ? budgetCap : null,
        protocols ? JSON.stringify(protocols) : null,
        tools ? JSON.stringify(tools) : null,
        req.params.id,
      ],
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Agent not found' });
    res.json(result.rows[0]);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/v1/agents/:id/activity — log an activity entry
router.post('/:id/activity', async (req, res) => {
  try {
    const { action, protocol, amountSpent, txDigest, status } = req.body;
    const result = await db.query(
      `INSERT INTO activity_log (agent_id, action, protocol, amount_spent, tx_digest, status)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.params.id, action || '', protocol || '', amountSpent || 0, txDigest || '', status || 0],
    );
    res.status(201).json(result.rows[0]);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/v1/agents/:id/activity — get activity log
router.get('/:id/activity', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM activity_log WHERE agent_id = $1 ORDER BY id DESC LIMIT 50',
      [req.params.id],
    );
    res.json(result.rows || []);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/v1/agents/:id/top-up — record a top-up (just accounting)
router.post('/:id/top-up', async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount) return res.status(400).json({ error: 'amount is required' });
    const result = await db.query(
      'UPDATE agents SET budget_cap = budget_cap + $1 WHERE id = $2 RETURNING *',
      [amount, req.params.id],
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Agent not found' });
    res.json(result.rows[0]);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/v1/agents/:id
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM agents WHERE id = $1', [req.params.id]);
    res.json({ deleted: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
