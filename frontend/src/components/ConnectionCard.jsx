import { Link2, RefreshCcw, Unplug, ShieldCheck, Clock3 } from 'lucide-react';

function formatTimestamp(value) {
  if (!value) return 'Not synced yet';
  return new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

export default function ConnectionCard({ status, loading, onConnect, onRefresh, onDisconnect, lastSyncedAt }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Strava Connection</h2>
          <p className="mt-1 text-sm text-slate-500">
            {status.connected ? 'Account linked and ready to sync activities.' : 'Connect your Strava account to unlock analytics.'}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 ${status.connected ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-100 text-slate-600'}`}>
              <ShieldCheck className="h-3.5 w-3.5" />
              {status.connected ? 'Securely Connected' : 'Connection Required'}
            </span>
            <span className="inline-flex items-center gap-1 text-slate-500">
              <Clock3 className="h-3.5 w-3.5" />
              Last sync: {formatTimestamp(lastSyncedAt)}
            </span>
          </div>

          {status.athlete ? (
            <p className="mt-2 text-sm text-slate-700">{status.athlete.firstname} {status.athlete.lastname}</p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          {!status.connected ? (
            <button onClick={onConnect} disabled={loading} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition duration-150 hover:bg-indigo-500 active:translate-y-px disabled:cursor-not-allowed disabled:bg-indigo-300">
              <Link2 className="h-4 w-4" />
              Connect with Strava
            </button>
          ) : (
            <>
              <button onClick={onRefresh} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition duration-150 hover:bg-slate-50 active:translate-y-px disabled:cursor-not-allowed">
                <RefreshCcw className="h-4 w-4" />
                Refresh
              </button>
              <button onClick={onDisconnect} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 transition duration-150 hover:bg-red-100 active:translate-y-px disabled:cursor-not-allowed">
                <Unplug className="h-4 w-4" />
                Disconnect
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
