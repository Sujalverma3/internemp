import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { getDb } from '../db.js';
import { authenticate, JWT_SECRET } from '../middleware/auth.js';

const router = Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  const cleanEmail = email.trim().toLowerCase();
  const db = await getDb();
  const user = db.data.users.find(u => u.email.toLowerCase() === cleanEmail && u.password === password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = jwt.sign(
    { id: user.id, role: user.role, name: user.name, email: user.email, department: user.department },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      startDate: user.startDate,
      status: user.status
    }
  });
});

router.get('/me', authenticate, async (req, res) => {
  const db = await getDb();
  const user = db.data.users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  const { password: _, ...safe } = user;
  res.json({ user: safe });
});

export default router;
