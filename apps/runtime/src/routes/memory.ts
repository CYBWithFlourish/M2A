import { Router } from 'express';
import { memoryRouter, platformDelegateKey, platformAccountId } from '../engine/components.js';
import { createSuiClient } from '../config.js';

export const router = Router();

/**
 * GET /api/v1/memory/pool/:poolName
 * Fetches historical memory insights recorded within shared pools
 */
router.get('/pool/:poolName', async (req, res) => {
  try {
    const { poolName } = req.params;
    
    const query = req.query.q as string || `Recent activity in ${poolName}`;
    const userContext = {
      accountId: platformAccountId,
      delegateKey: platformDelegateKey,
    };

    const context = await memoryRouter.hydrateContext(
      { read: [`pool::${poolName}`], write: [] },
      query,
      userContext as any,
    );

    return res.json({
      namespace: `pool::${poolName}`,
      context,
      query,
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * GET /api/v1/memory/pool/:poolName/history
 * Returns historical memory records from a pool namespace
 */
router.get('/pool/:poolName/history', async (req, res) => {
  try {
    const { poolName } = req.params;
    
    const userContext = {
      accountId: platformAccountId,
      delegateKey: platformDelegateKey,
    };

    const context = await memoryRouter.hydrateContext(
      { read: [`pool::${poolName}`], write: [] },
      'historical records',
      userContext as any,
    );

    return res.json({
      namespace: `pool::${poolName}`,
      records: context,
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/verify/:txDigest', async (req, res) => {
  try {
    const { txDigest } = req.params;
    const client = createSuiClient();

    const result = await client.getTransaction({
      digest: txDigest,
      include: { effects: true, events: true },
    });

    const tx = result.$kind === 'Transaction' ? result.Transaction : result.FailedTransaction;

    res.json({
      verified: true,
      digest: txDigest,
      epoch: tx.epoch,
      effects: tx.effects,
      events: tx.events,
      status: tx.status,
    });
  } catch (e: any) {
    res.status(404).json({ verified: false, error: e.message || 'Transaction not found' });
  }
});
