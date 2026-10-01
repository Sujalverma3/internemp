import { Router } from 'express';
import { JSONFilePreset } from 'lowdb/node';
import { authenticate } from '../middleware/auth.js';
import { randomUUID } from 'crypto';

const router = Router();

router.get('/', authenticate, async (req, res) => {
  const db = await JSONFilePreset('./db.json', {});
  const today = new Date().toISOString().split('T')[0];
  let records = db.data.attendance.filter(a => a.date === today);
  if (req.user.role === 'intern') records = records.filter(a => a.userId === req.user.id);
  res.json(records);
});

router.post('/checkin', authenticate, async (req, res) => {
  const db = await JSONFilePreset('./db.json', {});
  const today = new Date().toISOString().split('T')[0];
  const existing = db.data.attendance.find(a => a.userId === req.user.id && a.date === today);
  if (existing) return res.status(400).json({ error: 'Already checked in today' });
  const record = { id: randomUUID(), userId: req.user.id, userName: req.user.name, date: today, checkIn: new Date().toISOString(), checkOut: null };
  db.data.attendance.push(record);
  await db.write();
  res.json(record);
});

router.post('/checkout', authenticate, async (req, res) => {
  const db = await JSONFilePreset('./db.json', {});
  const today = new Date().toISOString().split('T')[0];
  const idx = db.data.attendance.findIndex(a => a.userId === req.user.id && a.date === today && !a.checkOut);
  if (idx === -1) return res.status(400).json({ error: 'No active check-in found' });
  db.data.attendance[idx].checkOut = new Date().toISOString();
  await db.write();
  res.json(db.data.attendance[idx]);
});

export default router;
