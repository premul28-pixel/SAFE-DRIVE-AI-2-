import React from 'react';

export const SafeDriveLogo = ({ className = "h-8", showText = true }) => {
  return (
    <div className="flex items-center gap-2.5 group cursor-pointer">
      <div className="relative flex items-center justify-center">
        {/* Shield Outer Glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-xl blur-md opacity-60 group-hover:opacity-90 transition-opacity"></div>
        
        {/* Logo SVG Shield + Car + AI Pin */}
        <div className="relative w-10 h-10 bg-slate-900 border border-cyan-500/40 rounded-xl flex items-center justify-center p-1.5 shadow-lg">
          <svg viewBox="0 0 100 100" className="w-full h-full text-cyan-400 fill-current">
            {/* Shield Outline */}
            <path d="M50 10 L85 25 V50 C85 70 50 90 50 90 C50 90 15 70 15 50 V25 L50 10 Z" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
            
            {/* Car Contour */}
            <path d="M30 62 L35 50 H65 L70 62 H30 Z" fill="currentColor" opacity="0.8"/>
            <circle cx="38" cy="68" r="6" fill="#0ea5e9"/>
            <circle cx="62" cy="68" r="6" fill="#0ea5e9"/>
            
            {/* AI Connection Nodes */}
            <circle cx="50" cy="30" r="5" fill="#22d3ee" />
            <line x1="50" y1="30" x2="35" y2="45" stroke="#22d3ee" strokeWidth="3"/>
            <line x1="50" y1="30" x2="65" y2="45" stroke="#22d3ee" strokeWidth="3"/>
          </svg>
        </div>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">
              SafeDrive
            </span>
            <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              AI
            </span>
          </div>
          <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
            Detect. Prevent. Protect.
          </span>
        </div>
      )}
    </div>
  );
};
