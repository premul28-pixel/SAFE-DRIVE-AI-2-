import React, { useState } from 'react';
import { Users, Award, ShieldAlert, CheckCircle2, AlertTriangle, Plus } from 'lucide-react';

export const DriversPage = ({ drivers = [], onAddDriver }) => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    license_number: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;
    if (onAddDriver) onAddDriver(formData);
    setShowModal(false);
    setFormData({ name: '', phone: '', email: '', license_number: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between glass-panel p-5 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
            <Users className="w-6 h-6 text-cyan-400" />
            <span>Driver Safety Score & Profile Hub</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Monitor driver behavior, safety score trends, license validity, and assignment history.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-950/50 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>ADD NEW DRIVER</span>
        </button>
      </div>

      {/* Driver Roster Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {drivers.map(d => {
          const score = d.safety_score || 90;
          const scoreColor = score >= 90 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' :
                             score >= 75 ? 'text-amber-400 bg-amber-500/10 border-amber-500/30' :
                             'text-red-400 bg-red-500/10 border-red-500/30';

          return (
            <div key={d.id} className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src={d.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'}
                  alt={d.name}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-700"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-extrabold text-slate-100 truncate">{d.name}</h3>
                  <p className="text-xs text-slate-400 font-mono">{d.phone}</p>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-bold ${
                    d.status === 'Driving' ? 'bg-emerald-500/20 text-emerald-400' :
                    d.status === 'Suspended' ? 'bg-red-500/20 text-red-400' :
                    'bg-slate-800 text-slate-400'
                  }`}>
                    {d.status}
                  </span>
                </div>

                {/* Safety Score Radial Badge */}
                <div className={`p-2.5 rounded-xl border flex flex-col items-center justify-center ${scoreColor}`}>
                  <span className="text-lg font-black">{score}</span>
                  <span className="text-[8px] uppercase font-bold tracking-wider">Safety Score</span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300 border-t border-slate-800 pt-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">License Number:</span>
                  <span className="font-mono text-cyan-300">{d.license_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Assigned Vehicle:</span>
                  <span className="font-semibold text-slate-200">{d.vehicle_number || 'TN38AB1234'}</span>
                </div>
              </div>

              {/* Behavior Safety Statistics */}
              <div className="grid grid-cols-3 gap-2 pt-2 text-center text-[10px]">
                <div className="bg-slate-900 p-1.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block">Overspeed</span>
                  <span className="font-bold text-amber-400">{d.overspeed_count || 0}</span>
                </div>
                <div className="bg-slate-900 p-1.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block">Harsh Brakes</span>
                  <span className="font-bold text-cyan-400">{d.harsh_brake_count || 0}</span>
                </div>
                <div className="bg-slate-900 p-1.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block">Alcohol Events</span>
                  <span className="font-bold text-red-400">{d.alcohol_event_count || 0}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Driver Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-lg font-extrabold text-slate-100 mb-4">Add New Driver Profile</h2>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Arun Kumar"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+919876543213"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">License Number</label>
                  <input
                    type="text"
                    placeholder="TN38-2021000101"
                    value={formData.license_number}
                    onChange={e => setFormData({ ...formData, license_number: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="arun@safedrive.ai"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                />
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
                  SAVE DRIVER
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
