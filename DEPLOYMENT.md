# Deployment-Ready Monorepo Layout (Vercel + Render)

This project is organized so frontend and backend deploy independently from the same repository.

## Recommended structure

```txt
.
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

### Option A: run both services together

```bash
npm install
npm run dev
```

### Option B: run separately

```bash
npm run dev:backend
npm run dev:frontend
```

## Environment variable strategy

### Frontend (Vercel)

Set in Vercel project settings:

- `NEXT_PUBLIC_API_BASE_URL=https://<render-service>.onrender.com`

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
