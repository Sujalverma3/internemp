import { Router } from 'express';
import { JSONFilePreset } from 'lowdb/node';
import { authenticate, adminOnly } from '../middleware/auth.js';
import { randomUUID } from 'crypto';

const router = Router();

router.get('/', authenticate, async (req, res) => {
  const db = await JSONFilePreset('./db.json', {});
  res.json(db.data.announcements);
});

router.post('/', authenticate, adminOnly, async (req, res) => {
  const db = await JSONFilePreset('./db.json', {});
  const ann = { id: randomUUID(), date: new Date().toISOString().split('T')[0], author: req.user.name, ...req.body };
  db.data.announcements.push(ann);
  await db.write();
  res.status(201).json(ann);
});

router.delete('/:id', authenticate, adminOnly, async (req, res) => {
  const db = await JSONFilePreset('./db.json', {});
  db.data.announcements = db.data.announcements.filter(a => a.id !== req.params.id);
  await db.write();
  res.json({ success: true });
});

export default router;
