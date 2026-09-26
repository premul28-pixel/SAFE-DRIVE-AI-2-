import React, { useState, useEffect } from 'react';
import { StatCard } from '../components/StatCard';
import { MapView } from '../components/MapView';
import { AlcoholGauge } from '../components/AlcoholGauge';
import { SafetyInterlockWidget } from '../components/SafetyInterlockWidget';
import { GpsSimulatorPanel } from '../components/GpsSimulatorPanel';
import { Car, Navigation, PauseCircle, Clock, WifiOff, AlertOctagon, ShieldAlert, Zap, RefreshCw } from 'lucide-react';

export const Dashboard = ({ vehicles = [], alerts = [], geofences = [], onSimulateAlcohol, onStartGpsSim }) => {
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  useEffect(() => {
    if (vehicles.length > 0 && !selectedVehicle) {
      setSelectedVehicle(vehicles[0]);
    }
  }, [vehicles, selectedVehicle]);

  const movingCount = vehicles.filter(v => v.status === 'MOVING').length;
  const stoppedCount = vehicles.filter(v => v.status === 'STOPPED').length;
  const idleCount = vehicles.filter(v => v.status === 'IDLE').length;
  const offlineCount = vehicles.filter(v => v.status === 'OFFLINE').length;
  const alcoholAlertCount = vehicles.filter(v => v.status === 'ALCOHOL_ALERT').length;
  const sosAlertCount = vehicles.filter(v => v.status === 'SOS_ALERT').length;

  const currentV = selectedVehicle || vehicles[0] || {};
  const currentSensorReading = currentV.sensor?.last_reading || 0.00;
  const currentSensorStatus = currentV.sensor?.status || 'NORMAL';
  const currentInterlock = currentV.safety_interlock_status || 'START_ALLOWED';

  return (
    <div className="space-y-6">
      {/* Top Banner Overview Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-100">
            Telematics & Alcohol Interlock Command Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time driver impairment detection, vehicle ignition safety interlock, and live GPS tracking dashboard.
          </p>
        </div>

        {/* Quick Demo Impairment Trigger Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSimulateAlcohol && onSimulateAlcohol('VH001', 0.42)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white text-xs font-bold shadow-lg shadow-red-950/50 glow-red flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            <span>Simulate Alcohol Impairment (VH001)</span>
          </button>
        </div>
      </div>

      {/* 8 Telematics Metrics Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <StatCard title="Total Fleet" value={vehicles.length} subtext="Registered" icon={Car} color="cyan" />
        <StatCard title="Moving" value={movingCount} subtext="On Road" icon={Navigation} color="emerald" />
        <StatCard title="Stopped" value={stoppedCount} subtext="Parked" icon={PauseCircle} color="slate" />
        <StatCard title="Idle" value={idleCount} subtext="Engine ON" icon={Clock} color="amber" />
        <StatCard title="Offline" value={offlineCount} subtext="No Network" icon={WifiOff} color="purple" />
        <StatCard title="Alcohol Alerts" value={alcoholAlertCount} subtext="Interlock Blocked" icon={AlertOctagon} color="red" />
        <StatCard title="SOS Alerts" value={sosAlertCount} subtext="Emergency" icon={ShieldAlert} color="red" />
        <StatCard title="Overspeed" value="1" subtext="Limit > 80 km/h" icon={Zap} color="amber" />
      </div>

      {/* Middle Grid: Live Map + Breathalyzer & Interlock Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Live Leaflet Interactive Map (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Navigation className="w-5 h-5 text-cyan-400" />
              <span>Live Vehicle Fleet Map</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">
              Selected: <strong className="text-cyan-300">{currentV.registration_number || 'TN38AB1234'}</strong>
            </span>
          </div>

          <div className="h-[460px]">
            <MapView
              vehicles={vehicles}
              geofences={geofences}
              selectedVehicle={currentV}
              onSelectVehicle={setSelectedVehicle}
            />
          </div>
        </div>

        {/* Right Column: MQ-3 Breathalyzer Sensor & Safety Interlock Controls */}
        <div className="space-y-5">
          <AlcoholGauge
            reading={currentSensorReading}
            status={currentSensorStatus}
            onSimulateReading={(val) => onSimulateAlcohol && onSimulateAlcohol(currentV.id || 'VH001', val)}
          />

          <SafetyInterlockWidget
            interlockStatus={currentInterlock}
            vehicleState={currentV.status}
          />
        </div>
      </div>

      {/* Bottom Grid: GPS Telemetry Simulator Tool */}
      <GpsSimulatorPanel vehicles={vehicles} onStartSim={onStartGpsSim} />
    </div>
  );
};
