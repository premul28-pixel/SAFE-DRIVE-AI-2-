import React from 'react';
import { Route, Clock, Navigation, CheckCircle2 } from 'lucide-react';

export const TripsPage = ({ trips = [] }) => {
  return (
    <div className="space-y-6">
      <div className="glass-panel p-5 rounded-2xl border border-slate-800">
        <h1 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
          <Route className="w-6 h-6 text-cyan-400" />
          <span>Completed Trip Telemetry Logs</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Historical trip routes, distance covered, average speed, and maximum speed analytics.
        </p>
      </div>

      <div className="glass-panel rounded-2xl border border-slate-800 overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 uppercase font-bold text-[10px]">
              <th className="p-3.5">Vehicle / Driver</th>
              <th className="p-3.5">Origin & Destination</th>
              <th className="p-3.5">Distance (km)</th>
              <th className="p-3.5">Avg / Max Speed</th>
              <th className="p-3.5">Duration</th>
              <th className="p-3.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {trips.map(t => (
              <tr key={t.id} className="hover:bg-slate-900/40">
                <td className="p-3.5">
                  <div className="font-bold text-cyan-300 font-mono">{t.vehicle_id}</div>
                  <div className="text-[11px] text-slate-400">{t.driver_id}</div>
                </td>
                <td className="p-3.5">
                  <div className="font-semibold text-slate-200">{t.start_address}</div>
                  <div className="text-[11px] text-slate-400">➔ {t.end_address}</div>
                </td>
                <td className="p-3.5 font-bold font-mono text-emerald-400">{t.distance_km} km</td>
                <td className="p-3.5 font-mono">{t.avg_speed} km/h (Max: {t.max_speed})</td>
                <td className="p-3.5">{t.duration_mins} mins</td>
                <td className="p-3.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                    {t.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
