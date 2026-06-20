import { Router } from 'express';
import { db } from '../db.js';
import crypto from 'crypto';
import { WorkflowDefinitionSchema } from '@m2a/sdk';

export const router = Router();

router.get('/', async (req, res) => {
  try {
    const owner = (req.headers['x-user-address'] as string) || undefined;
    const list = await db.listWorkflows(owner);
    res.json(list);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/deployed', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, name, definition->>'version' as version, deployed, deployed_at, last_triggered_at, trigger_error, trigger_count, definition
       FROM workflows WHERE deployed = true ORDER BY deployed_at DESC`
    );
    const deployments = result.rows.map((row: any) => {
      const def = row.definition || {};
      const triggers = (def.nodes || []).filter((n: any) =>
        ['webhook_trigger', 'schedule_trigger', 'event_trigger', 'form_trigger', 'discord_trigger'].includes(n.type)
      );
      return {
        id: row.id,
        name: row.name,
        version: row.version,
        deployed: row.deployed,
        deployed_at: row.deployed_at,
        last_triggered_at: row.last_triggered_at,
        trigger_error: row.trigger_error,
        trigger_count: row.trigger_count,
        triggers: triggers.map((t: any) => ({
          type: t.type,
          token: t.data?.webhookToken || t.data?.formToken || null,
          cron: t.data?.cronExpression || null,
          eventName: t.data?.eventName || null,
        })),
        nodeCount: (def.nodes || []).length,
      };
    });
    res.json(deployments);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const workflow = await db.getWorkflow(req.params.id);
    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }
    res.json(workflow);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const owner = (req.headers['x-user-address'] as string) || '';
    const body = { ...req.body, owner: req.body.owner || owner };

    if (!body.id) {
      body.id = crypto.randomUUID();
    }

    const parsed = WorkflowDefinitionSchema.safeParse(body);
    if (!parsed.success) {
      return res.status(422).json({
        error: 'Validation failed',
        details: parsed.error.flatten().fieldErrors,
      });
    }

    await db.saveWorkflow(parsed.data);
    res.status(201).json(parsed.data);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const existing = await db.getWorkflow(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    const owner = (req.headers['x-user-address'] as string) || '';
    const body = { ...req.body, id: req.params.id, owner: req.body.owner || owner };

    const parsed = WorkflowDefinitionSchema.safeParse(body);
    if (!parsed.success) {
      return res.status(422).json({
        error: 'Validation failed',
        details: parsed.error.flatten().fieldErrors,
      });
    }

    await db.saveWorkflow(parsed.data);
    res.json(parsed.data);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/:id/schedule', async (req, res) => {
  try {
    const { cronExpression, enabled } = req.body;
    if (!cronExpression) return res.status(400).json({ error: 'cronExpression is required' });

    const workflow = await db.getWorkflow(req.params.id);
    if (!workflow) return res.status(404).json({ error: 'Workflow not found' });

    await db.query(
      `INSERT INTO workflow_schedules (workflow_id, cron_expression, enabled)
       VALUES ($1, $2, $3)
       ON CONFLICT (workflow_id) DO UPDATE
       SET cron_expression = EXCLUDED.cron_expression, enabled = EXCLUDED.enabled`,
      [req.params.id, cronExpression, enabled !== false]
    );

    res.json({ scheduled: true, workflowId: req.params.id, cronExpression });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/:id/schedule', async (req, res) => {
  try {
    await db.query(
      'DELETE FROM workflow_schedules WHERE workflow_id = $1',
      [req.params.id]
    );
    res.json({ unscheduled: true, workflowId: req.params.id });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/:id/deploy', async (req, res) => {
  try {
    const workflow = await db.getWorkflow(req.params.id);
    if (!workflow) return res.status(404).json({ error: 'Not found' });
    await db.query(
      `UPDATE workflows SET deployed = true, deployed_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [req.params.id]
    );
    res.json({ deployed: true, workflowId: req.params.id });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.post('/:id/undeploy', async (req, res) => {
  try {
    await db.query(`UPDATE workflows SET deployed = false WHERE id = $1`, [req.params.id]);
    res.json({ deployed: false, workflowId: req.params.id });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.deleteWorkflow(req.params.id);
    res.json({ deleted: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
