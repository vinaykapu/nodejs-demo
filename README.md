# Node.js Demo App

A simple Express.js REST API with a full CI/CD pipeline via GitHub Actions, deploying to Render.

## Endpoints

| Method | Path     | Description          |
|--------|----------|----------------------|
| GET    | `/`      | Hello message + meta |
| GET    | `/health`| Health check         |
| GET    | `/items` | Sample items list    |

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
