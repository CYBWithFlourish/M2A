import { Router } from 'express';
import { db } from '../db.js';

export const router = Router();

router.get('/executions-over-time', async (req, res) => {
  try {
    const hours = parseInt(req.query.hours as string) || 24;
    const result = await db.query(
      `SELECT date_trunc('hour', started_at) as hour, status, COUNT(*) as count
       FROM execution_history
       WHERE started_at > NOW() - INTERVAL '1 hour' * $1
       GROUP BY hour, status
       ORDER BY hour ASC`,
      [hours]
    );
    
    const series: Record<string, { hour: string; success: number; failed: number }> = {};
    for (const row of result.rows) {
      const hour = new Date(row.hour).toISOString();
      if (!series[hour]) series[hour] = { hour, success: 0, failed: 0 };
      if (row.status === 'completed') series[hour].success += Number(row.count);
      else series[hour].failed += Number(row.count);
    }
    
    res.json(Object.values(series));
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.get('/datasets-by-category', async (req, res) => {
  try {
    const { dpa } = await import('../engine/DataProcessingAgent.js');
    const stats = dpa.getStats();
    res.json(stats);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});
