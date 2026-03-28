# Deployment-Ready Monorepo Layout (Vercel + Render)

> This repo currently uses a **static frontend** (HTML/CSS/JS). Vercel handles this natively.

This project is organized so frontend and backend deploy independently from the same repository.

## Recommended structure

```txt
.
├── frontend/                # Static UI deployed to Vercel
├── frontend/                # Next.js app deployed to Vercel
│   ├── package.json
│   ├── vercel.json
│   └── .env.example
├── backend/                 # Express API deployed to Render
│   ├── package.json
│   ├── server.js
│   ├── render.yaml
│   ├── Dockerfile
│   └── .env.example
├── package.json             # Root workspace scripts (local dev)
├── .env.example
└── .gitignore
```

## Local development

### First-time setup

```bash
cp backend/.env.example backend/.env
```

`backend/.env` is optional for local startup now (the API will boot with a development fallback secret), but creating it is recommended.

### Option A (recommended): run both services together
### Option A: run both services together

```bash
npm install
npm run dev
```

- Backend API: `http://localhost:3000`
- Frontend UI: `http://localhost:3001/frontend/`

### Option B: run separately in two terminals

Terminal 1:
```bash
npm run dev:backend
```

Terminal 2:
```bash
npm run dev:frontend
```

Frontend dev now uses a Node static server (`frontend/dev-server.js`), so no framework-specific setup is needed.

### Option B: run separately

```bash
npm run dev:backend
npm run dev:frontend
```

## Environment variable strategy

### Frontend (Vercel)

Set in Vercel project settings:

- `NEXT_PUBLIC_API_BASE_URL=https://<render-service>.onrender.com`

For this static app, use this value in your frontend config/constants where API calls are made.
Only variables prefixed with `NEXT_PUBLIC_` are available in browser-side code.

### Backend (Render)

Set in Render service settings:

- `NODE_ENV=production`
- `PORT=10000` (Render default)
- `FRONTEND_URL=https://<vercel-project>.vercel.app`
- `CORS_ALLOWED_ORIGINS=https://<vercel-project>.vercel.app`
- `SESSION_SECRET=<long-random-secret>`
- `STRAVA_CLIENT_ID=<value>`
- `STRAVA_CLIENT_SECRET=<value>`
- `STRAVA_REDIRECT_URI=https://<render-service>.onrender.com/auth/strava/callback`

## CORS/session notes for split hosting

- Browser requests from Vercel to Render require a CORS allowlist.
- `FRONTEND_URL` and `CORS_ALLOWED_ORIGINS` should include your production domain(s).
- Session cookies across domains require:
  - `secure=true` (already tied to `NODE_ENV=production`)
  - `sameSite='none'` in production (configured in `server.js`)
  - client requests using `credentials: 'include'`

## Deploying frontend to Vercel

1. Push repository to GitHub.
2. In Vercel, **Add New Project** and import the repo.
3. Set **Root Directory** to `frontend`.
4. Build settings (static project):
   - Framework preset: `Other`
   - Root Directory: `frontend`
   - Install Command: `npm install`
   - Build Command: `npm run build`
   - Output Directory: `.`
4. Build settings:
   - Install Command: `npm install`
   - Build Command: `npm run build`
   - Output: auto-detected for Next.js (`.next`).
5. Add environment variables (at least `NEXT_PUBLIC_API_BASE_URL`).
6. Deploy.
7. Add custom domain in Vercel project settings if needed.

## Deploying backend to Render

1. In Render, **New + > Web Service**.
2. Connect the same repository.
3. Set **Root Directory** to `backend`.
4. Set:
   - Build Command: `npm install`
   - Start Command: `npm run start`
5. Add backend environment variables listed above.
6. Set health check path to `/health`.
7. Deploy and verify `https://<render-service>.onrender.com/health`.
8. Add custom domain in Render service settings if needed.

## Linking custom domains

- Frontend domain (example: `app.example.com`) points to Vercel.
- Backend API domain (example: `api.example.com`) points to Render.
- Update:
  - Vercel `NEXT_PUBLIC_API_BASE_URL=https://api.example.com`
  - Render `FRONTEND_URL=https://app.example.com`
  - Render `CORS_ALLOWED_ORIGINS=https://app.example.com`

## Common failure points to avoid

- Wrong project root selected in Vercel/Render.
- Missing environment variables.
- Calling Render from frontend without `credentials: 'include'` when session auth is required.
- Strava callback URL not matching deployed backend URL.
