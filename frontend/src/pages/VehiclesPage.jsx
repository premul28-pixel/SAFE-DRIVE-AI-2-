import React, { useState } from 'react';
import { Car, Plus, ShieldCheck, Lock, Unlock, Trash2, Edit3, Cpu } from 'lucide-react';

export const VehiclesPage = ({ vehicles = [], drivers = [], onAddVehicle }) => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    registration_number: '',
    type: 'Car',
    brand: '',
    model: '',
    year: '2024',
    fuel_type: 'Petrol',
    driver_id: drivers[0]?.id || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.registration_number || !formData.brand) return;
    if (onAddVehicle) onAddVehicle(formData);
    setShowModal(false);
    setFormData({
      registration_number: '',
      type: 'Car',
      brand: '',
      model: '',
      year: '2024',
      fuel_type: 'Petrol',
      driver_id: drivers[0]?.id || ''
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between glass-panel p-5 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
            <Car className="w-6 h-6 text-cyan-400" />
            <span>Vehicle Fleet Registry</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage vehicles, ignition interlock status, and assigned telematics hardware.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-950/50 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>REGISTER NEW VEHICLE</span>
        </button>
      </div>

      {/* Vehicle Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vehicles.map(v => (
          <div key={v.id} className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-base font-extrabold text-cyan-300 font-mono">{v.registration_number}</span>
                <div className="text-xs text-slate-400 font-medium">{v.brand} {v.model} ({v.year})</div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                v.status === 'MOVING' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' :
                v.status === 'ALCOHOL_ALERT' ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse' :
                'bg-slate-800 text-slate-300 border-slate-700'
              }`}>
                {v.status}
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Vehicle Category:</span>
                <span className="font-semibold text-slate-200">{v.type} ({v.fuel_type})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Assigned Driver:</span>
                <span className="font-bold text-cyan-400">{v.driver?.name || 'Unassigned'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">GPS Telemetry ID:</span>
                <span className="font-mono text-slate-300">{v.gps_device_id || 'SD-GPS-001'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">MQ-3 Alcohol Sensor:</span>
                <span className="font-mono text-slate-300">{v.alcohol_sensor_id || 'MQ3-SEN-001'}</span>
              </div>
            </div>

            {/* Interlock Safety Badge */}
            <div className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between ${
              v.safety_interlock_status === 'START_BLOCKED'
                ? 'bg-red-950/60 border-red-500/50 text-red-300'
                : 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
            }`}>
              <div className="flex items-center gap-1.5">
                {v.safety_interlock_status === 'START_BLOCKED' ? <Lock className="w-4 h-4 text-red-400" /> : <Unlock className="w-4 h-4 text-emerald-400" />}
                <span>Interlock: {v.safety_interlock_status}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Register Vehicle Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-lg font-extrabold text-slate-100 mb-4">Register New Vehicle</h2>
            
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Registration Number</label>
                <input
                  type="text"
                  placeholder="e.g. TN38AB1234"
                  value={formData.registration_number}
                  onChange={e => setFormData({ ...formData, registration_number: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Vehicle Type</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                  >
                    {['Car', 'Bike', 'Truck', 'Bus', 'Van', 'Taxi', 'Other'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Fuel Type</label>
                  <select
                    value={formData.fuel_type}
                    onChange={e => setFormData({ ...formData, fuel_type: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                  >
                    {['Petrol', 'Diesel', 'Electric', 'CNG'].map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Brand</label>
                  <input
                    type="text"
                    placeholder="Hyundai / Toyota"
                    value={formData.brand}
                    onChange={e => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Model</label>
                  <input
                    type="text"
                    placeholder="Creta 2024"
                    value={formData.model}
                    onChange={e => setFormData({ ...formData, model: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Assign Driver</label>
                <select
                  value={formData.driver_id}
                  onChange={e => setFormData({ ...formData, driver_id: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                >
                  {drivers.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.phone})</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold"
                >
                  SAVE VEHICLE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
