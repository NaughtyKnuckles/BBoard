import { Activity } from 'lucide-react';

export default function TopNav({ connected }) {
  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700">
            <Activity className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight text-slate-900">ByenBoard</p>
            <p className="text-xs text-slate-500">Personalized Dashboard</p>
          </div>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
          <span className={`h-1.5 w-1.5 rounded-full ${connected ? 'bg-emerald-500' : 'bg-slate-400'}`} />
          {connected ? 'Connected' : 'Disconnected'}
        </div>
      </div>
    </header>
  );
}
