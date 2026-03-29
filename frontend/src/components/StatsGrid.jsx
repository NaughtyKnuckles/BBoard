import { Gauge, Map, Route, CalendarClock, TimerReset, TrendingUp } from 'lucide-react';

const cards = [
  { key: 'totalDistance', label: 'Total Distance', icon: Map, suffix: 'km' },
  { key: 'activityCount', label: 'Activity Count', icon: Gauge, suffix: '' },
  { key: 'weeklyDistance', label: 'Last 7 Days', icon: Route, suffix: 'km' },
  { key: 'monthlyDistance', label: 'Last 30 Days', icon: TrendingUp, suffix: 'km' },
  { key: 'averagePace', label: 'Average Pace', icon: TimerReset, suffix: 'min/km' },
  { key: 'lastActivity', label: 'Last Activity', icon: CalendarClock, suffix: '' }
];

export default function StatsGrid({ stats, loading }) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <article key={card.key} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">{card.label}</p>
              <Icon className="h-4 w-4 text-slate-400" />
            </div>
            {loading ? (
              <div className="mt-4 h-8 w-24 animate-pulse rounded-md bg-slate-100" />
            ) : (
              <p className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">{stats[card.key]} {card.suffix}</p>
            )}
          </article>
        );
      })}
    </section>
  );
}
