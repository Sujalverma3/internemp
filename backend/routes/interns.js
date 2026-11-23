import { Router } from 'express';
import { authenticate, adminOnly } from '../middleware/auth.js';
import { randomUUID } from 'crypto';
import { getDb } from '../db.js';

const router = Router();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.get('/', authenticate, async (req, res) => {
  const db = await getDb();
  const interns = db.data.users.filter(u => u.role === 'intern');
  res.json(interns.map(({ password: _, ...rest }) => rest));
});

router.post('/', authenticate, adminOnly, async (req, res) => {
  const { name, email, password, department = '', startDate = '', status = 'active' } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Intern name is required' });
  }
  if (!email || !EMAIL_REGEX.test(email.trim().toLowerCase())) {
    return res.status(400).json({ error: 'A valid email address is required' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const db = await getDb();
  const existing = db.data.users.find(u => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    return res.status(409).json({ error: 'A user with this email address already exists' });
  }

  const intern = {
    id: randomUUID(),
    name: name.trim(),
    email: cleanEmail,
    password: password && password.trim() ? password.trim() : 'intern123',
    role: 'intern',
    department: department.trim(),
    startDate: startDate || new Date().toISOString().split('T')[0],
    status: status === 'inactive' ? 'inactive' : 'active',
    createdAt: new Date().toISOString()
  };

  db.data.users.push(intern);
  await db.write();

  const { password: _, ...safe } = intern;
  res.status(201).json(safe);
});

router.put('/:id', authenticate, adminOnly, async (req, res) => {
  const db = await getDb();
  const idx = db.data.users.findIndex(u => u.id === req.params.id && u.role === 'intern');
  if (idx === -1) return res.status(404).json({ error: 'Intern not found' });

  const { name, email, password, department, startDate, status } = req.body;
  const current = db.data.users[idx];

  if (email && email.trim().toLowerCase() !== current.email.toLowerCase()) {
    const cleanEmail = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(cleanEmail)) {
      return res.status(400).json({ error: 'A valid email address is required' });
    }
    const duplicate = db.data.users.find(u => u.id !== current.id && u.email.toLowerCase() === cleanEmail);
    if (duplicate) {
      return res.status(409).json({ error: 'A user with this email address already exists' });
    }
    current.email = cleanEmail;
  }

  if (name !== undefined) {
    if (!name.trim()) return res.status(400).json({ error: 'Name cannot be empty' });
    current.name = name.trim();
  }
  if (password && password.trim()) current.password = password.trim();
  if (department !== undefined) current.department = department.trim();
  if (startDate !== undefined) current.startDate = startDate;
  if (status !== undefined) current.status = status === 'inactive' ? 'inactive' : 'active';
  current.updatedAt = new Date().toISOString();

  await db.write();
  const { password: _, ...safe } = current;
  res.json(safe);
});

router.delete('/:id', authenticate, adminOnly, async (req, res) => {
  const db = await getDb();
  const exists = db.data.users.some(u => u.id === req.params.id && u.role === 'intern');
  if (!exists) return res.status(404).json({ error: 'Intern not found' });

  db.data.users = db.data.users.filter(u => u.id !== req.params.id);

  // Unassign any tasks that were assigned to the deleted intern
  if (Array.isArray(db.data.tasks)) {
    db.data.tasks.forEach(t => {
      if (t.assignedTo === req.params.id) {
        t.assignedTo = '';
      }
    });
  }

  await db.write();
  res.json({ success: true, message: 'Intern removed successfully' });
});

export default router;
