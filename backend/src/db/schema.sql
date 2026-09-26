-- SafeDrive AI PostgreSQL / PostGIS & SQLite compatible Schema

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'FLEET_ADMIN', -- SUPER_ADMIN, FLEET_ADMIN, VEHICLE_OWNER, DRIVER
  organization_id TEXT DEFAULT 'ORG001',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS organizations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  plan TEXT DEFAULT 'ENTERPRISE',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vehicles (
  id TEXT PRIMARY KEY,
  registration_number TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL DEFAULT 'Car', -- Car, Bike, Truck, Bus, Van, Taxi, Other
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  fuel_type TEXT DEFAULT 'Petrol',
  owner_id TEXT,
  driver_id TEXT,
  gps_device_id TEXT,
  alcohol_sensor_id TEXT,
  status TEXT DEFAULT 'STOPPED', -- MOVING, STOPPED, IDLE, OFFLINE, ALCOHOL_ALERT, SOS_ALERT
  safety_interlock_status TEXT DEFAULT 'START_ALLOWED', -- VEHICLE_READY, START_ALLOWED, START_BLOCKED, MOVING, SAFE_STOP_REQUESTED, EMERGENCY
  insurance_expiry DATE,
  last_service_date DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS drivers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  license_number TEXT NOT NULL,
  license_expiry DATE,
  vehicle_id TEXT,
  status TEXT DEFAULT 'Available', -- Available, Driving, Offline, Suspended
  safety_score INTEGER DEFAULT 95,
  overspeed_count INTEGER DEFAULT 0,
  harsh_brake_count INTEGER DEFAULT 0,
  alcohol_event_count INTEGER DEFAULT 0,
  photo_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gps_devices (
  id TEXT PRIMARY KEY,
  device_code TEXT UNIQUE NOT NULL,
  imei TEXT UNIQUE NOT NULL,
  sim_number TEXT,
  model TEXT DEFAULT 'SD-GPS-v4',
  firmware TEXT DEFAULT 'v2.4.1',
  status TEXT DEFAULT 'ONLINE', -- ONLINE, OFFLINE, FAULT, UNASSIGNED
  vehicle_id TEXT,
  installation_date DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS alcohol_sensors (
  id TEXT PRIMARY KEY,
  sensor_code TEXT UNIQUE NOT NULL,
  type TEXT DEFAULT 'MQ-3 Calibrated Automotive Grade',
  vehicle_id TEXT,
  status TEXT DEFAULT 'NORMAL', -- NORMAL, WARNING, ALCOHOL_DETECTED, SENSOR_ERROR, CALIBRATION_REQUIRED
  last_reading REAL DEFAULT 0.00,
  calibration_date DATE,
  next_calibration DATE,
  firmware TEXT DEFAULT 'v1.8.0',
  temperature REAL DEFAULT 24.5,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vehicle_locations (
  id TEXT PRIMARY KEY,
  vehicle_id TEXT NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  speed REAL DEFAULT 0.0,
  direction REAL DEFAULT 0.0,
  ignition TEXT DEFAULT 'OFF', -- ON, OFF
  battery REAL DEFAULT 98.0,
  alcohol_reading REAL DEFAULT 0.00,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS alcohol_events (
  id TEXT PRIMARY KEY,
  vehicle_id TEXT NOT NULL,
  driver_id TEXT,
  sensor_id TEXT,
  reading REAL NOT NULL,
  filtered_reading REAL NOT NULL,
  status TEXT NOT NULL, -- WARNING, ALCOHOL_DETECTED
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  speed REAL DEFAULT 0.0,
  vehicle_action TEXT NOT NULL, -- BLOCK_START, SAFE_STOP_REQUESTED
  notification_sent INTEGER DEFAULT 1,
  sms_sent INTEGER DEFAULT 1,
  call_initiated INTEGER DEFAULT 1,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sos_events (
  id TEXT PRIMARY KEY,
  vehicle_id TEXT NOT NULL,
  driver_id TEXT,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  status TEXT DEFAULT 'ACTIVE',
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS alerts (
  id TEXT PRIMARY KEY,
  vehicle_id TEXT NOT NULL,
  type TEXT NOT NULL, -- ALCOHOL_DETECTED, SOS, OVERSPEED, GEOFENCE_ENTRY, GEOFENCE_EXIT, HARSH_BRAKING, HARSH_ACCELERATION, LONG_IDLE, SENSOR_ERROR, DEVICE_OFFLINE
  severity TEXT NOT NULL DEFAULT 'HIGH', -- CRITICAL, HIGH, MEDIUM, LOW
  message TEXT NOT NULL,
  latitude REAL,
  longitude REAL,
  is_resolved INTEGER DEFAULT 0,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS geofences (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'CIRCLE', -- CIRCLE, POLYGON, RECTANGLE
  center_lat REAL NOT NULL,
  center_lng REAL NOT NULL,
  radius REAL DEFAULT 500, -- in meters
  polygon_coords TEXT, -- JSON array of points
  organization_id TEXT DEFAULT 'ORG001',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS geofence_events (
  id TEXT PRIMARY KEY,
  geofence_id TEXT NOT NULL,
  vehicle_id TEXT NOT NULL,
  event_type TEXT NOT NULL, -- ENTRY, EXIT
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS emergency_contacts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  vehicle_id TEXT,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  relationship TEXT NOT NULL, -- Father, Mother, Spouse, Fleet Manager, Safety Officer
  priority INTEGER DEFAULT 1,
  sms_enabled INTEGER DEFAULT 1,
  call_enabled INTEGER DEFAULT 1,
  push_enabled INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS emergency_calls (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  contact_id TEXT NOT NULL,
  phone TEXT NOT NULL,
  attempt_number INTEGER DEFAULT 1,
  provider_call_id TEXT,
  status TEXT DEFAULT 'COMPLETED', -- INITIATED, ANSWERED, BUSY, NO_ANSWER, FAILED, COMPLETED
  duration_sec INTEGER DEFAULT 24,
  started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  ended_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS emergency_notifications (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  contact_id TEXT NOT NULL,
  channel TEXT NOT NULL, -- SMS, PUSH, CALL
  status TEXT DEFAULT 'DELIVERED',
  message TEXT NOT NULL,
  sent_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS trips (
  id TEXT PRIMARY KEY,
  vehicle_id TEXT NOT NULL,
  driver_id TEXT,
  start_lat REAL NOT NULL,
  start_lng REAL NOT NULL,
  end_lat REAL NOT NULL,
  end_lng REAL NOT NULL,
  start_address TEXT,
  end_address TEXT,
  start_time DATETIME NOT NULL,
  end_time DATETIME,
  distance_km REAL DEFAULT 0.0,
  avg_speed REAL DEFAULT 0.0,
  max_speed REAL DEFAULT 0.0,
  duration_mins INTEGER DEFAULT 0,
  status TEXT DEFAULT 'COMPLETED'
);

CREATE TABLE IF NOT EXISTS maintenance (
  id TEXT PRIMARY KEY,
  vehicle_id TEXT NOT NULL,
  service_type TEXT NOT NULL, -- Engine, Oil, Brake, Tire, Battery, General
  service_date DATE NOT NULL,
  odometer INTEGER NOT NULL,
  cost REAL NOT NULL,
  description TEXT,
  next_service_date DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fuel_records (
  id TEXT PRIMARY KEY,
  vehicle_id TEXT NOT NULL,
  fuel_type TEXT NOT NULL,
  quantity_liters REAL NOT NULL,
  price_per_liter REAL NOT NULL,
  total_cost REAL NOT NULL,
  odometer INTEGER NOT NULL,
  date DATE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'INFO', -- EMERGENCY, WARNING, INFO
  is_read INTEGER DEFAULT 0,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  action TEXT NOT NULL,
  category TEXT NOT NULL,
  details TEXT,
  ip_address TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
