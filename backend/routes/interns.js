import { Router } from 'express';
import { JSONFilePreset } from 'lowdb/node';
import { authenticate, adminOnly } from '../middleware/auth.js';
import { randomUUID } from 'crypto';

const router = Router();

router.get('/', authenticate, async (req, res) => {
  const db = await JSONFilePreset('./db.json', {});
  const interns = db.data.users.filter(u => u.role === 'intern');
  res.json(interns.map(({ password, ...rest }) => rest));
});

router.post('/', authenticate, adminOnly, async (req, res) => {
  const db = await JSONFilePreset('./db.json', {});
  const intern = { id: randomUUID(), role: 'intern', status: 'active', ...req.body };
  db.data.users.push(intern);
  await db.write();
  const { password, ...safe } = intern;
  res.status(201).json(safe);
});

router.put('/:id', authenticate, adminOnly, async (req, res) => {
  const db = await JSONFilePreset('./db.json', {});
  const idx = db.data.users.findIndex(u => u.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.data.users[idx] = { ...db.data.users[idx], ...req.body };
  await db.write();
  const { password, ...safe } = db.data.users[idx];
  res.json(safe);
});

router.delete('/:id', authenticate, adminOnly, async (req, res) => {
  const db = await JSONFilePreset('./db.json', {});
  db.data.users = db.data.users.filter(u => u.id !== req.params.id);
  await db.write();
  res.json({ success: true });
});

export default router;
