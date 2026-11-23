import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { randomUUID } from 'crypto';
import { getDb } from '../db.js';

const router = Router();

const getLocalDateStr = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

router.get('/', authenticate, async (req, res) => {
  const db = await getDb();
  const today = getLocalDateStr();
  const { history, userId, date } = req.query;

  let records = db.data.attendance || [];

  if (req.user.role === 'intern') {
    records = records.filter(a => a.userId === req.user.id);
    if (!history) {
      records = records.filter(a => a.date === today);
    }
  } else {
    // Admin query
    if (userId) {
      records = records.filter(a => a.userId === userId);
    }
    if (date) {
      records = records.filter(a => a.date === date);
    } else if (!history) {
      records = records.filter(a => a.date === today);
    }
  }

  // Sort descending: latest date first, latest checkIn time first
  records = [...records].sort((a, b) => {
    const dateComp = b.date.localeCompare(a.date);
    if (dateComp !== 0) return dateComp;
    return (b.checkIn || '').localeCompare(a.checkIn || '');
  });

  res.json(records);
});

router.post('/checkin', authenticate, async (req, res) => {
  const db = await getDb();
  const today = getLocalDateStr();
  const nowIso = new Date().toISOString();

  // Ensure user cannot check in multiple times on the same date
  const existing = db.data.attendance.find(a => a.userId === req.user.id && a.date === today);
  if (existing) {
    return res.status(400).json({
      error: existing.checkOut
        ? 'You have already completed attendance for today'
        : 'You are already checked in for today'
    });
  }

  const record = {
    id: randomUUID(),
    userId: req.user.id,
    userName: req.user.name,
    date: today,
    checkIn: nowIso,
    checkOut: null,
    durationMinutes: null,
    hoursWorked: null
  };

  db.data.attendance.push(record);
  await db.write();
  res.status(201).json(record);
});

router.post('/checkout', authenticate, async (req, res) => {
  const db = await getDb();
  const today = getLocalDateStr();
  const nowIso = new Date().toISOString();

  const idx = db.data.attendance.findIndex(
    a => a.userId === req.user.id && a.date === today && !a.checkOut
  );

  if (idx === -1) {
    const alreadyCheckedOut = db.data.attendance.find(
      a => a.userId === req.user.id && a.date === today && a.checkOut
    );
    if (alreadyCheckedOut) {
      return res.status(400).json({ error: 'Attendance already closed for today' });
    }
    return res.status(400).json({ error: 'No active check-in found for today. Please check in first.' });
  }

  const record = db.data.attendance[idx];
  record.checkOut = nowIso;

  // Accurate duration calculation
  const diffMs = Math.max(0, new Date(nowIso) - new Date(record.checkIn));
  const durationMinutes = Math.round(diffMs / 60000);
  record.durationMinutes = durationMinutes;
  record.hoursWorked = Number((durationMinutes / 60).toFixed(2));

  await db.write();
  res.json(record);
});

export default router;
