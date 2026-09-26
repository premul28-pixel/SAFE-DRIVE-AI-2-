import React from 'react';

export const StatCard = ({ title, value, subtext, icon: Icon, color = 'cyan', onClick }) => {
  const colorMap = {
    cyan: 'border-cyan-500/40 text-cyan-400 bg-cyan-500/10',
    emerald: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10',
    amber: 'border-amber-500/40 text-amber-400 bg-amber-500/10',
    red: 'border-red-500/40 text-red-400 bg-red-500/10 glow-red',
    purple: 'border-purple-500/40 text-purple-400 bg-purple-500/10',
    slate: 'border-slate-500/40 text-slate-400 bg-slate-500/10'
  };

  const style = colorMap[color] || colorMap.cyan;

  return (
    <div
      onClick={onClick}
      className={`glass-panel p-4 rounded-2xl border transition-all duration-300 hover:scale-[1.02] cursor-pointer ${style}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">{title}</span>
        {Icon && <Icon className="w-5 h-5 opacity-90" />}
      </div>
      <div className="text-2xl font-black text-slate-100 tracking-tight">{value}</div>
      {subtext && <div className="text-[10px] font-semibold text-slate-400 mt-1">{subtext}</div>}
    </div>
  );
};
