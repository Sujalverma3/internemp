import { Router } from 'express';
import { authenticate, adminOnly } from '../middleware/auth.js';
import { randomUUID } from 'crypto';
import { getDb } from '../db.js';

const router = Router();

router.get('/', authenticate, async (req, res) => {
  const db = await getDb();
  let tasks = db.data.tasks;
  if (req.user.role === 'intern') tasks = tasks.filter(t => t.assignedTo === req.user.id);
  res.json(tasks);
});

router.post('/', authenticate, adminOnly, async (req, res) => {
  const db = await getDb();
  const task = { id: randomUUID(), status: 'pending', ...req.body };
  db.data.tasks.push(task);
  await db.write();
  res.status(201).json(task);
});

router.put('/:id', authenticate, async (req, res) => {
  const db = await getDb();
  const idx = db.data.tasks.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.data.tasks[idx] = { ...db.data.tasks[idx], ...req.body };
  await db.write();
  res.json(db.data.tasks[idx]);
});

router.delete('/:id', authenticate, adminOnly, async (req, res) => {
  const db = await getDb();
  db.data.tasks = db.data.tasks.filter(t => t.id !== req.params.id);
  await db.write();
  res.json({ success: true });
});

export default router;
