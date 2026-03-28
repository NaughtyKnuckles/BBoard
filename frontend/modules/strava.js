import { notify } from './ui.js';

function metersToKm(meters) {
  return (meters / 1000).toFixed(2);
}

function fmtDate(dateIso) {
  const d = new Date(dateIso);
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

async function fetchJson(url, options) {
  const res = await fetch(url, {
    credentials: 'include',
    ...options
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Request failed');
  return data;
}

function getApiBaseUrl() {
  const fromMeta = document.querySelector('meta[name="novaboard-api-base-url"]')?.getAttribute('content')?.trim();
  if (fromMeta) return fromMeta.replace(/\/$/, '');

  const fromWindow = globalThis?.NOVABOARD_API_BASE_URL?.trim?.();
  if (fromWindow) return fromWindow.replace(/\/$/, '');

  const fromStorage = window.localStorage.getItem('NOVABOARD_API_BASE_URL')?.trim();
  if (fromStorage) return fromStorage.replace(/\/$/, '');

  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:3000';
  }

  return '';
}

function apiUrl(path) {
  const base = getApiBaseUrl();
  return `${base}${path}`;
}

function ensureApiBaseConfigured() {
  const existing = getApiBaseUrl();
  if (existing) return existing;

  const value = window.prompt('Enter your backend API base URL (example: https://your-api.onrender.com)');
  if (!value) return '';

  const normalized = value.trim().replace(/\/$/, '');
  if (!/^https?:\/\//i.test(normalized)) {
    notify('Invalid API URL. Please include http:// or https://.');
    return '';
  }

  window.localStorage.setItem('NOVABOARD_API_BASE_URL', normalized);
  return normalized;
}

export async function initStravaModule() {
  const connectBtn = document.getElementById('strava-connect-btn');
  const refreshBtn = document.getElementById('strava-refresh-btn');
  const disconnectBtn = document.getElementById('strava-disconnect-btn');

  connectBtn?.addEventListener('click', () => {
    const base = ensureApiBaseConfigured();
    if (!base) return;
    window.location.href = `${base}/auth/strava`;
  });

  refreshBtn?.addEventListener('click', async () => {
    await loadStravaActivities();
  });

  disconnectBtn?.addEventListener('click', async () => {
    await fetchJson(apiUrl('/auth/strava/logout'), { method: 'POST' });
    notify('Disconnected from Strava.');
    await loadStravaActivities();
  });

  await loadStravaActivities();
}

export async function loadStravaActivities() {
  const statusEl = document.getElementById('strava-status');
  const listEl = document.getElementById('strava-activities-list');
  const athleteEl = document.getElementById('strava-athlete');
  const connectBtn = document.getElementById('strava-connect-btn');
  const refreshBtn = document.getElementById('strava-refresh-btn');
  const disconnectBtn = document.getElementById('strava-disconnect-btn');

  if (!statusEl || !listEl) return;

  try {
    const base = getApiBaseUrl();
    if (!base) {
      statusEl.textContent = 'Set your backend API URL to enable Strava.';
      listEl.innerHTML = '<div class="empty">Click "Authorize Strava" and provide your Render API URL when prompted.</div>';
      connectBtn.hidden = false;
      refreshBtn.hidden = true;
      disconnectBtn.hidden = true;
      return;
    }

    const status = await fetchJson(apiUrl('/api/strava/status'));

    if (!status.connected) {
      statusEl.textContent = 'Not connected. Connect your Strava account to load activities.';
      athleteEl.textContent = '';
      listEl.innerHTML = '<div class="empty">No Strava activity data yet.</div>';
      connectBtn.hidden = false;
      refreshBtn.hidden = true;
      disconnectBtn.hidden = true;
      return;
    }

    connectBtn.hidden = true;
    refreshBtn.hidden = false;
    disconnectBtn.hidden = false;

    if (status.athlete) {
      athleteEl.textContent = `Connected athlete: ${status.athlete.firstname || ''} ${status.athlete.lastname || ''}`.trim();
    }

    statusEl.textContent = 'Connected. Loading latest activities...';

    const data = await fetchJson(apiUrl('/api/strava/activities?per_page=12'));

    if (!data.activities?.length) {
      listEl.innerHTML = '<div class="empty">No recent activities found.</div>';
      statusEl.textContent = 'Connected, but no recent activities.';
      return;
    }

    listEl.innerHTML = data.activities
      .map(
        (activity) => `
          <article class="item-row">
            <div>
              <strong>${activity.name}</strong>
              <div class="item-meta">${activity.type} • ${fmtDate(activity.start_date_local)}</div>
            </div>
            <div><strong>${metersToKm(activity.distance_meters)} km</strong></div>
          </article>
        `
      )
      .join('');

    statusEl.textContent = `Loaded ${data.activities.length} recent Strava activities.`;
  } catch (error) {
    statusEl.textContent = 'Failed to load Strava activities.';
    listEl.innerHTML = '<div class="empty">Unable to fetch data right now.</div>';
    notify(error.message || 'Strava request failed.');
  }
}
