const API_BASE_KEY = 'NOVABOARD_API_BASE_URL';
const AUTH_TOKEN_KEY = 'NOVABOARD_AUTH_TOKEN';

export function getApiBaseUrl() {
  const fromMeta = document.querySelector('meta[name="novaboard-api-base-url"]')?.getAttribute('content')?.trim();
  if (fromMeta) return fromMeta.replace(/\/$/, '');

  const fromEnv = import.meta.env.VITE_API_BASE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, '');

  const fromStorage = localStorage.getItem(API_BASE_KEY)?.trim();
  if (fromStorage) return fromStorage.replace(/\/$/, '');

  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
    return 'http://localhost:3000';
  }

  return '';
}

export function captureAuthTokenFromUrl() {
  const url = new URL(window.location.href);
  const authToken = url.searchParams.get('auth_token');
  if (!authToken) return false;

  localStorage.setItem(AUTH_TOKEN_KEY, authToken);
  url.searchParams.delete('auth_token');
  history.replaceState({}, '', url.toString());
  return true;
}

function withHeaders(headers = {}) {
  const merged = new Headers(headers);
  const authToken = localStorage.getItem(AUTH_TOKEN_KEY)?.trim();
  if (authToken) merged.set('Authorization', `Bearer ${authToken}`);
  return merged;
}

export async function apiFetch(path, options = {}) {
  const base = getApiBaseUrl();
  if (!base) throw new Error('API base URL is not configured.');

  const res = await fetch(`${base}${path}`, {
    credentials: 'include',
    ...options,
    headers: withHeaders(options.headers)
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error || 'Request failed');
  }

  return data;
}

export function clearAuthToken() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

export function redirectToStravaAuth() {
  const base = getApiBaseUrl();
  if (!base) throw new Error('API base URL is not configured.');
  window.location.href = `${base}/auth/strava`;
}
