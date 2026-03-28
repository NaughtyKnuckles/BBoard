import { useEffect, useMemo, useState } from 'react';
import TopNav from '../components/TopNav.jsx';
import ConnectionCard from '../components/ConnectionCard.jsx';
import StatsGrid from '../components/StatsGrid.jsx';
import ActivitiesTable from '../components/ActivitiesTable.jsx';
import { apiFetch, captureAuthTokenFromUrl, clearAuthToken, redirectToStravaAuth } from '../lib/api.js';

const initialStatus = {
  connected: false,
  enabled: false,
  athlete: null
};

export default function DashboardPage() {
  const [status, setStatus] = useState(initialStatus);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const statusData = await apiFetch('/api/strava/status');
      setStatus(statusData);

      if (!statusData.connected) {
        setActivities([]);
        setLoading(false);
        return;
      }

      const activityData = await apiFetch('/api/strava/activities?per_page=12');
      setActivities(activityData.activities || []);
    } catch (err) {
      setError(err.message || 'Unable to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const hadToken = captureAuthTokenFromUrl();
    const url = new URL(window.location.href);
    const justConnected = url.searchParams.get('strava') === 'connected';
    if (justConnected) {
      url.searchParams.delete('strava');
      window.history.replaceState({}, '', url.toString());
    }
    if (hadToken || justConnected) {
      loadDashboard();
      return;
    }
    loadDashboard();
  }, []);

  const stats = useMemo(() => {
    const totalDistance = activities.reduce((sum, a) => sum + (a.distance_meters || 0), 0) / 1000;
    const activityCount = activities.length;
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const weeklyDistance =
      activities
        .filter((a) => new Date(a.start_date_local).getTime() >= weekAgo)
        .reduce((sum, a) => sum + (a.distance_meters || 0), 0) / 1000;
    const lastActivity = activities[0] ? new Date(activities[0].start_date_local).toLocaleDateString() : '—';

    return {
      totalDistance: totalDistance.toFixed(1),
      activityCount,
      weeklyDistance: weeklyDistance.toFixed(1),
      lastActivity
    };
  }, [activities]);

  const connect = () => {
    try {
      redirectToStravaAuth();
    } catch (err) {
      setError(err.message || 'Unable to open Strava authorization.');
    }
  };

  const refresh = async () => {
    await loadDashboard();
  };

  const disconnect = async () => {
    try {
      await apiFetch('/auth/strava/logout', { method: 'POST' });
      clearAuthToken();
      await loadDashboard();
    } catch (err) {
      setError(err.message || 'Unable to disconnect Strava.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <TopNav connected={status.connected} />
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-6 fade-in">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Dashboard</h1>
          <p className="mt-2 text-sm text-slate-500">A unified view of your Strava performance and recent activity trends.</p>
        </section>

        {error ? (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        ) : null}

        <div className="space-y-6 fade-in">
          <ConnectionCard
            status={status}
            loading={loading}
            onConnect={connect}
            onRefresh={refresh}
            onDisconnect={disconnect}
          />
          <StatsGrid stats={stats} loading={loading} />
          <ActivitiesTable activities={activities} loading={loading} />
        </div>
      </main>
    </div>
  );
}
