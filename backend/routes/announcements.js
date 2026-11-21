import { Router } from 'express';
import { authenticate, adminOnly } from '../middleware/auth.js';
import { randomUUID } from 'crypto';
import { getDb } from '../db.js';

const router = Router();

router.get('/', authenticate, async (req, res) => {
  const db = await getDb();
  res.json(db.data.announcements);
});

router.post('/', authenticate, adminOnly, async (req, res) => {
  const db = await getDb();
  const ann = { id: randomUUID(), date: new Date().toISOString().split('T')[0], author: req.user.name, ...req.body };
  db.data.announcements.push(ann);
  await db.write();
  res.status(201).json(ann);
});

router.delete('/:id', authenticate, adminOnly, async (req, res) => {
  const db = await getDb();
  db.data.announcements = db.data.announcements.filter(a => a.id !== req.params.id);
  await db.write();
  res.json({ success: true });
});

export default router;
