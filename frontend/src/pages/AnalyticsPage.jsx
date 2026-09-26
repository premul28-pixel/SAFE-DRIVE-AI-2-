import React from 'react';
import { BarChart3, TrendingUp, PieChart, Activity } from 'lucide-react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement
);

export const AnalyticsPage = ({ vehicles = [], alerts = [] }) => {
  const statusCounts = {
    MOVING: vehicles.filter(v => v.status === 'MOVING').length,
    STOPPED: vehicles.filter(v => v.status === 'STOPPED').length,
    IDLE: vehicles.filter(v => v.status === 'IDLE').length,
    OFFLINE: vehicles.filter(v => v.status === 'OFFLINE').length,
    ALCOHOL_ALERT: vehicles.filter(v => v.status === 'ALCOHOL_ALERT').length,
    SOS_ALERT: vehicles.filter(v => v.status === 'SOS_ALERT').length
  };

  const pieData = {
    labels: ['Moving', 'Stopped', 'Idle', 'Offline', 'Alcohol Alert', 'SOS Alert'],
    datasets: [{
      data: [statusCounts.MOVING, statusCounts.STOPPED, statusCounts.IDLE, statusCounts.OFFLINE, statusCounts.ALCOHOL_ALERT, statusCounts.SOS_ALERT],
      backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#64748b', '#ef4444', '#dc2626']
    }]
  };

  const trendData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Alcohol Impairment Events',
        data: [0, 1, 0, 2, 1, 0, 1],
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.4)'
      },
      {
        label: 'Overspeed Violations',
        data: [2, 4, 1, 3, 5, 2, 1],
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.4)'
      }
    ]
  };

  return (
    <div className="space-y-6">
      <div className="glass-panel p-5 rounded-2xl border border-slate-800">
        <h1 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-cyan-400" />
          <span>Telematics Predictive Analytics & Safety Metrics</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Visual insights into fleet utilization, impairment occurrence trends, and driver risk scores.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <h3 className="text-sm font-bold text-slate-100 mb-4 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-cyan-400" /> Fleet Status Distribution
          </h3>
          <div className="h-64 flex items-center justify-center">
            <Pie data={pieData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <h3 className="text-sm font-bold text-slate-100 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-red-400" /> Weekly Safety Incident Trends
          </h3>
          <div className="h-64">
            <Line data={trendData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
      </div>
    </div>
  );
};
