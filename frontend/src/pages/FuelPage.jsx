import React, { useState } from 'react';
import { Fuel, Plus } from 'lucide-react';

export const FuelPage = ({ fuel = [], onAddFuel }) => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    vehicle_id: 'VH001',
    fuel_type: 'Petrol',
    quantity_liters: 45,
    price_per_liter: 102.6,
    total_cost: 4617,
    odometer: 25000,
    date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onAddFuel) onAddFuel(formData);
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between glass-panel p-5 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
            <Fuel className="w-6 h-6 text-cyan-400" />
            <span>Fuel Consumption & Cost Analytics</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Fuel logs, liters consumed, average fuel efficiency (KM/L), and total cost tracking.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold text-xs shadow-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>LOG FUEL REFUEL</span>
        </button>
      </div>

      <div className="glass-panel rounded-2xl border border-slate-800 overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 uppercase font-bold text-[10px]">
              <th className="p-3.5">Vehicle</th>
              <th className="p-3.5">Fuel Type</th>
              <th className="p-3.5">Refuel Liters</th>
              <th className="p-3.5">Price / Liter</th>
              <th className="p-3.5">Total Cost (₹)</th>
              <th className="p-3.5">Refuel Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {fuel.map(f => (
              <tr key={f.id} className="hover:bg-slate-900/40">
                <td className="p-3.5 font-bold text-cyan-300 font-mono">{f.vehicle_id}</td>
                <td className="p-3.5 font-semibold text-slate-200">{f.fuel_type}</td>
                <td className="p-3.5 font-mono">{f.quantity_liters} Liters</td>
                <td className="p-3.5 font-mono">₹{f.price_per_liter}</td>
                <td className="p-3.5 font-mono font-bold text-emerald-400">₹{f.total_cost}</td>
                <td className="p-3.5 text-slate-400">{f.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-lg font-extrabold text-slate-100 mb-4">Log Fuel Refill</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Liters</label>
                  <input
                    type="number"
                    value={formData.quantity_liters}
                    onChange={e => {
                      const l = Number(e.target.value);
                      setFormData({ ...formData, quantity_liters: l, total_cost: parseFloat((l * formData.price_per_liter).toFixed(2)) });
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Price / Liter (₹)</label>
                  <input
                    type="number"
                    value={formData.price_per_liter}
                    onChange={e => {
                      const p = Number(e.target.value);
                      setFormData({ ...formData, price_per_liter: p, total_cost: parseFloat((formData.quantity_liters * p).toFixed(2)) });
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold">CANCEL</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-cyan-600 text-white text-xs font-bold">SAVE REFILL</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
