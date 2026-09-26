import React, { useState } from 'react';
import { MapPin, Plus, Circle, CheckCircle2 } from 'lucide-react';

export const GeofencesPage = ({ geofences = [], onAddGeofence }) => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'CIRCLE',
    center_lat: '11.0168',
    center_lng: '76.9558',
    radius: '1000'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) return;
    if (onAddGeofence) onAddGeofence(formData);
    setShowModal(false);
    setFormData({ name: '', type: 'CIRCLE', center_lat: '11.0168', center_lng: '76.9558', radius: '1000' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between glass-panel p-5 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-cyan-400" />
            <span>Geofencing Safety Zones</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Define virtual geographic boundaries. Automatic alerts generated upon vehicle entry or exit.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold text-xs shadow-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>CREATE GEOFENCE ZONE</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {geofences.map(g => (
          <div key={g.id} className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-extrabold text-sm text-cyan-300">{g.name}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                {g.type}
              </span>
            </div>

            <div className="space-y-1 text-xs text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Center Lat/Lng:</span>
                <span className="font-mono text-cyan-400">{g.center_lat}, {g.center_lng}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Radius:</span>
                <span className="font-bold text-slate-200">{g.radius} meters</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-lg font-extrabold text-slate-100 mb-4">Create Geofence Zone</h2>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Geofence Name</label>
                <input
                  type="text"
                  placeholder="e.g. Headquarters Depot"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Center Latitude</label>
                  <input
                    type="text"
                    value={formData.center_lat}
                    onChange={e => setFormData({ ...formData, center_lat: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Center Longitude</label>
                  <input
                    type="text"
                    value={formData.center_lng}
                    onChange={e => setFormData({ ...formData, center_lng: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Radius (Meters)</label>
                <input
                  type="number"
                  value={formData.radius}
                  onChange={e => setFormData({ ...formData, radius: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold">CANCEL</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-cyan-600 text-white text-xs font-bold">SAVE ZONE</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
