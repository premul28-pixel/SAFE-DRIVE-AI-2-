import React from 'react';
import { Lock, Unlock, AlertTriangle, Cpu, CheckCircle2, ShieldAlert } from 'lucide-react';

export const SafetyInterlockWidget = ({ interlockStatus = 'START_ALLOWED', vehicleState = 'MOVING' }) => {
  const getInterlockConfig = () => {
    switch (interlockStatus) {
      case 'START_BLOCKED':
        return {
          title: 'IGNITION INTERLOCK ENGAGED',
          action: 'VEHICLE START BLOCKED',
          color: 'bg-red-950/60 border-red-500/60 text-red-300',
          iconColor: 'text-red-400',
          ledColor: 'bg-red-500 glow-red animate-pulse',
          icon: Lock,
          desc: 'Alcohol impairment detected. Starter relay open. Engine ignition circuit isolated.'
        };
      case 'SAFE_STOP_REQUESTED':
        return {
          title: 'SAFE STOP RESPONSE INITIATED',
          action: 'GRADUAL PULL-OVER ALERT',
          color: 'bg-amber-950/60 border-amber-500/60 text-amber-300',
          iconColor: 'text-amber-400',
          ledColor: 'bg-amber-500 glow-yellow animate-ping',
          icon: AlertTriangle,
          desc: 'In-transit impairment detected. Hazard lights active. Safe slow-down protocol engaged.'
        };
      default:
        return {
          title: 'SAFETY INTERLOCK NORMAL',
          action: 'START ALLOWED',
          color: 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300',
          iconColor: 'text-emerald-400',
          ledColor: 'bg-emerald-500 glow-green',
          icon: Unlock,
          desc: 'Breath test passed. Low-voltage relay closed. Engine start enabled.'
        };
    }
  };

  const config = getInterlockConfig();
  const Icon = config.icon;

  return (
    <div className={`p-5 rounded-2xl border shadow-xl transition-all ${config.color}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl bg-slate-900/80 border border-slate-700 ${config.iconColor}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Vehicle Safety Controller</h4>
            <div className="text-sm font-extrabold tracking-tight">{config.title}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${config.ledColor}`} />
          <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-slate-900/80 border border-slate-700">
            RELAY ACTIVE
          </span>
        </div>
      </div>

      <p className="text-xs leading-relaxed opacity-90 mb-4">{config.desc}</p>

      {/* Safety Protocol Rule Compliance Banner */}
      <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 flex items-start gap-2.5 text-[11px]">
        <ShieldAlert className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div className="text-slate-300">
          <span className="font-semibold text-cyan-300">Automotive Safety Protocol:</span> SafeDrive AI enforces strict pre-ignition start blocking. In-transit events trigger safe pull-over warnings and never abruptly disable moving road vehicles.
        </div>
      </div>
    </div>
  );
};
