import React, { useState } from 'react';
import { SafeDriveLogo } from './SafeDriveLogo';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { ShieldAlert, Bell, Sun, Moon, Radio, UserCheck } from 'lucide-react';

export const Navbar = ({ activeTab, setActiveTab, onOpenSosModal }) => {
  const { user, switchRole, darkMode, toggleTheme } = useAuth();
  const { isConnected } = useSocket();
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const roles = [
    { key: 'SUPER_ADMIN', label: 'Super Admin', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
    { key: 'FLEET_ADMIN', label: 'Fleet Admin', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
    { key: 'VEHICLE_OWNER', label: 'Vehicle Owner', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
    { key: 'DRIVER', label: 'Driver', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' }
  ];

  const currentRoleObj = roles.find(r => r.key === user.role) || roles[1];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 px-4 py-3 shadow-xl">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Brand Logo */}
        <SafeDriveLogo />

        {/* Desktop Quick Nav Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
          {[
            { id: 'dashboard', label: 'Dashboard' },
            { id: 'tracking', label: 'Live Tracking' },
            { id: 'vehicles', label: 'Vehicles' },
            { id: 'drivers', label: 'Drivers' },
            { id: 'alerts', label: 'Alerts' },
            { id: 'trips', label: 'Trips' },
            { id: 'reports', label: 'Reports' },
            { id: 'settings', label: 'Settings' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-900/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Right Action Tools */}
        <div className="flex items-center gap-3">
          {/* WebSocket Online Status */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs">
            <Radio className={`w-3.5 h-3.5 ${isConnected ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
            <span className={isConnected ? 'text-emerald-400 font-medium' : 'text-slate-500'}>
              {isConnected ? 'Telemetry Live' : 'Connecting...'}
            </span>
          </div>

          {/* SOS Emergency Dispatch Button */}
          <button
            onClick={onOpenSosModal}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white text-xs font-bold shadow-lg shadow-red-900/50 glow-red transform active:scale-95 transition-all"
          >
            <ShieldAlert className="w-4 h-4 animate-bounce" />
            <span>SOS EMERGENCY</span>
          </button>

          {/* Role Switcher Menu */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold ${currentRoleObj.color}`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>{currentRoleObj.label}</span>
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-44 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-1 z-50">
                <div className="px-2 py-1 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
                  Select User Role
                </div>
                {roles.map(r => (
                  <button
                    key={r.key}
                    onClick={() => {
                      switchRole(r.key);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      user.role === r.key ? 'bg-cyan-600/30 text-cyan-300' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
            title="Toggle Light/Dark Theme"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-cyan-400" />}
          </button>
        </div>
      </div>
    </header>
  );
};
