# Task Manager API

A Node.js + Express REST API for managing tasks — with filtering, validation, and stats. Full CI/CD via GitHub Actions, deployed to Render.

## Endpoints

| Method | Path            | Description                              |
|--------|-----------------|------------------------------------------|
| GET    | `/`             | API info + endpoint listing              |
| GET    | `/health`       | Health check + uptime                    |
| GET    | `/tasks`        | List tasks (filter: `?status=` `?priority=`) |
| POST   | `/tasks`        | Create a task                            |
| GET    | `/tasks/:id`    | Get a single task                        |
| PUT    | `/tasks/:id`    | Update a task                            |
| DELETE | `/tasks/:id`    | Delete a task                            |
| GET    | `/tasks/stats`  | Count by status and priority             |

## Task shape

```json
{
  "id": 1,
  "title": "Buy groceries",
  "status": "pending",
  "priority": "low",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

Valid `status` values: `pending`, `in-progress`, `done`
Valid `priority` values: `low`, `medium`, `high`

## Example requests

```bash
# List all tasks
curl https://your-app.onrender.com/tasks

# Filter by status
curl https://your-app.onrender.com/tasks?status=pending

# Create a task
curl -X POST https://your-app.onrender.com/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Deploy the app","priority":"high"}'

# Update a task
curl -X PUT https://your-app.onrender.com/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"status":"done"}'

# Delete a task
curl -X DELETE https://your-app.onrender.com/tasks/1
```

## Local development

```bash
npm install
npm run dev       # starts with nodemon
npm test          # run Jest tests
npm run lint      # run ESLint
```

## Pipeline

Every push to `main`:
1. **Test** — Jest with coverage
2. **Lint** — ESLint
3. **Build** — Docker image pushed to GitHub Container Registry
4. **Deploy** — Render deploy hook triggered

PRs run test + lint only (no deploy).

## Setup secrets (GitHub repo → Settings → Secrets)

| Secret | Value |
|--------|-------|
| `RENDER_DEPLOY_HOOK_URL_NODE` | Your Render deploy hook URL |
