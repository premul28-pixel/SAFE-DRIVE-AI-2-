import React, { useState } from 'react';
import { Sliders, ShieldCheck, Save, Key } from 'lucide-react';

export const SettingsPage = () => {
  const [overspeedLimit, setOverspeedLimit] = useState(80);
  const [bacThreshold, setBacThreshold] = useState(0.08);
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="glass-panel p-5 rounded-2xl border border-slate-800">
        <h1 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
          <Sliders className="w-6 h-6 text-cyan-400" />
          <span>System Settings & Safety Thresholds</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure maximum speed limits, breathalyzer threshold limits, SMS/Voice provider API keys, and privacy controls.
        </p>
      </div>

      <form onSubmit={handleSave} className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6 max-w-2xl">
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-cyan-300 uppercase tracking-wider">Safety Thresholds</h3>
          
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Maximum Overspeed Limit (km/h)
            </label>
            <input
              type="number"
              value={overspeedLimit}
              onChange={e => setOverspeedLimit(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Alcohol BAC Warning Threshold (mg/L)
            </label>
            <input
              type="number"
              step="0.01"
              value={bacThreshold}
              onChange={e => setBacThreshold(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
            />
          </div>
        </div>

        <div className="space-y-4 border-t border-slate-800 pt-4">
          <h3 className="text-sm font-bold text-cyan-300 uppercase tracking-wider">Telephony API Keys (Twilio / Exotel / Vonage)</h3>
          
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">SMS Provider Key / SID</label>
            <input
              type="password"
              value="AC_TWILIO_SECRET_KEY_SANDBOX_2026"
              readOnly
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Voice Telephony Auth Token</label>
            <input
              type="password"
              value="TWILIO_AUTH_TOKEN_ENCRYPTED_ENV"
              readOnly
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-400"
            />
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>{saved ? 'SETTINGS SAVED!' : 'SAVE SYSTEM SETTINGS'}</span>
        </button>
      </form>
    </div>
  );
};
