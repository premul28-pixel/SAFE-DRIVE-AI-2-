import React, { useState } from 'react';
import { MapView } from '../components/MapView';
import { Navigation, Car, Activity, Zap, ShieldCheck, PhoneCall } from 'lucide-react';

export const LiveTracking = ({ vehicles = [], geofences = [], onStartGpsSim }) => {
  const [selectedV, setSelectedV] = useState(vehicles[0] || null);

  const currentV = selectedV || vehicles[0] || {};
  const loc = currentV.location || { speed: 0, ignition: 'OFF', battery: 98, alcohol_reading: 0 };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between glass-panel p-4 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
            <Navigation className="w-5 h-5 text-cyan-400" />
            <span>Real-Time GPS Tracking Hub</span>
          </h1>
          <p className="text-xs text-slate-400">
            Live 4G / MQTT GPS Telemetry updates without page refresh.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
            🟢 Moving: {vehicles.filter(v => v.status === 'MOVING').length}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-red-500/20 text-red-300 border border-red-500/40 font-bold">
            🚨 Alerts: {vehicles.filter(v => v.status === 'ALCOHOL_ALERT' || v.status === 'SOS_ALERT').length}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Vehicle Selector Sidebar (1 col) */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3 h-[600px] overflow-y-auto">
          <h3 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider mb-2">
            Active Vehicles ({vehicles.length})
          </h3>

          <div className="space-y-2">
            {vehicles.map(v => {
              const isSelected = currentV.id === v.id;
              const isAlert = v.status === 'ALCOHOL_ALERT' || v.status === 'SOS_ALERT';

              return (
                <div
                  key={v.id}
                  onClick={() => setSelectedV(v)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-950/60 border-cyan-500/60 text-cyan-200 shadow-md shadow-cyan-950/40'
                      : 'bg-slate-900/60 border-slate-800 hover:bg-slate-850 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-xs">{v.registration_number}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      isAlert ? 'bg-red-500 text-white animate-pulse' : v.status === 'MOVING' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-300'
                    }`}>
                      {v.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>{v.brand} {v.model}</span>
                    <span className="font-mono font-bold text-cyan-400">{v.location?.speed || 0} km/h</span>
                  </div>

                  {v.sensor?.last_reading > 0 && (
                    <div className="mt-1 text-[10px] font-bold text-red-400 flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      <span>BAC: {v.sensor.last_reading} mg/L</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Full Leaflet Map View (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="h-[600px]">
            <MapView
              vehicles={vehicles}
              geofences={geofences}
              selectedVehicle={currentV}
              onSelectVehicle={setSelectedV}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
