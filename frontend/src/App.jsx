import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { SosModal } from './components/SosModal';
import { useSocket } from './context/SocketContext';

import { Dashboard } from './pages/Dashboard';
import { LiveTracking } from './pages/LiveTracking';
import { VehiclesPage } from './pages/VehiclesPage';
import { DriversPage } from './pages/DriversPage';
import { DevicesSensorsPage } from './pages/DevicesSensorsPage';
import { GeofencesPage } from './pages/GeofencesPage';
import { TripsPage } from './pages/TripsPage';
import { EmergencyContactsPage } from './pages/EmergencyContactsPage';
import { AlertsPage } from './pages/AlertsPage';
import { MaintenancePage } from './pages/MaintenancePage';
import { FuelPage } from './pages/FuelPage';
import { ReportsPage } from './pages/ReportsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { IotFirmwarePage } from './pages/IotFirmwarePage';

export function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);

  // Core Data States
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [devices, setDevices] = useState([]);
  const [sensors, setSensors] = useState([]);
  const [geofences, setGeofences] = useState([]);
  const [trips, setTrips] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [fuel, setFuel] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  const { liveLocations, latestAlert } = useSocket();

  // Load initial data from backend API
  const fetchAllData = async () => {
    try {
      const [vRes, dRes, devRes, senRes, geoRes, tripRes, altRes, emcRes, mntRes, fulRes, logRes] = await Promise.all([
        fetch('http://localhost:5000/api/vehicles').then(r => r.json()),
        fetch('http://localhost:5000/api/drivers').then(r => r.json()),
        fetch('http://localhost:5000/api/devices').then(r => r.json()),
        fetch('http://localhost:5000/api/sensors').then(r => r.json()),
        fetch('http://localhost:5000/api/geofences').then(r => r.json()),
        fetch('http://localhost:5000/api/trips').then(r => r.json()),
        fetch('http://localhost:5000/api/alerts').then(r => r.json()),
        fetch('http://localhost:5000/api/emergency-contacts').then(r => r.json()),
        fetch('http://localhost:5000/api/maintenance').then(r => r.json()),
        fetch('http://localhost:5000/api/fuel').then(r => r.json()),
        fetch('http://localhost:5000/api/audit-logs').then(r => r.json())
      ]);

      setVehicles(vRes || []);
      setDrivers(dRes || []);
      setDevices(devRes || []);
      setSensors(senRes || []);
      setGeofences(geoRes || []);
      setTrips(tripRes || []);
      setAlerts(altRes || []);
      setContacts(emcRes || []);
      setMaintenance(mntRes || []);
      setFuel(fulRes || []);
      setAuditLogs(logRes || []);
    } catch (err) {
      console.error('Error fetching backend datasets:', err.message);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Update vehicle location in real-time when WebSocket packets arrive
  useEffect(() => {
    if (Object.keys(liveLocations).length > 0) {
      setVehicles(prev => prev.map(v => {
        const liveLoc = liveLocations[v.id];
        if (liveLoc) {
          return {
            ...v,
            status: liveLoc.status || v.status,
            safety_interlock_status: liveLoc.safetyInterlock || v.safety_interlock_status,
            location: {
              latitude: liveLoc.latitude,
              longitude: liveLoc.longitude,
              speed: liveLoc.speed,
              direction: liveLoc.direction,
              ignition: liveLoc.ignition,
              battery: liveLoc.battery,
              alcohol_reading: liveLoc.alcoholReading || 0
            }
          };
        }
        return v;
      }));
    }
  }, [liveLocations]);

  // Handle Real-Time Alerts
  useEffect(() => {
    if (latestAlert) {
      setAlerts(prev => [latestAlert, ...prev]);
    }
  }, [latestAlert]);

  // --- Handlers ---
  const handleSimulateAlcohol = async (vehicleId, rawReading) => {
    try {
      const res = await fetch('http://localhost:5000/api/demo/simulate-alcohol', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicleId, rawReading })
      }).then(r => r.json());

      fetchAllData();
    } catch (e) {
      console.error(e.message);
    }
  };

  const handleStartGpsSim = (vehicleId, startLat, startLng, destLat, destLng, speed) => {
    console.log(`Starting simulator for ${vehicleId}...`);
  };

  const handleTriggerSos = async () => {
    await fetch('http://localhost:5000/api/sos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vehicleId: 'VH009' })
    });
    fetchAllData();
  };

  const handleAddVehicle = async (vData) => {
    await fetch('http://localhost:5000/api/vehicles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vData)
    });
    fetchAllData();
  };

  const handleAddDriver = async (dData) => {
    await fetch('http://localhost:5000/api/drivers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dData)
    });
    fetchAllData();
  };

  const handleAddContact = async (cData) => {
    await fetch('http://localhost:5000/api/emergency-contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cData)
    });
    fetchAllData();
  };

  const handleAddGeofence = async (gData) => {
    await fetch('http://localhost:5000/api/geofences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(gData)
    });
    fetchAllData();
  };

  const handleCalibrateSensor = async (sId) => {
    await fetch(`http://localhost:5000/api/sensors/${sId}/calibrate`, {
      method: 'POST'
    });
    fetchAllData();
  };

  const handleTestSms = async (phone, message) => {
    return await fetch('http://localhost:5000/api/emergency/test-sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, message })
    }).then(r => r.json());
  };

  const handleTestCall = async (phone) => {
    return await fetch('http://localhost:5000/api/emergency/test-call', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone })
    }).then(r => r.json());
  };

  const handleResolveAlert = async (altId) => {
    await fetch(`http://localhost:5000/api/alerts/${altId}/resolve`, {
      method: 'PUT'
    });
    fetchAllData();
  };

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            vehicles={vehicles}
            alerts={alerts}
            geofences={geofences}
            onSimulateAlcohol={handleSimulateAlcohol}
            onStartGpsSim={handleStartGpsSim}
          />
        );
      case 'tracking':
        return (
          <LiveTracking
            vehicles={vehicles}
            geofences={geofences}
            onStartGpsSim={handleStartGpsSim}
          />
        );
      case 'vehicles':
        return (
          <VehiclesPage
            vehicles={vehicles}
            drivers={drivers}
            onAddVehicle={handleAddVehicle}
          />
        );
      case 'drivers':
        return (
          <DriversPage
            drivers={drivers}
            onAddDriver={handleAddDriver}
          />
        );
      case 'devices':
        return (
          <DevicesSensorsPage
            devices={devices}
            sensors={sensors}
            onCalibrateSensor={handleCalibrateSensor}
          />
        );
      case 'geofences':
        return (
          <GeofencesPage
            geofences={geofences}
            onAddGeofence={handleAddGeofence}
          />
        );
      case 'trips':
        return <TripsPage trips={trips} />;
      case 'emergency':
        return (
          <EmergencyContactsPage
            contacts={contacts}
            onAddContact={handleAddContact}
            onTestSms={handleTestSms}
            onTestCall={handleTestCall}
          />
        );
      case 'alerts':
        return <AlertsPage alerts={alerts} onResolveAlert={handleResolveAlert} />;
      case 'maintenance':
        return <MaintenancePage maintenance={maintenance} />;
      case 'fuel':
        return <FuelPage fuel={fuel} />;
      case 'reports':
        return <ReportsPage vehicles={vehicles} alerts={alerts} trips={trips} maintenance={maintenance} fuel={fuel} />;
      case 'analytics':
        return <AnalyticsPage vehicles={vehicles} alerts={alerts} />;
      case 'settings':
        return <SettingsPage />;
      case 'audit':
        return <AuditLogsPage logs={auditLogs} />;
      case 'firmware':
        return <IotFirmwarePage />;
      default:
        return <Dashboard vehicles={vehicles} alerts={alerts} geofences={geofences} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSosModal={() => setIsSosModalOpen(true)}
      />

      <div className="flex flex-1">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 p-6 max-w-7xl mx-auto w-full overflow-y-auto">
          {renderActivePage()}
        </main>
      </div>

      <SosModal
        isOpen={isSosModalOpen}
        onClose={() => setIsSosModalOpen(false)}
        onTriggerSos={handleTriggerSos}
        vehicle={vehicles[0]}
      />
    </div>
  );
}
