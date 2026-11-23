import { Router } from 'express';
import { authenticate, adminOnly } from '../middleware/auth.js';
import { randomUUID } from 'crypto';
import { getDb } from '../db.js';

const router = Router();

router.get('/', authenticate, async (req, res) => {
  const db = await getDb();
  const announcements = [...(db.data.announcements || [])].sort((a, b) =>
    (b.createdAt || b.date || '').localeCompare(a.createdAt || a.date || '')
  );
  res.json(announcements);
});

router.post('/', authenticate, adminOnly, async (req, res) => {
  const { title, content } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Announcement title is required' });
  }
  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Announcement content is required' });
  }

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const db = await getDb();
  const ann = {
    id: randomUUID(),
    title: title.trim(),
    content: content.trim(),
    date: todayStr,
    author: req.user.name || 'Admin',
    createdAt: now.toISOString()
  };

  db.data.announcements.push(ann);
  await db.write();
  res.status(201).json(ann);
});

router.delete('/:id', authenticate, adminOnly, async (req, res) => {
  const db = await getDb();
  const exists = db.data.announcements.some(a => a.id === req.params.id);
  if (!exists) return res.status(404).json({ error: 'Announcement not found' });

  db.data.announcements = db.data.announcements.filter(a => a.id !== req.params.id);
  await db.write();
  res.json({ success: true, message: 'Announcement deleted successfully' });
});

export default router;
