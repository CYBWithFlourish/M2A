import { Router } from 'express';
import { dpa } from '../engine/DataProcessingAgent.js';
import { db } from '../db.js';

export const router = Router();

router.get('/', async (req, res) => {
  try {
    const namespace = req.query.namespace as string;
    const query = namespace
      ? 'SELECT * FROM datasets WHERE namespace = $1 ORDER BY created_at DESC'
      : 'SELECT * FROM datasets ORDER BY created_at DESC LIMIT 100';
    const params = namespace ? [namespace] : [];
    const result = await db.query(query, params);
    res.json({ count: result.rows.length, datasets: result.rows });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const stats = dpa.getStats();
    const dbResult = await db.query('SELECT namespace, COUNT(*) as count FROM datasets GROUP BY namespace');
    res.json({ ...stats, byNamespace: dbResult.rows });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const result = await db.query('SELECT * FROM datasets WHERE category = $1 ORDER BY created_at DESC', [category]);
    res.json({ category, count: result.rows.length, datasets: result.rows });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/generate', async (req, res) => {
  try {
    const { category, namespace } = req.body;
    const dataset = await dpa.generateDataset({ category });
    if (!dataset) {
      return res.json({ generated: false, reason: 'Insufficient interactions for claim generation' });
    }
    const blobId = await dpa.storeDataset(dataset);
    if (namespace) {
      await db.query(
        `INSERT INTO datasets (id, namespace, category, claim_count, sample_size, source_domain, privacy_score, walrus_blob_id, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (id) DO NOTHING`,
        [dataset.id, namespace, dataset.category, dataset.claims.length, dataset.metadata.sampleSize, dataset.metadata.sourceDomain, dataset.privacyScore, blobId, JSON.stringify(dataset.metadata)]
      );
    }
    res.json({ generated: true, dataset, walrusBlobId: blobId });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/categorize-and-store', async (req, res) => {
  try {
    const { namespace } = req.body;
    const results = await dpa.categorizeAndStore();
    if (namespace) {
      for (const r of results) {
        await db.query(
          `INSERT INTO datasets (id, namespace, category, claim_count, sample_size, source_domain, privacy_score, walrus_blob_id, metadata)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (id) DO NOTHING`,
          [`dataset_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, namespace, r.category, 0, 0, '', 0, r.blobId, '{}']
        );
      }
    }
    res.json({ success: true, stored: results });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
