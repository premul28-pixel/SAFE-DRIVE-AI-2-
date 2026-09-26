import React, { useState } from 'react';
import { Cpu, Activity, RefreshCw, CheckCircle2, AlertOctagon, Radio, ShieldCheck } from 'lucide-react';

export const DevicesSensorsPage = ({ devices = [], sensors = [], onCalibrateSensor }) => {
  const [activeTab, setActiveTab] = useState('sensors');
  const [calibratingId, setCalibratingId] = useState(null);

  const handleCalibrate = (sId) => {
    setCalibratingId(sId);
    if (onCalibrateSensor) onCalibrateSensor(sId);
    setTimeout(() => setCalibratingId(null), 1200);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
            <Cpu className="w-6 h-6 text-cyan-400" />
            <span>IoT Hardware, Sensors & Device Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Monitor MQ-3 automotive alcohol sensors, 4G GPS trackers, firmware status, and calibration health.
          </p>
        </div>

        <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('sensors')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'sensors' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            MQ-3 Alcohol Sensors ({sensors.length})
          </button>
          <button
            onClick={() => setActiveTab('devices')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'devices' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            GPS Devices ({devices.length})
          </button>
        </div>
      </div>

      {activeTab === 'sensors' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sensors.map(s => {
            const isAlert = s.status === 'ALCOHOL_DETECTED';
            const isCalibrating = calibratingId === s.id;

            return (
              <div key={s.id} className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-sm font-extrabold text-cyan-300 font-mono">{s.sensor_code}</span>
                    <div className="text-[11px] text-slate-400">{s.type}</div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                    isAlert ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  }`}>
                    {s.status}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Assigned Vehicle:</span>
                    <span className="font-semibold text-slate-200">{s.vehicle_id || 'VH001'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Latest BAC Reading:</span>
                    <span className={`font-mono font-bold ${s.last_reading > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {s.last_reading.toFixed(2)} BAC
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Sensor Temperature:</span>
                    <span className="font-mono text-cyan-400">{s.temperature || 25.2}°C</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Last Calibrated:</span>
                    <span className="text-slate-300">{s.calibration_date}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleCalibrate(s.id)}
                  disabled={isCalibrating}
                  className="w-full mt-2 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isCalibrating ? 'animate-spin text-cyan-400' : ''}`} />
                  <span>{isCalibrating ? 'Recalibrating Hardware...' : 'RECALIBRATE SENSOR'}</span>
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {devices.map(d => (
            <div key={d.id} className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-sm font-extrabold text-cyan-300 font-mono">{d.device_code}</span>
                  <div className="text-[11px] text-slate-400">{d.model} ({d.firmware})</div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                  d.status === 'ONLINE' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : 'bg-slate-800 text-slate-500 border-slate-700'
                }`}>
                  {d.status}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Device IMEI:</span>
                  <span className="font-mono text-slate-200">{d.imei}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">4G SIM Number:</span>
                  <span className="font-mono text-cyan-400">{d.sim_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Assigned Vehicle:</span>
                  <span className="font-semibold text-slate-200">{d.vehicle_id}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
