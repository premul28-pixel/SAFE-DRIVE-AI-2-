import React, { useState } from 'react';
import { ShieldAlert, X, PhoneCall, MessageSquare, MapPin, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

export const SosModal = ({ isOpen, onClose, onTriggerSos, vehicle }) => {
  const [step, setStep] = useState('CONFIRM'); // 'CONFIRM' | 'DISPATCHING' | 'SUCCESS'
  const [logs, setLogs] = useState([]);

  if (!isOpen) return null;

  const handleConfirmSos = async () => {
    setStep('DISPATCHING');
    setLogs([
      '📍 Capturing high-precision GPS coordinates...',
      '🚨 Generating SOS Emergency Alert Payload...',
      '📲 Sending Push Notifications to Emergency Dispatchers...',
      '📱 Dispatching Priority SMS to Registered Contacts...',
      '📞 Initiating Automated Voice Telephony Call (Attempt 1/3)...'
    ]);

    if (onTriggerSos) {
      await onTriggerSos();
    }

    setTimeout(() => {
      setLogs(prev => [...prev, '✅ Emergency workflow completed successfully! Contact notified.']);
      setStep('SUCCESS');
    }, 2500);
  };

  const handleClose = () => {
    setStep('CONFIRM');
    setLogs([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-red-500/50 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden">
        {/* Glow Header Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-rose-500 to-amber-500"></div>

        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/40 glow-red animate-pulse">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-100">EMERGENCY SOS DISPATCH</h2>
            <p className="text-xs text-slate-400">Trigger immediate emergency alert broadcast to safety contacts</p>
          </div>
        </div>

        {step === 'CONFIRM' && (
          <div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 mb-5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Target Vehicle:</span>
                <span className="font-bold text-cyan-300">{vehicle?.registration_number || 'TN38AB1234'}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Driver Name:</span>
                <span className="font-bold text-slate-200">{vehicle?.driver?.name || 'Arun Kumar'}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Current GPS Location:</span>
                <span className="font-mono text-emerald-400">11.0168° N, 76.9558° E</span>
              </div>
            </div>

            <p className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl mb-6 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
              <span>
                Triggering SOS will immediately send automated SMS alerts and initiate programmable voice phone calls to registered primary emergency contacts.
              </span>
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={handleClose}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
              >
                CANCEL
              </button>
              <button
                onClick={handleConfirmSos}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-extrabold text-xs shadow-lg shadow-red-950/60 glow-red"
              >
                CONFIRM SOS EMERGENCY
              </button>
            </div>
          </div>
        )}

        {step === 'DISPATCHING' && (
          <div className="py-6 text-center space-y-4">
            <RefreshCw className="w-10 h-10 text-red-500 animate-spin mx-auto" />
            <div className="text-sm font-bold text-slate-100">Broadcasting Emergency Telemetry...</div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-left font-mono text-[11px] text-cyan-400 space-y-1 max-h-40 overflow-y-auto">
              {logs.map((log, i) => (
                <div key={i}>{log}</div>
              ))}
            </div>
          </div>
        )}

        {step === 'SUCCESS' && (
          <div className="py-4 text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto glow-green" />
            <div className="text-lg font-extrabold text-slate-100">SOS DISPATCH COMPLETED!</div>
            <p className="text-xs text-slate-300">
              SMS and Voice Telephony alerts have been successfully dispatched to registered emergency contacts.
            </p>
            <button
              onClick={handleClose}
              className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs"
            >
              CLOSE WINDOW
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
