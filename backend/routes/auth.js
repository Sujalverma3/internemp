import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { getDb } from '../db.js';

const router = Router();
const SECRET = 'internemp_secret_2026';

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const db = await getDb();
  const user = db.data.users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id, role: user.role, name: user.name, email: user.email }, SECRET, { expiresIn: '24h' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

export default router;
