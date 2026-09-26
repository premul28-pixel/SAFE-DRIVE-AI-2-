import React from 'react';
import { AlertTriangle, AlertOctagon, ShieldAlert, CheckCircle2, Zap } from 'lucide-react';

export const AlertsPage = ({ alerts = [], onResolveAlert }) => {
  return (
    <div className="space-y-6">
      <div className="glass-panel p-5 rounded-2xl border border-slate-800">
        <h1 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-amber-400" />
          <span>Active Safety & Telematics Alerts</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Real-time incident feed for alcohol detection, emergency SOS, overspeeding, and geofence breaches.
        </p>
      </div>

      <div className="space-y-3">
        {alerts.map(a => {
          const isCritical = a.severity === 'CRITICAL';
          return (
            <div
              key={a.id}
              className={`glass-panel p-4 rounded-2xl border flex items-center justify-between gap-4 ${
                isCritical ? 'border-red-500/50 bg-red-950/20 glow-red' : 'border-slate-800'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2.5 rounded-xl ${isCritical ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
                  {a.type === 'ALCOHOL_DETECTED' ? <AlertOctagon className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs text-slate-100">{a.type}</span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-red-500/20 text-red-400">
                      {a.severity}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">{a.message}</p>
                  <div className="text-[10px] text-slate-400 mt-1 font-mono">
                    Time: {new Date(a.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>

              {!a.is_resolved ? (
                <button
                  onClick={() => onResolveAlert && onResolveAlert(a.id)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold shrink-0 border border-slate-700"
                >
                  RESOLVE ALERT
                </button>
              ) : (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold text-emerald-400 bg-emerald-500/20 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> RESOLVED
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
