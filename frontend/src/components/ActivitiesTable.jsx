import { Fragment, useMemo, useState } from 'react';
import { Bike, Footprints, Dumbbell, SlidersHorizontal, CalendarRange, ChevronDown, ChevronUp } from 'lucide-react';

function typeIcon(type = '') {
  const t = type.toLowerCase();
  if (t.includes('ride') || t.includes('cycle')) return Bike;
  if (t.includes('run') || t.includes('walk')) return Footprints;
  return Dumbbell;
}

function formatDate(input) {
  return new Date(input).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
      <svg viewBox="0 0 120 80" className="h-20 w-32 text-slate-300" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="14" y="20" width="92" height="44" rx="10" />
        <path d="M28 46h20M56 46h12M74 46h18" />
        <circle cx="36" cy="34" r="5" />
      </svg>
      <div>
        <p className="text-sm font-medium text-slate-800">No activities yet</p>
        <p className="mt-1 text-sm text-slate-500">Complete your first activity in Strava to populate this feed.</p>
      </div>
    </div>
  );
}

export default function ActivitiesTable({ activities, loading }) {
  const [activityType, setActivityType] = useState('all');
  const [dateRange, setDateRange] = useState('30d');
  const [sortBy, setSortBy] = useState('newest');
  const [expandedId, setExpandedId] = useState(null);

  const activityTypes = useMemo(() => ['all', ...new Set(activities.map((item) => item.type).filter(Boolean))], [activities]);

  const filteredActivities = useMemo(() => {
    const now = Date.now();
    const cutoffMap = {
      '7d': 7,
      '30d': 30,
      '90d': 90
    };

    const filtered = activities.filter((item) => {
      const matchesType = activityType === 'all' || item.type === activityType;
      const rangeDays = cutoffMap[dateRange];
      const matchesDate = !rangeDays || new Date(item.start_date_local).getTime() >= now - rangeDays * 24 * 60 * 60 * 1000;
      return matchesType && matchesDate;
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'distance') return (b.distance_meters || 0) - (a.distance_meters || 0);
      if (sortBy === 'oldest') return new Date(a.start_date_local).getTime() - new Date(b.start_date_local).getTime();
      return new Date(b.start_date_local).getTime() - new Date(a.start_date_local).getTime();
    });
  }, [activities, activityType, dateRange, sortBy]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
      <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Recent Activities</h2>
          <p className="mt-1 text-sm text-slate-500">Latest synced sessions from your Strava account.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <select value={activityType} onChange={(e) => setActivityType(e.target.value)} className="bg-transparent outline-none">
              {activityTypes.map((type) => (
                <option key={type} value={type}>{type === 'all' ? 'All Types' : type}</option>
              ))}
            </select>
          </label>

          <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
            <CalendarRange className="h-3.5 w-3.5" />
            <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="bg-transparent outline-none">
              <option value="7d">Last 7d</option>
              <option value="30d">Last 30d</option>
              <option value="90d">Last 90d</option>
              <option value="all">All time</option>
            </select>
          </label>

          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 outline-none">
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="distance">Longest distance</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton h-12 rounded-xl" />
          ))}
        </div>
      ) : filteredActivities.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] table-fixed border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="pb-3 font-medium">Activity</th>
                <th className="pb-3 font-medium">Type</th>
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 text-right font-medium">Distance</th>
              </tr>
            </thead>
            <tbody>
              {filteredActivities.map((activity) => {
                const Icon = typeIcon(activity.type);
                const expanded = expandedId === activity.id;
                return (
                  <Fragment key={activity.id}>
                    <tr className="border-b border-slate-100 text-slate-700 transition hover:bg-slate-50 last:border-none">
                      <td className="py-3 font-medium text-slate-900">
                        <button onClick={() => setExpandedId(expanded ? null : activity.id)} className="inline-flex items-center gap-2 text-left">
                          {expanded ? <ChevronUp className="h-3.5 w-3.5 text-slate-400" /> : <ChevronDown className="h-3.5 w-3.5 text-slate-400" />}
                          {activity.name}
                        </button>
                      </td>
                      <td className="py-3">
                        <span className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-600">
                          <Icon className="h-3.5 w-3.5" />
                          {activity.type}
                        </span>
                      </td>
                      <td className="py-3">{formatDate(activity.start_date_local)}</td>
                      <td className="py-3 text-right font-medium">{((activity.distance_meters || 0) / 1000).toFixed(2)} km</td>
                    </tr>
                    {expanded ? (
                      <tr className="border-b border-slate-100 bg-slate-50/50 text-xs text-slate-600">
                        <td className="py-2 pl-8" colSpan={4}>
                          Moving time: {Math.round((activity.moving_time_seconds || 0) / 60)} min · Elevation gain: {Math.round(activity.total_elevation_gain_meters || 0)} m
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
