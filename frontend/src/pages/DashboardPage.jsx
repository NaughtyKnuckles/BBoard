import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import TopNav from '../components/TopNav.jsx';
import ConnectionCard from '../components/ConnectionCard.jsx';
import StatsGrid from '../components/StatsGrid.jsx';
import ActivitiesTable from '../components/ActivitiesTable.jsx';
import AnalyticsPanel from '../components/AnalyticsPanel.jsx';
import MyPlanPanel from '../components/MyPlanPanel.jsx';
import { apiFetch, captureAuthTokenFromUrl, clearAuthToken, redirectToStravaAuth } from '../lib/api.js';

const initialStatus = {
  connected: false,
  enabled: false,
  athlete: null
};

function startOfDay(date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export default function DashboardPage() {
  const [status, setStatus] = useState(initialStatus);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastSyncedAt, setLastSyncedAt] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const loadDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const statusData = await apiFetch('/api/strava/status');
      setStatus(statusData);

      if (!statusData.connected) {
        setActivities([]);
        setLastSyncedAt(new Date().toISOString());
        setLoading(false);
        return;
      }

      const activityData = await apiFetch('/api/strava/activities?per_page=40');
      setActivities(activityData.activities || []);
      setLastSyncedAt(new Date().toISOString());
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
    const monthlyAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

    const weeklyDistance =
      activities
        .filter((a) => new Date(a.start_date_local).getTime() >= weekAgo)
        .reduce((sum, a) => sum + (a.distance_meters || 0), 0) / 1000;

    const monthlyDistance =
      activities
        .filter((a) => new Date(a.start_date_local).getTime() >= monthlyAgo)
        .reduce((sum, a) => sum + (a.distance_meters || 0), 0) / 1000;

    const movingTime = activities.reduce((sum, a) => sum + (a.moving_time_seconds || 0), 0);
    const avgPace = totalDistance > 0 ? (movingTime / 60 / totalDistance).toFixed(1) : '—';

    const lastActivity = activities[0] ? new Date(activities[0].start_date_local).toLocaleDateString() : '—';

    return {
      totalDistance: totalDistance.toFixed(1),
      activityCount,
      weeklyDistance: weeklyDistance.toFixed(1),
      monthlyDistance: monthlyDistance.toFixed(1),
      averagePace: avgPace,
      lastActivity
    };
  }, [activities]);

  const weeklyTrend = useMemo(() => {
    const days = Array.from({ length: 7 }).map((_, offset) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - offset));
      const dayStart = startOfDay(date);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const distance = activities
        .filter((activity) => {
          const value = new Date(activity.start_date_local);
          return value >= dayStart && value < dayEnd;
        })
        .reduce((sum, activity) => sum + (activity.distance_meters || 0), 0);

      return {
        key: dayStart.toISOString(),
        date: dayStart.toISOString(),
        label: dayStart.toLocaleDateString(undefined, { weekday: 'short' }),
        distance
      };
    });

    return days;
  }, [activities]);

  const activityBreakdown = useMemo(() => {
    if (!activities.length) return [];

    const counts = activities.reduce((acc, item) => {
      const key = item.type || 'Other';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts)
      .map(([type, count]) => ({
        type,
        count,
        percentage: Math.round((count / activities.length) * 100)
      }))
      .sort((a, b) => b.count - a.count);
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


        <div className="mb-6 flex flex-wrap gap-2">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'my-plan', label: 'My Plan' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition ${activeTab === tab.id ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {error ? (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span className="inline-flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> {error}</span>
            <button onClick={loadDashboard} className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100">Retry</button>
          </div>
        ) : null}

        {activeTab === 'overview' ? (
          <div className="space-y-6 fade-in">
            <ConnectionCard
              status={status}
              loading={loading}
              onConnect={connect}
              onRefresh={refresh}
              onDisconnect={disconnect}
              lastSyncedAt={lastSyncedAt}
            />
            <StatsGrid stats={stats} loading={loading} />
            <AnalyticsPanel
              weeklyTrend={weeklyTrend}
              monthlyDistanceKm={stats.monthlyDistance}
              activityBreakdown={activityBreakdown}
              loading={loading}
            />
            <ActivitiesTable activities={activities} loading={loading} />
          </div>
        ) : (
          <MyPlanPanel />
        )}
      </main>
    </div>
  );
}
