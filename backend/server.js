import express from 'express';
import session from 'express-session';
import dotenv from 'dotenv';
import cors from 'cors';
import fetch from 'node-fetch'; // ensure node-fetch is installed if using node v18 or earlier

dotenv.config();

const app = express();

const {
  PORT = 3000,
  NODE_ENV = 'development',
  SESSION_SECRET,
  STRAVA_CLIENT_ID,
  STRAVA_CLIENT_SECRET,
  STRAVA_REDIRECT_URI,
  FRONTEND_URL,
  CORS_ALLOWED_ORIGINS = ''
} = process.env;

function isPublicHttpsUrl(value = '') {
  try {
    const parsed = new URL(value);
    const isLocalhost = ['localhost', '127.0.0.1'].includes(parsed.hostname);
    return parsed.protocol === 'https:' && !isLocalhost;
  } catch {
    return false;
  }
}

const sessionSecret = SESSION_SECRET || (NODE_ENV !== 'production' ? 'dev-session-secret-change-me' : '');
const stravaEnabled = Boolean(STRAVA_CLIENT_ID && STRAVA_CLIENT_SECRET);

if (!sessionSecret) {
  console.error('Missing SESSION_SECRET in production. Check backend/.env configuration.');
  process.exit(1);
}

if (!stravaEnabled) {
  console.warn('Strava OAuth is disabled. Set STRAVA_CLIENT_ID and STRAVA_CLIENT_SECRET to enable it.');
}

function normalizeOrigin(origin = '') {
  return origin.trim().replace(/\/$/, '');
}

const allowedOrigins = [
  FRONTEND_URL,
  ...CORS_ALLOWED_ORIGINS.split(',').map((origin) => origin.trim())
]
  .map(normalizeOrigin)
  .filter(Boolean);

app.set('trust proxy', 1);
app.use(express.json());
app.use((req, res, next) => {
  const origin = normalizeOrigin(req.headers.origin || '');

  if (origin && (allowedOrigins.length === 0 || allowedOrigins.includes(origin))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  return next();
});
app.use(
  session({
    name: 'novaboard.sid',
    secret: sessionSecret,
    proxy: true,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: NODE_ENV === 'production' || isPublicHttpsUrl(FRONTEND_URL),
      sameSite: NODE_ENV === 'production' || isPublicHttpsUrl(FRONTEND_URL) ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    }
  })
);

app.get('/health', (_req, res) => {
  res.status(200).json({ ok: true, service: 'novaboard-api', stravaEnabled });
});

function getRedirectUri(req) {
  if (STRAVA_REDIRECT_URI) return STRAVA_REDIRECT_URI;
  return `${req.protocol}://${req.get('host')}/auth/strava/callback`;
}

function getStravaAuthUrl(req) {
  const redirectUri = getRedirectUri(req);
  const params = new URLSearchParams({
    client_id: STRAVA_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    approval_prompt: 'auto',
    scope: 'read,activity:read_all'
  });
  return `https://www.strava.com/oauth/authorize?${params.toString()}`;
}

async function exchangeCodeForToken(code) {
  const response = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: STRAVA_CLIENT_ID,
      client_secret: STRAVA_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code'
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Token exchange failed: ${text}`);
  }

  return response.json();
}

async function refreshAccessToken(refreshToken) {
  const response = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: STRAVA_CLIENT_ID,
      client_secret: STRAVA_CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Token refresh failed: ${text}`);
  }

  return response.json();
}

function requireStrava(req, res, next) {
  if (!stravaEnabled) {
    return res.status(503).json({
      error: 'Strava integration is disabled in this environment.'
    });
  }
  return next();
}

async function ensureValidAccessToken(req, res, next) {
  const token = req.session?.stravaToken;
  if (!token) {
    return res.status(401).json({ error: 'Not authenticated with Strava.' });
  }

  const now = Math.floor(Date.now() / 1000);
  if (token.expires_at <= now + 60) {
    try {
      const refreshed = await refreshAccessToken(token.refresh_token);
      req.session.stravaToken = refreshed;
    } catch (error) {
      console.error(error.message);
      return res.status(401).json({ error: 'Unable to refresh Strava token. Reconnect account.' });
    }
  }

  return next();
}

app.get('/auth/strava', requireStrava, (req, res) => {
  res.redirect(getStravaAuthUrl(req));
});

app.get('/auth/strava/callback', requireStrava, async (req, res) => {
  const { code, error } = req.query;

  if (error) {
    return res.redirect(`${FRONTEND_URL || '/'}?strava=denied`);
  }

  if (!code) {
    return res.status(400).send('Missing authorization code.');
  }

  try {
    const tokenData = await exchangeCodeForToken(code);
    req.session.stravaToken = tokenData;
    req.session.stravaAthlete = tokenData.athlete;
    return req.session.save((saveError) => {
      if (saveError) {
        console.error('Failed to persist Strava session:', saveError.message);
        return res.status(500).send('Failed to persist Strava session.');
      }

      return res.redirect(`${FRONTEND_URL || '/'}?strava=connected`);
    });
  } catch (exchangeError) {
    console.error(exchangeError.message);
    return res.status(500).send('Failed to authenticate with Strava.');
  }
});

app.get('/api/strava/status', (req, res) => {
  const connected = !!req.session?.stravaToken;
  res.json({
    connected,
    enabled: stravaEnabled,
    athlete: req.session?.stravaAthlete || null,
    redirect_uri: stravaEnabled ? getRedirectUri(req) : null,
    cookie_mode: {
      secure: NODE_ENV === 'production' || isPublicHttpsUrl(FRONTEND_URL),
      sameSite: NODE_ENV === 'production' || isPublicHttpsUrl(FRONTEND_URL) ? 'none' : 'lax'
    }
  });
});

app.get('/api/strava/activities', requireStrava, ensureValidAccessToken, async (req, res) => {
  const perPage = Number(req.query.per_page || 10);
  const token = req.session.stravaToken;

  try {
    const response = await fetch(`https://www.strava.com/api/v3/athlete/activities?per_page=${perPage}`, {
      headers: {
        Authorization: `Bearer ${token.access_token}`
      }
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Failed to load activities: ${text}`);
    }

    const activities = await response.json();
    const normalized = activities.map((activity) => ({
      id: activity.id,
      name: activity.name,
      type: activity.type,
      start_date_local: activity.start_date_local,
      distance_meters: activity.distance
    }));

    return res.json({ activities: normalized });
  } catch (activityError) {
    console.error(activityError.message);
    return res.status(500).json({ error: 'Could not fetch Strava activities.' });
  }
});

app.post('/auth/strava/logout', (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      console.error('Failed to destroy session:', error.message);
      return res.status(500).json({ error: 'Failed to logout from Strava session.' });
    }
    return res.json({ ok: true });
  });
});

app.listen(PORT, () => {
  console.log(`NovaBoard API running on http://localhost:${PORT}`);
});
