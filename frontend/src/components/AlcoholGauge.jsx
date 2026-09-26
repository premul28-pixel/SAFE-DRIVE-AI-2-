import React, { useState } from 'react';
import { Activity, ShieldCheck, AlertOctagon, RefreshCw, Zap } from 'lucide-react';

export const AlcoholGauge = ({ reading = 0.00, status = 'SAFE', onSimulateReading }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const getStatusBadge = () => {
    switch (status) {
      case 'ALCOHOL_DETECTED':
        return { label: 'ALCOHOL DETECTED', color: 'bg-red-500/20 text-red-400 border-red-500/50 glow-red animate-pulse', icon: AlertOctagon };
      case 'WARNING':
        return { label: 'WARNING LEVEL', color: 'bg-amber-500/20 text-amber-400 border-amber-500/50 glow-yellow', icon: Activity };
      case 'WARMUP_IN_PROGRESS':
        return { label: 'SENSOR STABILIZING', color: 'bg-blue-500/20 text-blue-400 border-blue-500/50 animate-pulse', icon: RefreshCw };
      default:
        return { label: 'SAFE - BAC NORMAL', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 glow-green', icon: ShieldCheck };
    }
  };

  const badge = getStatusBadge();
  const BadgeIcon = badge.icon;

  // Percentage fill for radial meter (Max scale 0.50 BAC)
  const percentage = Math.min(100, Math.max(0, (reading / 0.50) * 100));

  const handleTestTrigger = (val) => {
    setIsProcessing(true);
    if (onSimulateReading) onSimulateReading(val);
    setTimeout(() => setIsProcessing(false), 800);
  };

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
      {/* Background Subtle Gradient */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold text-slate-100 tracking-wide">MQ-3 Breathalyzer Sensor</h3>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${badge.color}`}>
          <BadgeIcon className="w-3.5 h-3.5" />
          {badge.label}
        </span>
      </div>

      {/* Radial BAC Gauge Display */}
      <div className="flex flex-col items-center justify-center my-4">
        <div className="relative w-40 h-40 flex items-center justify-center">
          {/* SVG Progress Ring */}
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#1e293b" strokeWidth="10" />
            <circle
              cx="50" cy="50" r="40" fill="none"
              stroke={status === 'ALCOHOL_DETECTED' ? '#ef4444' : status === 'WARNING' ? '#f59e0b' : '#10b981'}
              strokeWidth="10"
              strokeDasharray="251.2"
              strokeDashoffset={251.2 - (251.2 * percentage) / 100}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-3xl font-extrabold text-slate-100 tracking-tighter">
              {reading.toFixed(2)}
            </span>
            <span className="text-[10px] uppercase font-bold text-slate-400">BAC (mg/L)</span>
          </div>
        </div>

        {/* 5-Sample Moving Average Filter Meter */}
        <div className="w-full mt-3 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium">Noise Filter (5-Sample Moving Avg):</span>
          <span className="text-cyan-400 font-bold font-mono">{reading.toFixed(3)} BAC</span>
        </div>
      </div>

      {/* Interactive Breathalyzer Simulation Triggers */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-2">
        <button
          onClick={() => handleTestTrigger(0.00)}
          disabled={isProcessing}
          className="flex-1 py-2 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Test Safe BAC (0.00)</span>
        </button>
        <button
          onClick={() => handleTestTrigger(0.42)}
          disabled={isProcessing}
          className="flex-1 py-2 px-3 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/40 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-red-950/40"
        >
          <Zap className="w-3.5 h-3.5 text-red-400" />
          <span>Simulate Alcohol (0.42)</span>
        </button>
      </div>
    </div>
  );
};
