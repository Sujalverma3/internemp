import { Router } from 'express';
import { authenticate, adminOnly } from '../middleware/auth.js';
import { randomUUID } from 'crypto';
import { getDb } from '../db.js';

const router = Router();

router.get('/', authenticate, async (req, res) => {
  const db = await getDb();
  let tasks = db.data.tasks;
  if (req.user.role === 'intern') {
    tasks = tasks.filter(t => t.assignedTo === req.user.id);
  }
  res.json(tasks);
});

router.post('/', authenticate, adminOnly, async (req, res) => {
  const { title, description = '', assignedTo = '', priority = 'medium', dueDate = '' } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Task title is required' });
  }

  const allowedPriorities = ['low', 'medium', 'high'];
  const validPriority = allowedPriorities.includes(priority) ? priority : 'medium';

  const db = await getDb();
  const task = {
    id: randomUUID(),
    title: title.trim(),
    description: description.trim(),
    assignedTo: assignedTo || '',
    priority: validPriority,
    status: 'pending',
    dueDate: dueDate || '',
    createdAt: new Date().toISOString()
  };

  db.data.tasks.push(task);
  await db.write();
  res.status(201).json(task);
});

router.put('/:id', authenticate, async (req, res) => {
  const db = await getDb();
  const idx = db.data.tasks.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Task not found' });

  const task = db.data.tasks[idx];
  const allowedStatuses = ['pending', 'in-progress', 'completed'];

  if (req.user.role === 'intern') {
    // Technical security barrier: intern can only modify tasks assigned to them
    if (task.assignedTo !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: You cannot modify tasks assigned to another intern' });
    }
    // Intern can only advance/change the status field
    if (!req.body.status || !allowedStatuses.includes(req.body.status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}` });
    }
    task.status = req.body.status;
    task.updatedAt = new Date().toISOString();
  } else if (req.user.role === 'admin') {
    // Admins can update all task metadata
    const { title, description, assignedTo, priority, dueDate, status } = req.body;
    if (title !== undefined) {
      if (!title.trim()) return res.status(400).json({ error: 'Title cannot be empty' });
      task.title = title.trim();
    }
    if (description !== undefined) task.description = description.trim();
    if (assignedTo !== undefined) task.assignedTo = assignedTo;
    if (priority !== undefined) {
      const allowedPriorities = ['low', 'medium', 'high'];
      if (!allowedPriorities.includes(priority)) {
        return res.status(400).json({ error: 'Invalid priority. Must be low, medium, or high' });
      }
      task.priority = priority;
    }
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (status !== undefined) {
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ error: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}` });
      }
      task.status = status;
    }
    task.updatedAt = new Date().toISOString();
  } else {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  await db.write();
  res.json(task);
});

router.delete('/:id', authenticate, adminOnly, async (req, res) => {
  const db = await getDb();
  const exists = db.data.tasks.some(t => t.id === req.params.id);
  if (!exists) return res.status(404).json({ error: 'Task not found' });

  db.data.tasks = db.data.tasks.filter(t => t.id !== req.params.id);
  await db.write();
  res.json({ success: true, message: 'Task deleted successfully' });
});

export default router;
