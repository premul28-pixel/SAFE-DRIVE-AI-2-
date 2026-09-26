import React, { useState } from 'react';
import { Wrench, Plus } from 'lucide-react';

export const MaintenancePage = ({ maintenance = [], onAddMaintenance }) => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    vehicle_id: 'VH001',
    service_type: 'Oil',
    service_date: new Date().toISOString().split('T')[0],
    odometer: 25000,
    cost: 4500,
    description: 'Engine oil & filter change'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onAddMaintenance) onAddMaintenance(formData);
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between glass-panel p-5 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
            <Wrench className="w-6 h-6 text-cyan-400" />
            <span>Vehicle Maintenance Tracker</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Service schedules, oil changes, brake pads, tire replacements, and cost history.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold text-xs shadow-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>LOG MAINTENANCE</span>
        </button>
      </div>

      <div className="glass-panel rounded-2xl border border-slate-800 overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 uppercase font-bold text-[10px]">
              <th className="p-3.5">Vehicle</th>
              <th className="p-3.5">Service Category</th>
              <th className="p-3.5">Service Date</th>
              <th className="p-3.5">Odometer (km)</th>
              <th className="p-3.5">Cost (₹)</th>
              <th className="p-3.5">Next Due</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {maintenance.map(m => (
              <tr key={m.id} className="hover:bg-slate-900/40">
                <td className="p-3.5 font-bold text-cyan-300 font-mono">{m.vehicle_id}</td>
                <td className="p-3.5 font-semibold text-slate-200">{m.service_type} Servicing</td>
                <td className="p-3.5">{m.service_date}</td>
                <td className="p-3.5 font-mono">{m.odometer} km</td>
                <td className="p-3.5 font-mono font-bold text-emerald-400">₹{m.cost}</td>
                <td className="p-3.5 text-slate-400">{m.next_service_date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-lg font-extrabold text-slate-100 mb-4">Log Vehicle Servicing</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Service Category</label>
                <select
                  value={formData.service_type}
                  onChange={e => setFormData({ ...formData, service_type: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                >
                  {['Engine', 'Oil', 'Brake', 'Tire', 'Battery', 'General'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Cost (₹)</label>
                  <input
                    type="number"
                    value={formData.cost}
                    onChange={e => setFormData({ ...formData, cost: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Odometer (km)</label>
                  <input
                    type="number"
                    value={formData.odometer}
                    onChange={e => setFormData({ ...formData, odometer: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold">CANCEL</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-cyan-600 text-white text-xs font-bold">SAVE LOG</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
