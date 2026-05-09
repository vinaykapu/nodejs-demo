const request = require('supertest');
const app = require('../src/index');

beforeEach(() => app.resetTasks());

// ── GET / ────────────────────────────────────────────────
describe('GET /', () => {
  it('returns app info and endpoint list', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body.app).toBe('Task Manager API');
    expect(res.body.endpoints).toBeDefined();
  });
});

// ── GET /health ──────────────────────────────────────────
describe('GET /health', () => {
  it('returns ok status and uptime', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.uptime).toBeDefined();
  });
});

// ── GET /tasks ───────────────────────────────────────────
describe('GET /tasks', () => {
  it('returns all tasks', async () => {
    const res = await request(app).get('/tasks');
    expect(res.statusCode).toBe(200);
    expect(res.body.total).toBe(3);
    expect(res.body.tasks).toHaveLength(3);
  });

  it('filters by status', async () => {
    const res = await request(app).get('/tasks?status=pending');
    expect(res.statusCode).toBe(200);
    expect(res.body.tasks.every(t => t.status === 'pending')).toBe(true);
  });

  it('filters by priority', async () => {
    const res = await request(app).get('/tasks?priority=high');
    expect(res.statusCode).toBe(200);
    expect(res.body.tasks.every(t => t.priority === 'high')).toBe(true);
  });

  it('rejects invalid status filter', async () => {
    const res = await request(app).get('/tasks?status=invalid');
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/Invalid status/);
  });
});

// ── GET /tasks/stats ─────────────────────────────────────
describe('GET /tasks/stats', () => {
  it('returns counts by status and priority', async () => {
    const res = await request(app).get('/tasks/stats');
    expect(res.statusCode).toBe(200);
    expect(res.body.total).toBe(3);
    expect(res.body.byStatus.pending).toBe(1);
    expect(res.body.byStatus['in-progress']).toBe(1);
    expect(res.body.byStatus.done).toBe(1);
  });
});

// ── GET /tasks/:id ───────────────────────────────────────
describe('GET /tasks/:id', () => {
  it('returns a single task', async () => {
    const res = await request(app).get('/tasks/1');
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(1);
    expect(res.body.title).toBe('Buy groceries');
  });

  it('returns 404 for missing task', async () => {
    const res = await request(app).get('/tasks/999');
    expect(res.statusCode).toBe(404);
  });
});

// ── POST /tasks ──────────────────────────────────────────
describe('POST /tasks', () => {
  it('creates a task with defaults', async () => {
    const res = await request(app).post('/tasks').send({ title: 'New task' });
    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe('New task');
    expect(res.body.status).toBe('pending');
    expect(res.body.priority).toBe('medium');
    expect(res.body.id).toBeDefined();
  });

  it('creates a task with all fields', async () => {
    const res = await request(app)
      .post('/tasks')
      .send({ title: 'Urgent task', status: 'in-progress', priority: 'high' });
    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('in-progress');
    expect(res.body.priority).toBe('high');
  });

  it('rejects missing title', async () => {
    const res = await request(app).post('/tasks').send({ status: 'pending' });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/title/);
  });

  it('rejects invalid priority', async () => {
    const res = await request(app).post('/tasks').send({ title: 'Bad', priority: 'critical' });
    expect(res.statusCode).toBe(400);
  });
});

// ── PUT /tasks/:id ───────────────────────────────────────
describe('PUT /tasks/:id', () => {
  it('updates task status', async () => {
    const res = await request(app).put('/tasks/1').send({ status: 'done' });
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('done');
    expect(res.body.updatedAt).toBeDefined();
  });

  it('updates multiple fields', async () => {
    const res = await request(app).put('/tasks/1').send({ title: 'Updated', priority: 'high' });
    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe('Updated');
    expect(res.body.priority).toBe('high');
  });

  it('returns 404 for missing task', async () => {
    const res = await request(app).put('/tasks/999').send({ status: 'done' });
    expect(res.statusCode).toBe(404);
  });
});

// ── DELETE /tasks/:id ────────────────────────────────────
describe('DELETE /tasks/:id', () => {
  it('deletes a task', async () => {
    const res = await request(app).delete('/tasks/1');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Task deleted');

    const check = await request(app).get('/tasks/1');
    expect(check.statusCode).toBe(404);
  });

  it('returns 404 for missing task', async () => {
    const res = await request(app).delete('/tasks/999');
    expect(res.statusCode).toBe(404);
  });
});
