import { Bike, Footprints, Dumbbell } from 'lucide-react';

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
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900">Recent Activities</h2>
        <p className="mt-1 text-sm text-slate-500">Latest synced sessions from your Strava account.</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      ) : activities.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] table-fixed border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="pb-3 font-medium">Activity</th>
                <th className="pb-3 font-medium">Type</th>
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 text-right font-medium">Distance</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((activity) => {
                const Icon = typeIcon(activity.type);
                return (
                  <tr key={activity.id} className="border-b border-slate-100 text-slate-700 last:border-none">
                    <td className="py-3 font-medium text-slate-900">{activity.name}</td>
                    <td className="py-3">
                      <span className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-600">
                        <Icon className="h-3.5 w-3.5" />
                        {activity.type}
                      </span>
                    </td>
                    <td className="py-3">{formatDate(activity.start_date_local)}</td>
                    <td className="py-3 text-right font-medium">{(activity.distance_meters / 1000).toFixed(2)} km</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
