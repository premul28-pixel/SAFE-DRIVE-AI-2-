import express from 'express';
import { db, saveDb } from '../db/dbHelper.js';
import { generateToken, authenticateToken } from '../middleware/auth.js';
import { alcoholFilter } from '../services/alcoholFilter.js';
import { emergencyDispatcher } from '../services/emergencyDispatcher.js';
import { gpsSimulator } from '../services/gpsSimulator.js';

const router = express.Router();

export const createApiRouter = (io) => {
  const emitSocket = (event, data) => {
    if (io) io.emit(event, data);
  };

  // --- AUTHENTICATION ---
  router.post('/auth/register', (req, res) => {
    const { name, email, phone, password, role, organizationName } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Name, email and password are required.' });
    }

    const existing = db.users.find(u => u.email === email);
    if (existing) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    const newUser = {
      id: `USR_${Date.now()}`,
      name,
      email,
      phone: phone || '+919876543210',
      password_hash: password, // In production, bcrypt.hash
      role: role || 'FLEET_ADMIN',
      organization_id: 'ORG001',
      created_at: new Date().toISOString()
    };

    db.users.push(newUser);
    saveDb();

    const token = generateToken(newUser);
    res.status(201).json({ message: 'Registration successful!', user: newUser, token });
  });

  router.post('/auth/login', (req, res) => {
    const { email, password } = req.body;
    const user = db.users.find(u => u.email === email);

    if (!user || user.password_hash !== password) {
      return res.status(401).json({ error: 'Invalid email or password credentials.' });
    }

    const token = generateToken(user);
    res.json({ message: 'Login successful!', user, token });
  });

  router.get('/auth/me', authenticateToken, (req, res) => {
    const user = db.users.find(u => u.id === req.user.id) || req.user;
    res.json({ user });
  });

  // --- VEHICLES ---
  router.get('/vehicles', authenticateToken, (req, res) => {
    // Enrich vehicles with live location, driver, device, and sensor info
    const enriched = db.vehicles.map(v => {
      const loc = db.vehicle_locations.find(l => l.vehicle_id === v.id);
      const driver = db.drivers.find(d => d.id === v.driver_id);
      const device = db.gps_devices.find(d => d.id === v.gps_device_id);
      const sensor = db.alcohol_sensors.find(s => s.id === v.alcohol_sensor_id);
      return {
        ...v,
        location: loc || { latitude: 11.0168, longitude: 76.9558, speed: 0, ignition: 'OFF', battery: 98, alcohol_reading: 0 },
        driver: driver || { name: 'Unassigned', phone: '' },
        device: device || { device_code: 'SD-GPS-000', status: 'ONLINE' },
        sensor: sensor || { sensor_code: 'MQ3-000', status: 'NORMAL', last_reading: 0 }
      };
    });
    res.json(enriched);
  });

  router.post('/vehicles', authenticateToken, (req, res) => {
    const newV = {
      id: `VH_${Date.now()}`,
      registration_number: req.body.registration_number,
      type: req.body.type || 'Car',
      brand: req.body.brand || 'Hyundai',
      model: req.body.model || 'i20',
      year: parseInt(req.body.year) || 2024,
      fuel_type: req.body.fuel_type || 'Petrol',
      owner_id: req.user.id,
      driver_id: req.body.driver_id || null,
      gps_device_id: req.body.gps_device_id || null,
      alcohol_sensor_id: req.body.alcohol_sensor_id || null,
      status: 'STOPPED',
      safety_interlock_status: 'START_ALLOWED',
      insurance_expiry: '2027-12-31',
      last_service_date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString()
    };

    db.vehicles.push(newV);

    // Initial location
    db.vehicle_locations.push({
      id: `LOC_${newV.id}`,
      vehicle_id: newV.id,
      latitude: 11.0168,
      longitude: 76.9558,
      speed: 0,
      direction: 0,
      ignition: 'OFF',
      battery: 100,
      alcohol_reading: 0,
      timestamp: new Date().toISOString()
    });

    saveDb();
    emitSocket('vehicleStatusChanged', newV);
    res.status(201).json(newV);
  });

  router.put('/vehicles/:id', authenticateToken, (req, res) => {
    const vIndex = db.vehicles.findIndex(v => v.id === req.params.id);
    if (vIndex === -1) return res.status(404).json({ error: 'Vehicle not found.' });

    db.vehicles[vIndex] = { ...db.vehicles[vIndex], ...req.body };
    saveDb();
    res.json(db.vehicles[vIndex]);
  });

  router.delete('/vehicles/:id', authenticateToken, (req, res) => {
    db.vehicles = db.vehicles.filter(v => v.id !== req.params.id);
    saveDb();
    res.json({ message: 'Vehicle removed successfully.' });
  });

  // --- DRIVERS ---
  router.get('/drivers', authenticateToken, (req, res) => {
    const driversEnriched = db.drivers.map(d => {
      const vehicle = db.vehicles.find(v => v.id === d.vehicle_id);
      return { ...d, vehicle_number: vehicle ? vehicle.registration_number : 'Unassigned' };
    });
    res.json(driversEnriched);
  });

  router.post('/drivers', authenticateToken, (req, res) => {
    const newDriver = {
      id: `DRV_${Date.now()}`,
      name: req.body.name,
      phone: req.body.phone,
      email: req.body.email,
      license_number: req.body.license_number,
      license_expiry: req.body.license_expiry || '2029-12-31',
      vehicle_id: req.body.vehicle_id || null,
      status: 'Available',
      safety_score: 95,
      overspeed_count: 0,
      harsh_brake_count: 0,
      alcohol_event_count: 0,
      photo_url: req.body.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      created_at: new Date().toISOString()
    };
    db.drivers.push(newDriver);
    saveDb();
    res.status(201).json(newDriver);
  });

  router.put('/drivers/:id', authenticateToken, (req, res) => {
    const index = db.drivers.findIndex(d => d.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Driver not found.' });
    db.drivers[index] = { ...db.drivers[index], ...req.body };
    saveDb();
    res.json(db.drivers[index]);
  });

  // --- GPS DEVICES & SENSORS ---
  router.get('/devices', authenticateToken, (req, res) => res.json(db.gps_devices));
  router.post('/devices', authenticateToken, (req, res) => {
    const newDev = {
      id: `DEV_${Date.now()}`,
      device_code: req.body.device_code || `SD-GPS-${Date.now()}`,
      imei: req.body.imei,
      sim_number: req.body.sim_number,
      model: req.body.model || 'SD-GPS-v4 Pro',
      firmware: 'v2.4.1',
      status: 'ONLINE',
      vehicle_id: req.body.vehicle_id || null,
      installation_date: new Date().toISOString().split('T')[0]
    };
    db.gps_devices.push(newDev);
    saveDb();
    res.status(201).json(newDev);
  });

  router.get('/sensors', authenticateToken, (req, res) => res.json(db.alcohol_sensors));
  router.post('/sensors', authenticateToken, (req, res) => {
    const newSen = {
      id: `SEN_${Date.now()}`,
      sensor_code: req.body.sensor_code || `MQ3-SEN-${Date.now()}`,
      type: 'MQ-3 Calibrated Automotive Sensor',
      vehicle_id: req.body.vehicle_id || null,
      status: 'NORMAL',
      last_reading: 0.0,
      calibration_date: new Date().toISOString().split('T')[0],
      next_calibration: '2026-12-01',
      firmware: 'v1.8.0',
      temperature: 25.0
    };
    db.alcohol_sensors.push(newSen);
    saveDb();
    res.status(201).json(newSen);
  });

  router.post('/sensors/:id/calibrate', authenticateToken, (req, res) => {
    const sen = db.alcohol_sensors.find(s => s.id === req.params.id);
    if (!sen) return res.status(404).json({ error: 'Sensor not found.' });
    sen.status = 'NORMAL';
    sen.calibration_date = new Date().toISOString().split('T')[0];
    sen.last_reading = 0.0;
    saveDb();
    res.json({ message: 'Sensor calibrated successfully!', sensor: sen });
  });

  // --- TELEMETRY & ALCOHOL CHECK ---
  router.post('/device/location', (req, res) => {
    const { vehicleId, latitude, longitude, speed, ignition, battery } = req.body;
    let loc = db.vehicle_locations.find(l => l.vehicle_id === vehicleId);

    if (loc) {
      loc.latitude = latitude;
      loc.longitude = longitude;
      loc.speed = speed || 0;
      loc.ignition = ignition || 'OFF';
      loc.battery = battery || 98;
      loc.timestamp = new Date().toISOString();
    } else {
      loc = {
        id: `LOC_${vehicleId}`,
        vehicle_id: vehicleId,
        latitude, longitude, speed, ignition, battery,
        alcohol_reading: 0,
        timestamp: new Date().toISOString()
      };
      db.vehicle_locations.push(loc);
    }

    saveDb();
    emitSocket('vehicleLocationUpdated', loc);
    res.json({ message: 'Location updated', location: loc });
  });

  router.post('/alcohol-events', async (req, res) => {
    const { vehicleId, rawReading, temperature } = req.body;
    const vehicle = db.vehicles.find(v => v.id === vehicleId);

    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found.' });

    const filterResult = alcoholFilter.processSample(vehicle.alcohol_sensor_id || vehicleId, rawReading, temperature || 25);
    vehicle.safety_interlock_status = filterResult.interlockAction;

    let eventRecord = null;
    if (filterResult.status === 'ALCOHOL_DETECTED') {
      vehicle.status = 'ALCOHOL_ALERT';
      const loc = db.vehicle_locations.find(l => l.vehicle_id === vehicleId) || { latitude: 11.0168, longitude: 76.9558 };

      eventRecord = {
        id: `ALC_EVT_${Date.now()}`,
        vehicle_id: vehicleId,
        driver_id: vehicle.driver_id,
        sensor_id: vehicle.alcohol_sensor_id,
        reading: rawReading,
        filtered_reading: filterResult.filteredReading,
        status: 'ALCOHOL_DETECTED',
        latitude: loc.latitude,
        longitude: loc.longitude,
        speed: loc.speed || 0,
        vehicle_action: filterResult.interlockAction,
        timestamp: new Date().toISOString()
      };
      db.alcohol_events.unshift(eventRecord);

      await emergencyDispatcher.dispatchEmergencyWorkflow({
        type: 'ALCOHOL',
        vehicle,
        driver: db.drivers.find(d => d.id === vehicle.driver_id),
        latitude: loc.latitude,
        longitude: loc.longitude,
        alcoholReading: filterResult.filteredReading,
        emitSocket
      });
    }

    saveDb();
    res.json({ filterResult, event: eventRecord, interlockStatus: vehicle.safety_interlock_status });
  });

  // --- EMERGENCY CONTACTS & DISPATCH ---
  router.get('/emergency-contacts', authenticateToken, (req, res) => {
    res.json(db.emergency_contacts);
  });

  router.post('/emergency-contacts', authenticateToken, (req, res) => {
    const newContact = {
      id: `EMC_${Date.now()}`,
      user_id: req.user.id,
      vehicle_id: req.body.vehicle_id || 'VH001',
      name: req.body.name,
      phone: req.body.phone,
      relationship: req.body.relationship || 'Emergency Contact',
      priority: parseInt(req.body.priority) || 1,
      sms_enabled: req.body.sms_enabled ? 1 : 0,
      call_enabled: req.body.call_enabled ? 1 : 0,
      push_enabled: req.body.push_enabled ? 1 : 0
    };
    db.emergency_contacts.push(newContact);
    saveDb();
    res.status(201).json(newContact);
  });

  router.put('/emergency-contacts/:id', authenticateToken, (req, res) => {
    const idx = db.emergency_contacts.findIndex(c => c.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Contact not found.' });
    db.emergency_contacts[idx] = { ...db.emergency_contacts[idx], ...req.body };
    saveDb();
    res.json(db.emergency_contacts[idx]);
  });

  router.delete('/emergency-contacts/:id', authenticateToken, (req, res) => {
    db.emergency_contacts = db.emergency_contacts.filter(c => c.id !== req.params.id);
    saveDb();
    res.json({ message: 'Emergency contact removed.' });
  });

  router.post('/sos', async (req, res) => {
    const { vehicleId } = req.body;
    const vehicle = db.vehicles.find(v => v.id === (vehicleId || 'VH009')) || db.vehicles[0];
    const loc = db.vehicle_locations.find(l => l.vehicle_id === vehicle.id) || { latitude: 10.9920, longitude: 76.9200 };

    vehicle.status = 'SOS_ALERT';

    const dispatchResult = await emergencyDispatcher.dispatchEmergencyWorkflow({
      type: 'SOS',
      vehicle,
      driver: db.drivers.find(d => d.id === vehicle.driver_id),
      latitude: loc.latitude,
      longitude: loc.longitude,
      emitSocket
    });

    res.json({ message: '🆘 SOS Emergency alert dispatched!', dispatchResult });
  });

  router.post('/emergency/test-sms', async (req, res) => {
    const { phone, message } = req.body;
    const sms = await emergencyDispatcher.sendSms(
      { id: 'TEST_CONTACT', name: 'Test Recipient', phone: phone || '+919876543290' },
      message || 'SafeDrive AI Test Emergency SMS Alert.',
      'TEST_EVT_001'
    );
    res.json({ message: 'Test SMS dispatched successfully!', details: sms });
  });

  router.post('/emergency/test-call', async (req, res) => {
    const { phone } = req.body;
    await emergencyDispatcher.initiateAutomatedCallWithRetry(
      'TEST_EVT_CALL',
      { id: 'TEST_CONTACT', name: 'Test Recipient', phone: phone || '+919876543290', call_enabled: 1 },
      'This is a SafeDrive AI automated test emergency phone call.'
    );
    res.json({ message: 'Test Automated Phone Call initiated!' });
  });

  router.get('/emergency-calls', authenticateToken, (req, res) => res.json(db.emergency_calls));

  // --- GEOFENCES ---
  router.get('/geofences', authenticateToken, (req, res) => res.json(db.geofences));
  router.post('/geofences', authenticateToken, (req, res) => {
    const newGf = {
      id: `GEO_${Date.now()}`,
      name: req.body.name,
      type: req.body.type || 'CIRCLE',
      center_lat: parseFloat(req.body.center_lat) || 11.0168,
      center_lng: parseFloat(req.body.center_lng) || 76.9558,
      radius: parseFloat(req.body.radius) || 1000,
      organization_id: 'ORG001'
    };
    db.geofences.push(newGf);
    saveDb();
    res.status(201).json(newGf);
  });

  // --- TRIPS, ALERTS, MAINTENANCE, FUEL, REPORTS, ANALYTICS ---
  router.get('/trips', authenticateToken, (req, res) => res.json(db.trips));
  router.get('/alerts', authenticateToken, (req, res) => res.json(db.alerts));
  router.put('/alerts/:id/resolve', authenticateToken, (req, res) => {
    const alt = db.alerts.find(a => a.id === req.params.id);
    if (alt) alt.is_resolved = 1;
    saveDb();
    res.json({ message: 'Alert resolved', alert: alt });
  });

  router.get('/maintenance', authenticateToken, (req, res) => res.json(db.maintenance));
  router.post('/maintenance', authenticateToken, (req, res) => {
    const newM = {
      id: `MNT_${Date.now()}`,
      vehicle_id: req.body.vehicle_id,
      service_type: req.body.service_type || 'General',
      service_date: req.body.service_date || new Date().toISOString().split('T')[0],
      odometer: parseInt(req.body.odometer) || 25000,
      cost: parseFloat(req.body.cost) || 3500,
      description: req.body.description || 'Regular servicing',
      next_service_date: req.body.next_service_date || '2027-01-01'
    };
    db.maintenance.push(newM);
    saveDb();
    res.status(201).json(newM);
  });

  router.get('/fuel', authenticateToken, (req, res) => res.json(db.fuel_records));
  router.post('/fuel', authenticateToken, (req, res) => {
    const newF = {
      id: `FUL_${Date.now()}`,
      vehicle_id: req.body.vehicle_id,
      fuel_type: req.body.fuel_type || 'Diesel',
      quantity_liters: parseFloat(req.body.quantity_liters) || 40,
      price_per_liter: parseFloat(req.body.price_per_liter) || 92.4,
      total_cost: parseFloat(req.body.total_cost) || 3696,
      odometer: parseInt(req.body.odometer) || 25000,
      date: req.body.date || new Date().toISOString().split('T')[0]
    };
    db.fuel_records.push(newF);
    saveDb();
    res.status(201).json(newF);
  });

  router.get('/reports', authenticateToken, (req, res) => {
    res.json({
      summary: {
        totalVehicles: db.vehicles.length,
        totalTrips: db.trips.length,
        totalAlcoholEvents: db.alcohol_events.length,
        totalSosEvents: db.sos_events.length,
        totalMaintenanceCost: db.maintenance.reduce((acc, m) => acc + m.cost, 0),
        totalFuelCost: db.fuel_records.reduce((acc, f) => acc + f.total_cost, 0)
      },
      vehicles: db.vehicles,
      alerts: db.alerts,
      trips: db.trips
    });
  });

  router.get('/analytics', authenticateToken, (req, res) => {
    res.json({
      vehicleStatusDistribution: {
        MOVING: db.vehicles.filter(v => v.status === 'MOVING').length,
        STOPPED: db.vehicles.filter(v => v.status === 'STOPPED').length,
        IDLE: db.vehicles.filter(v => v.status === 'IDLE').length,
        OFFLINE: db.vehicles.filter(v => v.status === 'OFFLINE').length,
        ALCOHOL_ALERT: db.vehicles.filter(v => v.status === 'ALCOHOL_ALERT').length,
        SOS_ALERT: db.vehicles.filter(v => v.status === 'SOS_ALERT').length
      },
      alertsTrend: [
        { day: 'Mon', alcohol: 0, overspeed: 2, sos: 0 },
        { day: 'Tue', alcohol: 1, overspeed: 4, sos: 0 },
        { day: 'Wed', alcohol: 0, overspeed: 1, sos: 1 },
        { day: 'Thu', alcohol: 2, overspeed: 3, sos: 0 },
        { day: 'Fri', alcohol: 1, overspeed: 5, sos: 1 },
        { day: 'Sat', alcohol: 0, overspeed: 2, sos: 0 },
        { day: 'Sun', alcohol: 1, overspeed: 1, sos: 0 }
      ]
    });
  });

  router.get('/notifications', authenticateToken, (req, res) => res.json(db.notifications));
  router.put('/notifications/:id/read', authenticateToken, (req, res) => {
    const n = db.notifications.find(x => x.id === req.params.id);
    if (n) n.is_read = 1;
    saveDb();
    res.json({ message: 'Notification marked read' });
  });

  router.get('/audit-logs', authenticateToken, (req, res) => res.json(db.audit_logs));

  // --- DEMO CONTROL SIMULATOR TRIGGERS ---
  router.post('/demo/simulate-alcohol', async (req, res) => {
    const { vehicleId, rawReading } = req.body;
    const targetVId = vehicleId || 'VH001';
    const reading = parseFloat(rawReading || 0.45);

    const vehicle = db.vehicles.find(v => v.id === targetVId);
    if (vehicle) {
      vehicle.status = 'ALCOHOL_ALERT';
      vehicle.safety_interlock_status = 'START_BLOCKED';

      const loc = db.vehicle_locations.find(l => l.vehicle_id === targetVId) || { latitude: 11.0168, longitude: 76.9558 };
      loc.alcohol_reading = reading;

      const alcEvent = {
        id: `ALC_SIM_${Date.now()}`,
        vehicle_id: targetVId,
        driver_id: vehicle.driver_id,
        sensor_id: vehicle.alcohol_sensor_id,
        reading,
        filtered_reading: reading,
        status: 'ALCOHOL_DETECTED',
        latitude: loc.latitude,
        longitude: loc.longitude,
        speed: loc.speed || 0,
        vehicle_action: 'BLOCK_START',
        timestamp: new Date().toISOString()
      };
      db.alcohol_events.unshift(alcEvent);

      await emergencyDispatcher.dispatchEmergencyWorkflow({
        type: 'ALCOHOL',
        vehicle,
        driver: db.drivers.find(d => d.id === vehicle.driver_id),
        latitude: loc.latitude,
        longitude: loc.longitude,
        alcoholReading: reading,
        emitSocket
      });
    }

    saveDb();
    res.json({ message: '🧪 DEMO: Alcohol impairment event simulated successfully!', vehicleId: targetVId, reading });
  });

  router.post('/demo/simulate-sos', async (req, res) => {
    const targetVId = req.body.vehicleId || 'VH009';
    const vehicle = db.vehicles.find(v => v.id === targetVId);
    if (vehicle) {
      vehicle.status = 'SOS_ALERT';
      const loc = db.vehicle_locations.find(l => l.vehicle_id === targetVId) || { latitude: 10.9920, longitude: 76.9200 };

      await emergencyDispatcher.dispatchEmergencyWorkflow({
        type: 'SOS',
        vehicle,
        driver: db.drivers.find(d => d.id === vehicle.driver_id),
        latitude: loc.latitude,
        longitude: loc.longitude,
        emitSocket
      });
    }
    res.json({ message: '🧪 DEMO: SOS alert simulated successfully!' });
  });

  return router;
};
