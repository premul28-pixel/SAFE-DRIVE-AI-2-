import React, { useState } from 'react';
import { Play, Square, Navigation, Zap, Compass } from 'lucide-react';

export const GpsSimulatorPanel = ({ vehicles = [], onStartSim }) => {
  const [selectedVId, setSelectedVId] = useState(vehicles[0]?.id || 'VH001');
  const [startPoint, setStartPoint] = useState('COIMBATORE_HQ');
  const [endPoint, setEndPoint] = useState('TIDEL_PARK');
  const [speed, setSpeed] = useState(65);
  const [isSimulating, setIsSimulating] = useState(false);

  const presets = {
    COIMBATORE_HQ: { name: 'Coimbatore HQ Depot', lat: 11.0168, lng: 76.9558 },
    GANDHIPURAM: { name: 'Gandhipuram Terminal', lat: 11.0180, lng: 76.9650 },
    RAILWAY_STATION: { name: 'Coimbatore Junction Station', lat: 11.0000, lng: 76.9620 },
    AIRPORT: { name: 'Coimbatore Intl Airport', lat: 11.0300, lng: 77.0400 },
    TIDEL_PARK: { name: 'Tidel Park Tech Hub', lat: 11.0250, lng: 76.9920 },
    CHENNAI_HUB: { name: 'Chennai Central Logistics Hub', lat: 13.0827, lng: 80.2707 }
  };

  const handleLaunchSim = () => {
    setIsSimulating(true);
    const start = presets[startPoint];
    const end = presets[endPoint];

    if (onStartSim) {
      onStartSim(selectedVId, start.lat, start.lng, end.lat, end.lng, speed);
    }

    setTimeout(() => {
      setIsSimulating(false);
    }, 20000);
  };

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800 shadow-xl">
      <div className="flex items-center gap-2 mb-3">
        <Compass className="w-5 h-5 text-cyan-400" />
        <h3 className="text-sm font-bold text-slate-100">Live GPS Hardware Telemetry Simulator</h3>
      </div>
      <p className="text-xs text-slate-400 mb-4">
        Allows developers to test complete live vehicle tracking, geofence triggers, and alcohol impairment events without physical IoT hardware.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">Select Target Vehicle</label>
          <select
            value={selectedVId}
            onChange={(e) => setSelectedVId(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            {vehicles.map(v => (
              <option key={v.id} value={v.id}>
                {v.registration_number} ({v.brand} {v.model})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">Simulated Speed (km/h)</label>
          <input
            type="number"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            min="10"
            max="120"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">Starting Location</label>
          <select
            value={startPoint}
            onChange={(e) => setStartPoint(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
          >
            {Object.keys(presets).map(key => (
              <option key={key} value={key}>{presets[key].name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">Destination Route</label>
          <select
            value={endPoint}
            onChange={(e) => setEndPoint(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
          >
            {Object.keys(presets).map(key => (
              <option key={key} value={key}>{presets[key].name}</option>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={handleLaunchSim}
        disabled={isSimulating}
        className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg ${
          isSimulating
            ? 'bg-amber-600/30 text-amber-300 border border-amber-500/40 animate-pulse'
            : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-950/60'
        }`}
      >
        {isSimulating ? (
          <>
            <Navigation className="w-4 h-4 animate-spin text-amber-400" />
            <span>GPS Trajectory Moving Live...</span>
          </>
        ) : (
          <>
            <Play className="w-4 h-4 fill-current" />
            <span>START LIVE GPS SIMULATION</span>
          </>
        )}
      </button>
    </div>
  );
};
