import { Router } from 'express';
import { dpa } from '../engine/DataProcessingAgent.js';

export const router = Router();

router.get('/', async (req, res) => {
  try {
    const datasets = dpa.getDatasets();
    res.json({
      count: datasets.length,
      datasets: datasets.map(d => ({
        id: d.id,
        category: d.category,
        claimCount: d.claims.length,
        sampleSize: d.metadata.sampleSize,
        sourceDomain: d.metadata.sourceDomain,
        privacyScore: d.privacyScore,
        walrusBlobId: d.walrusBlobId,
        generatedAt: d.metadata.generatedAt,
      })),
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const stats = dpa.getStats();
    res.json(stats);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const all = dpa.getDatasets();
    const filtered = all.filter(d => d.category === category);
    res.json({ category, count: filtered.length, datasets: filtered });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/generate', async (req, res) => {
  try {
    const { category } = req.body;
    const dataset = await dpa.generateDataset({ category });
    if (!dataset) {
      return res.json({ generated: false, reason: 'Insufficient interactions for claim generation' });
    }
    const blobId = await dpa.storeDataset(dataset);
    res.json({ generated: true, dataset, walrusBlobId: blobId });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/categorize-and-store', async (req, res) => {
  try {
    const results = await dpa.categorizeAndStore();
    res.json({ success: true, stored: results });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
