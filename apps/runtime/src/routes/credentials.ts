import { Router } from 'express';
import { db } from '../db.js';
import crypto from 'crypto';

export const router = Router();

router.get('/', async (req, res) => {
  try {
    const owner = (req.headers['x-user-address'] as string) || '';
    const creds = await db.listCredentials(owner);
    res.json(creds);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.post('/', async (req, res) => {
  try {
    const owner = (req.headers['x-user-address'] as string) || '';
    const { name, type, data } = req.body;
    if (!name || !data) return res.status(400).json({ error: 'name and data are required' });
    const id = req.body.id || crypto.randomUUID();
    await db.saveCredential({ id, name, type: type || 'api_key', owner, data });
    res.status(201).json({ id, name, type });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.deleteCredential(req.params.id);
    res.json({ deleted: true });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});
