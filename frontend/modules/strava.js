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
  const res = await fetch(url, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Request failed');
  return data;
}

export async function initStravaModule() {
  const connectBtn = document.getElementById('strava-connect-btn');
  const refreshBtn = document.getElementById('strava-refresh-btn');
  const disconnectBtn = document.getElementById('strava-disconnect-btn');

  connectBtn?.addEventListener('click', () => {
    window.location.href = '/auth/strava';
  });

  refreshBtn?.addEventListener('click', async () => {
    await loadStravaActivities();
  });

  disconnectBtn?.addEventListener('click', async () => {
    await fetchJson('/auth/strava/logout', { method: 'POST' });
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
    const status = await fetchJson('/api/strava/status');

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

    const data = await fetchJson('/api/strava/activities?per_page=12');

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
