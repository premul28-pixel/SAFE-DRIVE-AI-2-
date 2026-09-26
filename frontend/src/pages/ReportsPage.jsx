import React, { useState } from 'react';
import { FileText, Download, FileSpreadsheet, FileCheck, Printer } from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

export const ReportsPage = ({ vehicles = [], alerts = [], trips = [], maintenance = [], fuel = [] }) => {
  const [reportType, setReportType] = useState('alcohol');

  const exportPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor(2, 132, 199); // SafeDrive Cyan
    doc.text('SafeDrive AI - Official Telematics & Safety Report', 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()} | Tagline: Detect. Prevent. Protect.`, 14, 28);

    if (reportType === 'alcohol' || reportType === 'alerts') {
      doc.autoTable({
        startY: 35,
        head: [['ID', 'Vehicle', 'Alert Type', 'Severity', 'Timestamp', 'Message']],
        body: alerts.map(a => [a.id, a.vehicle_id, a.type, a.severity, new Date(a.timestamp).toLocaleString(), a.message])
      });
    } else if (reportType === 'vehicles') {
      doc.autoTable({
        startY: 35,
        head: [['Reg Number', 'Brand', 'Model', 'Category', 'Status', 'Interlock State']],
        body: vehicles.map(v => [v.registration_number, v.brand, v.model, v.type, v.status, v.safety_interlock_status])
      });
    } else {
      doc.autoTable({
        startY: 35,
        head: [['Trip ID', 'Vehicle', 'Start Address', 'End Address', 'Distance (km)', 'Avg Speed']],
        body: trips.map(t => [t.id, t.vehicle_id, t.start_address, t.end_address, t.distance_km, t.avg_speed])
      });
    }

    doc.save(`SafeDrive_${reportType}_Report_${Date.now()}.pdf`);
  };

  const exportExcel = () => {
    const dataToExport = reportType === 'vehicles' ? vehicles : alerts;
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'ReportData');
    XLSX.writeFile(workbook, `SafeDrive_${reportType}_Report_${Date.now()}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
            <FileText className="w-6 h-6 text-cyan-400" />
            <span>Telematics & Safety Report Export Center</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Generate and export PDF, Excel, and CSV reports for fleet compliance and alcohol safety audits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportPdf}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>EXPORT PDF</span>
          </button>
          <button
            onClick={exportExcel}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>EXPORT EXCEL</span>
          </button>
        </div>
      </div>

      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <label className="block text-xs font-bold uppercase text-slate-400">Select Report Type</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { id: 'alcohol', label: 'Alcohol Event Report' },
            { id: 'alerts', label: 'All Safety Alerts' },
            { id: 'vehicles', label: 'Vehicle Fleet Report' },
            { id: 'trips', label: 'Trip Telemetry Report' }
          ].map(r => (
            <button
              key={r.id}
              onClick={() => setReportType(r.id)}
              className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                reportType === r.id
                  ? 'bg-cyan-600/30 border-cyan-500 text-cyan-300 shadow-md'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-panel p-5 rounded-2xl border border-slate-800">
        <h3 className="text-sm font-bold text-slate-100 mb-3">Report Preview Data</h3>
        <div className="text-xs text-slate-400 font-mono">
          Ready to export {reportType === 'alcohol' ? alerts.length : vehicles.length} rows of authenticated telematics records.
        </div>
      </div>
    </div>
  );
};
