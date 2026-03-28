# NovaBoard + Strava Integration

## 1) Configure Strava app
In your Strava API application settings:
- Set **Authorization Callback Domain** to your host (for local: `localhost`).
- Use callback URL: `http://localhost:3000/auth/strava/callback`.

## 2) Environment variables
Copy `.env.example` to `.env` and fill in values:

```bash
cp .env.example .env
```

Required:
- `STRAVA_CLIENT_ID`
- `STRAVA_CLIENT_SECRET`
- `STRAVA_REDIRECT_URI`
- `SESSION_SECRET`

## 3) Install and run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## 4) Test OAuth + data
1. Go to the **Strava** page in the app.
2. Click **Connect Strava**.
3. Authorize in Strava.
4. You will be redirected to your site.
5. Recent activities are loaded from backend endpoint `/api/strava/activities`.

## Security notes
- Never expose `STRAVA_CLIENT_SECRET` in frontend code.
- Token exchange + refresh is handled only in `server.js`.
- Access and refresh tokens are stored in server-side session only.
