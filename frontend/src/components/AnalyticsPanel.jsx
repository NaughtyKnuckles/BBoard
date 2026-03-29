import { BarChart3, TrendingUp, CalendarDays, PieChart } from 'lucide-react';


function formatLabel(dateValue) {
  return new Date(dateValue).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function AnalyticsPanel({ weeklyTrend, monthlyDistanceKm, activityBreakdown, loading }) {
  const maxWeekly = Math.max(...weeklyTrend.map((item) => item.distance), 1);

  return (
    <section className="grid gap-4 xl:grid-cols-3">
      <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft xl:col-span-2">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Weekly Distance Trend</h2>
            <p className="mt-1 text-sm text-slate-500">Last 7 days with daily totals from synced activities.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600">
            <BarChart3 className="h-3.5 w-3.5" />
            Trend
          </div>
        </div>

        {loading ? (
          <div className="grid h-44 grid-cols-7 items-end gap-3">
            {Array.from({ length: 7 }).map((_, idx) => (
              <div key={idx} className="skeleton h-full rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid h-44 grid-cols-7 items-end gap-3">
            {weeklyTrend.map((item) => {
              const height = `${Math.max((item.distance / maxWeekly) * 100, 8)}%`;
              return (
                <div key={item.key} className="flex h-full flex-col justify-end gap-2">
                  <div className="group relative flex-1">
                    <div className="absolute inset-x-0 bottom-0 rounded-xl bg-indigo-100 transition-all duration-300 group-hover:bg-indigo-200" style={{ height }} />
                  </div>
                  <div className="text-center text-[11px] text-slate-500">{item.label}</div>
                </div>
              );
            })}
          </div>
        )}
      </article>

      <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
        <div className="space-y-5">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 text-xs font-medium text-slate-500">
              <TrendingUp className="h-3.5 w-3.5" /> Monthly progress
            </div>
            {loading ? <div className="skeleton h-8 w-24 rounded-md" /> : <p className="text-3xl font-semibold text-slate-900">{monthlyDistanceKm} km</p>}
          </div>

          <div>
            <div className="mb-3 inline-flex items-center gap-2 text-xs font-medium text-slate-500">
              <PieChart className="h-3.5 w-3.5" /> Activity breakdown
            </div>
            <div className="space-y-2">
              {loading
                ? Array.from({ length: 3 }).map((_, idx) => <div key={idx} className="skeleton h-10 rounded-xl" />)
                : activityBreakdown.slice(0, 4).map((item) => (
                    <div key={item.type} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                        <span>{item.type}</span>
                        <span>{item.count} activities</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-200">
                        <div className="h-1.5 rounded-full bg-indigo-500" style={{ width: `${item.percentage}%` }} />
                      </div>
                    </div>
                  ))}
            </div>
          </div>

          {!loading && weeklyTrend[weeklyTrend.length - 1] ? (
            <div className="inline-flex items-center gap-2 text-xs text-slate-500">
              <CalendarDays className="h-3.5 w-3.5" />
              Latest activity {formatLabel(weeklyTrend[weeklyTrend.length - 1].date)}
            </div>
          ) : null}
        </div>
      </article>
    </section>
  );
}
