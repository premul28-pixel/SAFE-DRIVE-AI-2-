import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbFilePath = path.join(__dirname, 'safedrive_db.json');

// In-Memory Data Store
export const db = {
  users: [],
  organizations: [],
  vehicles: [],
  drivers: [],
  gps_devices: [],
  alcohol_sensors: [],
  vehicle_locations: [],
  alcohol_events: [],
  sos_events: [],
  alerts: [],
  geofences: [],
  geofence_events: [],
  emergency_contacts: [],
  emergency_calls: [],
  emergency_notifications: [],
  trips: [],
  maintenance: [],
  fuel_records: [],
  notifications: [],
  audit_logs: []
};

export const saveDb = () => {
  try {
    fs.writeFileSync(dbFilePath, JSON.stringify(db, null, 2));
  } catch (e) {
    console.error('Error saving DB file:', e.message);
  }
};

export const loadDb = () => {
  try {
    if (fs.existsSync(dbFilePath)) {
      const data = fs.readFileSync(dbFilePath, 'utf-8');
      const parsed = JSON.parse(data);
      Object.assign(db, parsed);
      console.log('Loaded SafeDrive AI database from disk.');
    } else {
      seedDemoData();
      saveDb();
    }
  } catch (e) {
    console.error('Error loading DB file, seeding defaults:', e.message);
    seedDemoData();
    saveDb();
  }
};

export const seedDemoData = () => {
  console.log('Initializing SafeDrive AI default dataset...');

  db.organizations = [
    { id: 'ORG001', name: 'SafeDrive Logistics & Transit Hub', plan: 'ENTERPRISE', created_at: new Date().toISOString() }
  ];

  db.users = [
    { id: 'USR001', name: 'Super Admin', email: 'admin@safedrive.ai', phone: '+919876543210', password_hash: 'admin123', role: 'SUPER_ADMIN', organization_id: 'ORG001', created_at: new Date().toISOString() },
    { id: 'USR002', name: 'Fleet Manager Rajesh', email: 'fleet@safedrive.ai', phone: '+919876543211', password_hash: 'fleet123', role: 'FLEET_ADMIN', organization_id: 'ORG001', created_at: new Date().toISOString() },
    { id: 'USR003', name: 'Vehicle Owner Priya', email: 'owner@safedrive.ai', phone: '+919876543212', password_hash: 'owner123', role: 'VEHICLE_OWNER', organization_id: 'ORG001', created_at: new Date().toISOString() },
    { id: 'USR004', name: 'Arun Kumar (Driver)', email: 'arun@safedrive.ai', phone: '+919876543213', password_hash: 'driver123', role: 'DRIVER', organization_id: 'ORG001', created_at: new Date().toISOString() }
  ];

  db.vehicles = [
    { id: 'VH001', registration_number: 'TN38AB1234', type: 'Car', brand: 'Hyundai', model: 'Creta 2024', year: 2024, fuel_type: 'Petrol', owner_id: 'USR003', driver_id: 'DRV001', gps_device_id: 'DEV001', alcohol_sensor_id: 'SEN001', status: 'MOVING', safety_interlock_status: 'START_ALLOWED', insurance_expiry: '2027-12-31', last_service_date: '2026-08-15' },
    { id: 'VH002', registration_number: 'TN38CD5678', type: 'Taxi', brand: 'Toyota', model: 'Innova Crysta', year: 2023, fuel_type: 'Diesel', owner_id: 'USR003', driver_id: 'DRV002', gps_device_id: 'DEV002', alcohol_sensor_id: 'SEN002', status: 'MOVING', safety_interlock_status: 'START_ALLOWED', insurance_expiry: '2027-12-31', last_service_date: '2026-08-15' },
    { id: 'VH003', registration_number: 'TN38EF9012', type: 'Truck', brand: 'Tata', model: 'Prima 4928.S', year: 2022, fuel_type: 'Diesel', owner_id: 'USR003', driver_id: 'DRV003', gps_device_id: 'DEV003', alcohol_sensor_id: 'SEN003', status: 'ALCOHOL_ALERT', safety_interlock_status: 'START_BLOCKED', insurance_expiry: '2027-12-31', last_service_date: '2026-08-15' },
    { id: 'VH004', registration_number: 'TN38GH3456', type: 'Bus', brand: 'Ashok Leyland', model: 'Viking AC', year: 2023, fuel_type: 'Diesel', owner_id: 'USR003', driver_id: 'DRV004', gps_device_id: 'DEV004', alcohol_sensor_id: 'SEN004', status: 'MOVING', safety_interlock_status: 'START_ALLOWED', insurance_expiry: '2027-12-31', last_service_date: '2026-08-15' },
    { id: 'VH005', registration_number: 'TN38IJ7890', type: 'Van', brand: 'Force', model: 'Traveller 3050', year: 2024, fuel_type: 'Diesel', owner_id: 'USR003', driver_id: 'DRV005', gps_device_id: 'DEV005', alcohol_sensor_id: 'SEN005', status: 'STOPPED', safety_interlock_status: 'START_ALLOWED', insurance_expiry: '2027-12-31', last_service_date: '2026-08-15' },
    { id: 'VH006', registration_number: 'TN38KL2345', type: 'Car', brand: 'Tata', model: 'Nexon EV', year: 2024, fuel_type: 'Electric', owner_id: 'USR003', driver_id: 'DRV006', gps_device_id: 'DEV006', alcohol_sensor_id: 'SEN006', status: 'IDLE', safety_interlock_status: 'START_ALLOWED', insurance_expiry: '2027-12-31', last_service_date: '2026-08-15' },
    { id: 'VH007', registration_number: 'TN38MN6789', type: 'Bike', brand: 'Royal Enfield', model: 'Himalayan 450', year: 2023, fuel_type: 'Petrol', owner_id: 'USR003', driver_id: 'DRV007', gps_device_id: 'DEV007', alcohol_sensor_id: 'SEN007', status: 'MOVING', safety_interlock_status: 'START_ALLOWED', insurance_expiry: '2027-12-31', last_service_date: '2026-08-15' },
    { id: 'VH008', registration_number: 'TN38OP0123', type: 'Car', brand: 'Mahindra', model: 'XUV700', year: 2024, fuel_type: 'Diesel', owner_id: 'USR003', driver_id: 'DRV008', gps_device_id: 'DEV008', alcohol_sensor_id: 'SEN008', status: 'OFFLINE', safety_interlock_status: 'START_ALLOWED', insurance_expiry: '2027-12-31', last_service_date: '2026-08-15' },
    { id: 'VH009', registration_number: 'TN38QR4567', type: 'Truck', brand: 'BharatBenz', model: '2823C', year: 2022, fuel_type: 'Diesel', owner_id: 'USR003', driver_id: 'DRV009', gps_device_id: 'DEV009', alcohol_sensor_id: 'SEN009', status: 'SOS_ALERT', safety_interlock_status: 'START_ALLOWED', insurance_expiry: '2027-12-31', last_service_date: '2026-08-15' },
    { id: 'VH010', registration_number: 'TN38ST8901', type: 'Taxi', brand: 'Maruti', model: 'Ertiga CNG', year: 2023, fuel_type: 'CNG', owner_id: 'USR003', driver_id: 'DRV010', gps_device_id: 'DEV010', alcohol_sensor_id: 'SEN010', status: 'MOVING', safety_interlock_status: 'START_ALLOWED', insurance_expiry: '2027-12-31', last_service_date: '2026-08-15' }
  ];

  db.drivers = [
    { id: 'DRV001', name: 'Arun Kumar', phone: '+919876543213', email: 'arun.k@safedrive.ai', license_number: 'TN38-2021000101', license_expiry: '2029-10-15', vehicle_id: 'VH001', status: 'Driving', safety_score: 96, overspeed_count: 1, harsh_brake_count: 0, alcohol_event_count: 0, photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80' },
    { id: 'DRV002', name: 'Suresh Raina', phone: '+919876543214', email: 'suresh.r@safedrive.ai', license_number: 'TN38-2021000102', license_expiry: '2029-10-15', vehicle_id: 'VH002', status: 'Driving', safety_score: 92, overspeed_count: 2, harsh_brake_count: 1, alcohol_event_count: 0, photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80' },
    { id: 'DRV003', name: 'Vikas Sharma', phone: '+919876543215', email: 'vikas.s@safedrive.ai', license_number: 'TN38-2021000103', license_expiry: '2029-10-15', vehicle_id: 'VH003', status: 'Suspended', safety_score: 55, overspeed_count: 4, harsh_brake_count: 3, alcohol_event_count: 2, photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80' },
    { id: 'DRV004', name: 'Karthik Raja', phone: '+919876543216', email: 'karthik.r@safedrive.ai', license_number: 'TN38-2021000104', license_expiry: '2029-10-15', vehicle_id: 'VH004', status: 'Driving', safety_score: 98, overspeed_count: 0, harsh_brake_count: 0, alcohol_event_count: 0, photo_url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=250&q=80' },
    { id: 'DRV005', name: 'Manish Verma', phone: '+919876543217', email: 'manish.v@safedrive.ai', license_number: 'TN38-2021000105', license_expiry: '2029-10-15', vehicle_id: 'VH005', status: 'Available', safety_score: 88, overspeed_count: 1, harsh_brake_count: 2, alcohol_event_count: 0, photo_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=250&q=80' },
    { id: 'DRV006', name: 'Deepak Patel', phone: '+919876543218', email: 'deepak.p@safedrive.ai', license_number: 'TN38-2021000106', license_expiry: '2029-10-15', vehicle_id: 'VH006', status: 'Driving', safety_score: 94, overspeed_count: 0, harsh_brake_count: 1, alcohol_event_count: 0, photo_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=250&q=80' },
    { id: 'DRV007', name: 'Rohan Gupta', phone: '+919876543219', email: 'rohan.g@safedrive.ai', license_number: 'TN38-2021000107', license_expiry: '2029-10-15', vehicle_id: 'VH007', status: 'Driving', safety_score: 90, overspeed_count: 3, harsh_brake_count: 1, alcohol_event_count: 0, photo_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=250&q=80' },
    { id: 'DRV008', name: 'Anil Deshmukh', phone: '+919876543220', email: 'anil.d@safedrive.ai', license_number: 'TN38-2021000108', license_expiry: '2029-10-15', vehicle_id: 'VH008', status: 'Offline', safety_score: 85, overspeed_count: 2, harsh_brake_count: 2, alcohol_event_count: 0, photo_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=250&q=80' },
    { id: 'DRV009', name: 'Balaji Natarajan', phone: '+919876543221', email: 'balaji.n@safedrive.ai', license_number: 'TN38-2021000109', license_expiry: '2029-10-15', vehicle_id: 'VH009', status: 'Driving', safety_score: 82, overspeed_count: 2, harsh_brake_count: 3, alcohol_event_count: 0, photo_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=250&q=80' },
    { id: 'DRV010', name: 'Ganesh Pillai', phone: '+919876543222', email: 'ganesh.p@safedrive.ai', license_number: 'TN38-2021000110', license_expiry: '2029-10-15', vehicle_id: 'VH010', status: 'Driving', safety_score: 95, overspeed_count: 1, harsh_brake_count: 0, alcohol_event_count: 0, photo_url: 'https://images.unsplash.com/photo-1513956589380-bad6acb9b9d4?auto=format&fit=crop&w=250&q=80' }
  ];

  for (let i = 1; i <= 10; i++) {
    const pad = String(i).padStart(3, '0');
    db.gps_devices.push({
      id: `DEV${pad}`,
      device_code: `SD-GPS-${pad}`,
      imei: `867451049283${pad}`,
      sim_number: `+919900011${pad}`,
      model: 'SD-GPS-v4 Pro',
      firmware: 'v2.4.1',
      status: i === 8 ? 'OFFLINE' : 'ONLINE',
      vehicle_id: `VH${pad}`,
      installation_date: '2024-01-10'
    });

    db.alcohol_sensors.push({
      id: `SEN${pad}`,
      sensor_code: `MQ3-SEN-${pad}`,
      type: 'MQ-3 Calibrated Automotive Sensor',
      vehicle_id: `VH${pad}`,
      status: i === 3 ? 'ALCOHOL_DETECTED' : 'NORMAL',
      last_reading: i === 3 ? 0.42 : 0.00,
      calibration_date: '2026-06-01',
      next_calibration: '2026-12-01',
      firmware: 'v1.8.0',
      temperature: 25.2
    });
  }

  db.emergency_contacts = [
    { id: 'EMC001', user_id: 'USR001', vehicle_id: 'VH001', name: 'Primary Contact (Father)', phone: '+919876543290', relationship: 'Father', priority: 1, sms_enabled: 1, call_enabled: 1, push_enabled: 1 },
    { id: 'EMC002', user_id: 'USR001', vehicle_id: 'VH001', name: 'Secondary Contact (Fleet Officer)', phone: '+919876543291', relationship: 'Safety Officer', priority: 2, sms_enabled: 1, call_enabled: 1, push_enabled: 1 },
    { id: 'EMC003', user_id: 'USR001', vehicle_id: 'VH003', name: 'Transport Dispatch HQ', phone: '+919876543292', relationship: 'Fleet Manager', priority: 1, sms_enabled: 1, call_enabled: 1, push_enabled: 1 }
  ];

  db.geofences = [
    { id: 'GEO001', name: 'Coimbatore HQ Depot', type: 'CIRCLE', center_lat: 11.0168, center_lng: 76.9558, radius: 1200, organization_id: 'ORG001' },
    { id: 'GEO002', name: 'Chennai Logistics Hub', type: 'CIRCLE', center_lat: 13.0827, center_lng: 80.2707, radius: 2500, organization_id: 'ORG001' },
    { id: 'GEO003', name: 'Bangalore Tech Corridor', type: 'CIRCLE', center_lat: 12.9716, center_lng: 77.5946, radius: 1800, organization_id: 'ORG001' }
  ];

  const initialLocs = [
    { vId: 'VH001', lat: 11.0168, lng: 76.9558, spd: 48, ign: 'ON', alc: 0.00 },
    { vId: 'VH002', lat: 11.0250, lng: 76.9620, spd: 55, ign: 'ON', alc: 0.00 },
    { vId: 'VH003', lat: 11.0080, lng: 76.9450, spd: 0, ign: 'OFF', alc: 0.42 },
    { vId: 'VH004', lat: 11.0310, lng: 76.9800, spd: 62, ign: 'ON', alc: 0.00 },
    { vId: 'VH005', lat: 11.0120, lng: 76.9500, spd: 0, ign: 'OFF', alc: 0.00 },
    { vId: 'VH006', lat: 11.0190, lng: 76.9710, spd: 38, ign: 'ON', alc: 0.00 },
    { vId: 'VH007', lat: 11.0420, lng: 76.9320, spd: 72, ign: 'ON', alc: 0.00 },
    { vId: 'VH008', lat: 11.0500, lng: 76.9900, spd: 0, ign: 'OFF', alc: 0.00 },
    { vId: 'VH009', lat: 10.9920, lng: 76.9200, spd: 45, ign: 'ON', alc: 0.00 },
    { vId: 'VH010', lat: 11.0280, lng: 76.9580, spd: 51, ign: 'ON', alc: 0.00 }
  ];

  db.vehicle_locations = initialLocs.map(l => ({
    id: `LOC_${l.vId}`,
    vehicle_id: l.vId,
    latitude: l.lat,
    longitude: l.lng,
    speed: l.spd,
    direction: 90.0,
    ignition: l.ign,
    battery: 98.0,
    alcohol_reading: l.alc,
    timestamp: new Date().toISOString()
  }));

  db.alcohol_events = [
    { id: 'ALC_EVT_001', vehicle_id: 'VH003', driver_id: 'DRV003', sensor_id: 'SEN003', reading: 0.42, filtered_reading: 0.40, status: 'ALCOHOL_DETECTED', latitude: 11.0080, longitude: 76.9450, speed: 0.0, vehicle_action: 'BLOCK_START', notification_sent: 1, sms_sent: 1, call_initiated: 1, timestamp: new Date().toISOString() }
  ];

  db.sos_events = [
    { id: 'SOS_EVT_001', vehicle_id: 'VH009', driver_id: 'DRV009', latitude: 10.9920, longitude: 76.9200, status: 'ACTIVE', timestamp: new Date().toISOString() }
  ];

  db.alerts = [
    { id: 'ALT001', vehicle_id: 'VH003', type: 'ALCOHOL_DETECTED', severity: 'CRITICAL', message: '🚨 ALCOHOL IMPAIRMENT DETECTED! Sensor MQ-3 read 0.42 BAC. Ignition interlock BLOCKED start.', latitude: 11.0080, longitude: 76.9450, is_resolved: 0, timestamp: new Date().toISOString() },
    { id: 'ALT002', vehicle_id: 'VH009', type: 'SOS', severity: 'CRITICAL', message: '🆘 DRIVER EMERGENCY SOS TRIGGERED! Vehicle location transmitted to dispatch.', latitude: 10.9920, longitude: 76.9200, is_resolved: 0, timestamp: new Date().toISOString() },
    { id: 'ALT003', vehicle_id: 'VH007', type: 'OVERSPEED', severity: 'HIGH', message: '⚠️ Overspeed Alert! Vehicle moving at 92 km/h (Limit: 80 km/h).', latitude: 11.0420, longitude: 76.9320, is_resolved: 0, timestamp: new Date().toISOString() }
  ];

  db.trips = [
    { id: 'TRP001', vehicle_id: 'VH001', driver_id: 'DRV001', start_lat: 11.0000, start_lng: 76.9500, end_lat: 11.0168, end_lng: 76.9558, start_address: 'Gandhipuram Terminal', end_address: 'Coimbatore HQ Depot', start_time: new Date(Date.now() - 3600000).toISOString(), end_time: new Date().toISOString(), distance_km: 18.5, avg_speed: 42.0, max_speed: 68.0, duration_mins: 34, status: 'COMPLETED' },
    { id: 'TRP002', vehicle_id: 'VH002', driver_id: 'DRV002', start_lat: 11.0200, start_lng: 76.9600, end_lat: 11.0250, end_lng: 76.9620, start_address: 'Railway Station Gate 1', end_address: 'Tidel Park Coimbatore', start_time: new Date(Date.now() - 1800000).toISOString(), end_time: new Date().toISOString(), distance_km: 12.2, avg_speed: 48.0, max_speed: 72.0, duration_mins: 22, status: 'COMPLETED' }
  ];

  db.maintenance = [
    { id: 'MNT001', vehicle_id: 'VH001', service_type: 'Oil', service_date: '2026-08-10', odometer: 24500, cost: 4500.0, description: 'Engine oil & synthetic filter replacement', next_service_date: '2026-12-10' },
    { id: 'MNT002', vehicle_id: 'VH003', service_type: 'Brake', service_date: '2026-07-22', odometer: 58200, cost: 12800.0, description: 'Front brake pad and rotor replacement', next_service_date: '2027-01-22' },
    { id: 'MNT003', vehicle_id: 'VH004', service_type: 'Tire', service_date: '2026-09-01', odometer: 89000, cost: 34000.0, description: 'All 6 radial heavy duty tires replaced & aligned', next_service_date: '2027-03-01' }
  ];

  db.fuel_records = [
    { id: 'FUL001', vehicle_id: 'VH001', fuel_type: 'Petrol', quantity_liters: 42.5, price_per_liter: 102.6, total_cost: 4360.5, odometer: 24500, date: '2026-09-20' },
    { id: 'FUL002', vehicle_id: 'VH002', fuel_type: 'Diesel', quantity_liters: 50.0, price_per_liter: 92.4, total_cost: 4620.0, odometer: 41200, date: '2026-09-21' },
    { id: 'FUL003', vehicle_id: 'VH004', fuel_type: 'Diesel', quantity_liters: 180.0, price_per_liter: 92.4, total_cost: 16632.0, odometer: 89100, date: '2026-09-22' }
  ];

  db.audit_logs = [
    { id: 'LOG001', user_id: 'USR001', action: 'SYSTEM_START', category: 'SYSTEM', details: 'SafeDrive AI Telematics Core initialized.', ip_address: '127.0.0.1', timestamp: new Date().toISOString() },
    { id: 'LOG002', user_id: 'USR001', action: 'INTERLOCK_TRIGGERED', category: 'SAFETY', details: 'Vehicle TN38EF9012 safety interlock engaged: START_BLOCKED', ip_address: '127.0.0.1', timestamp: new Date().toISOString() }
  ];

  console.log('SafeDrive AI database initialized with 10 vehicles, 10 drivers, 10 devices, sensors & initial logs.');
};
