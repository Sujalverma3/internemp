import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import internRoutes from './routes/interns.js';
import taskRoutes from './routes/tasks.js';
import attendanceRoutes from './routes/attendance.js';
import announcementRoutes from './routes/announcements.js';

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/interns', internRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/announcements', announcementRoutes);

// Health check endpoint
app.get('/api', (req, res) => {
  res.json({ status: 'ok', name: 'InterneMP API' });
});

const PORT = process.env.PORT || 3001;
const isMain = process.argv[1] && (process.argv[1].endsWith('server.js') || process.argv[1].endsWith('server'));
if (!process.env.VERCEL && isMain) {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

export default app;
