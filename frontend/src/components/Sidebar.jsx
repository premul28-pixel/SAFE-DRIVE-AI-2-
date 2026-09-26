import React from 'react';
import {
  LayoutDashboard, Navigation, Car, Users, Cpu, MapPin, Route,
  PhoneCall, AlertTriangle, Wrench, Fuel, FileText, BarChart3,
  Sliders, ShieldCheck, Terminal
} from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const menuGroups = [
    {
      title: 'OPERATIONS',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'tracking', label: 'Live Tracking', icon: Navigation },
        { id: 'vehicles', label: 'Vehicles', icon: Car },
        { id: 'drivers', label: 'Drivers', icon: Users },
        { id: 'devices', label: 'Devices & Sensors', icon: Cpu }
      ]
    },
    {
      title: 'SAFETY & GEOFENCE',
      items: [
        { id: 'geofences', label: 'Geofences', icon: MapPin },
        { id: 'trips', label: 'Trips History', icon: Route },
        { id: 'emergency', label: 'Emergency Contacts', icon: PhoneCall },
        { id: 'alerts', label: 'Alert Center', icon: AlertTriangle }
      ]
    },
    {
      title: 'FLEET MANAGEMENT',
      items: [
        { id: 'maintenance', label: 'Maintenance', icon: Wrench },
        { id: 'fuel', label: 'Fuel Management', icon: Fuel },
        { id: 'reports', label: 'Reports', icon: FileText },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 }
      ]
    },
    {
      title: 'SYSTEM & HARDWARE',
      items: [
        { id: 'settings', label: 'Settings', icon: Sliders },
        { id: 'audit', label: 'Audit Logs', icon: ShieldCheck },
        { id: 'firmware', label: 'IoT Firmware Code', icon: Terminal }
      ]
    }
  ];

  return (
    <aside className="w-64 glass-panel border-r border-slate-800/80 p-4 flex flex-col h-[calc(100vh-65px)] sticky top-[65px] overflow-y-auto">
      <div className="space-y-6">
        {menuGroups.map((group, idx) => (
          <div key={idx}>
            <div className="px-3 mb-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
              {group.title}
            </div>
            <div className="space-y-1">
              {group.items.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-600/30 to-blue-600/30 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-950/50'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};
