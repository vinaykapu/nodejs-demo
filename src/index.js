const express = require('express');
const app = express();

app.use(express.json());

// In-memory task store
let tasks = [
  { id: 1, title: 'Buy groceries', status: 'pending', priority: 'low', createdAt: new Date().toISOString() },
  { id: 2, title: 'Write project report', status: 'in-progress', priority: 'high', createdAt: new Date().toISOString() },
  { id: 3, title: 'Team standup', status: 'done', priority: 'medium', createdAt: new Date().toISOString() },
];
let nextId = 4;

const VALID_STATUSES = ['pending', 'in-progress', 'done'];
const VALID_PRIORITIES = ['low', 'medium', 'high'];

// ── Root ────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    app: 'Task Manager API',
    version: '2.0.0',
    endpoints: {
      'GET  /tasks': 'List all tasks (filter by ?status= or ?priority=)',
      'POST /tasks': 'Create a task',
      'GET  /tasks/:id': 'Get a task',
      'PUT  /tasks/:id': 'Update a task',
      'DELETE /tasks/:id': 'Delete a task',
      'GET  /tasks/stats': 'Task statistics',
      'GET  /health': 'Health check',
    },
  });
});

// ── Health ──────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime().toFixed(2) + 's' });
});

// ── Stats ───────────────────────────────────────────────
app.get('/tasks/stats', (req, res) => {
  const stats = {
    total: tasks.length,
    byStatus: {
      pending: tasks.filter(t => t.status === 'pending').length,
      'in-progress': tasks.filter(t => t.status === 'in-progress').length,
      done: tasks.filter(t => t.status === 'done').length,
    },
    byPriority: {
      low: tasks.filter(t => t.priority === 'low').length,
      medium: tasks.filter(t => t.priority === 'medium').length,
      high: tasks.filter(t => t.priority === 'high').length,
    },
  };
  res.json(stats);
});

// ── List tasks ──────────────────────────────────────────
app.get('/tasks', (req, res) => {
  let result = [...tasks];
  const { status, priority } = req.query;

  if (status) {
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Use: ${VALID_STATUSES.join(', ')}` });
    }
    result = result.filter(t => t.status === status);
  }

  if (priority) {
    if (!VALID_PRIORITIES.includes(priority)) {
      return res.status(400).json({ error: `Invalid priority. Use: ${VALID_PRIORITIES.join(', ')}` });
    }
    result = result.filter(t => t.priority === priority);
  }

  res.json({ total: result.length, tasks: result });
});

// ── Get one task ────────────────────────────────────────
app.get('/tasks/:id', (req, res) => {
  const task = tasks.find(t => t.id === parseInt(req.params.id));
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.json(task);
});

// ── Create task ─────────────────────────────────────────
app.post('/tasks', (req, res) => {
  const { title, status = 'pending', priority = 'medium' } = req.body;

  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'title is required and must be a non-empty string' });
  }
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Use: ${VALID_STATUSES.join(', ')}` });
  }
  if (!VALID_PRIORITIES.includes(priority)) {
    return res.status(400).json({ error: `Invalid priority. Use: ${VALID_PRIORITIES.join(', ')}` });
  }

  const task = { id: nextId++, title: title.trim(), status, priority, createdAt: new Date().toISOString() };
  tasks.push(task);
  res.status(201).json(task);
});

// ── Update task ─────────────────────────────────────────
app.put('/tasks/:id', (req, res) => {
  const task = tasks.find(t => t.id === parseInt(req.params.id));
  if (!task) return res.status(404).json({ error: 'Task not found' });

  const { title, status, priority } = req.body;

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: 'title must be a non-empty string' });
    }
    task.title = title.trim();
  }
  if (status !== undefined) {
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Use: ${VALID_STATUSES.join(', ')}` });
    }
    task.status = status;
  }
  if (priority !== undefined) {
    if (!VALID_PRIORITIES.includes(priority)) {
      return res.status(400).json({ error: `Invalid priority. Use: ${VALID_PRIORITIES.join(', ')}` });
    }
    task.priority = priority;
  }

  task.updatedAt = new Date().toISOString();
  res.json(task);
});

// ── Delete task ─────────────────────────────────────────
app.delete('/tasks/:id', (req, res) => {
  const index = tasks.findIndex(t => t.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Task not found' });
  const deleted = tasks.splice(index, 1)[0];
  res.json({ message: 'Task deleted', task: deleted });
});

// Export reset helper for test isolation
app.resetTasks = () => {
  tasks = [
    { id: 1, title: 'Buy groceries', status: 'pending', priority: 'low', createdAt: new Date().toISOString() },
    { id: 2, title: 'Write project report', status: 'in-progress', priority: 'high', createdAt: new Date().toISOString() },
    { id: 3, title: 'Team standup', status: 'done', priority: 'medium', createdAt: new Date().toISOString() },
  ];
  nextId = 4;
};

const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, () => console.log(`Task Manager API running on port ${PORT}`));
}

module.exports = app;
