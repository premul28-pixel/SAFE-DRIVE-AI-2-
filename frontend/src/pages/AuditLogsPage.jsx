import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const AuditLogsPage = ({ logs = [] }) => {
  return (
    <div className="space-y-6">
      <div className="glass-panel p-5 rounded-2xl border border-slate-800">
        <h1 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-cyan-400" />
          <span>System Security & Audit Logs</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Immutable audit trail recording user logins, interlock triggers, alert dispatches, and configuration edits.
        </p>
      </div>

      <div className="glass-panel rounded-2xl border border-slate-800 overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 uppercase font-bold text-[10px]">
              <th className="p-3.5">Log ID</th>
              <th className="p-3.5">User</th>
              <th className="p-3.5">Action Event</th>
              <th className="p-3.5">Category</th>
              <th className="p-3.5">Event Details</th>
              <th className="p-3.5">IP Address / Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {logs.map(l => (
              <tr key={l.id} className="hover:bg-slate-900/40">
                <td className="p-3.5 font-mono text-cyan-300 font-bold">{l.id}</td>
                <td className="p-3.5 font-semibold text-slate-200">{l.user_id}</td>
                <td className="p-3.5 font-bold text-amber-400">{l.action}</td>
                <td className="p-3.5"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">{l.category}</span></td>
                <td className="p-3.5 text-slate-300">{l.details}</td>
                <td className="p-3.5 text-slate-400 font-mono">{l.ip_address} | {new Date(l.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
