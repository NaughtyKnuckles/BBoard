import { Link2, RefreshCcw, Unplug } from 'lucide-react';

export default function ConnectionCard({ status, loading, onConnect, onRefresh, onDisconnect }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Strava Connection</h2>
          <p className="mt-1 text-sm text-slate-500">
            {status.connected ? 'Account linked and ready to sync activities.' : 'Connect your Strava account to unlock analytics.'}
          </p>
          {status.athlete ? (
            <p className="mt-2 text-sm text-slate-700">{status.athlete.firstname} {status.athlete.lastname}</p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          {!status.connected ? (
            <button onClick={onConnect} disabled={loading} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300">
              <Link2 className="h-4 w-4" />
              Connect with Strava
            </button>
          ) : (
            <>
              <button onClick={onRefresh} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed">
                <RefreshCcw className="h-4 w-4" />
                Refresh
              </button>
              <button onClick={onDisconnect} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed">
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
