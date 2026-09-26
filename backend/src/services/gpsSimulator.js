import { db, saveDb } from '../db/dbHelper.js';
import { geofenceEngine } from './geofenceEngine.js';
import { alcoholFilter } from './alcoholFilter.js';

/**
 * SafeDrive AI GPS Telemetry & Vehicle Movement Simulator
 * Provides real-time movement across map coordinates with speed, battery, ignition,
 * alcohol readings, overspeed detection and Socket.IO/MQTT broadcasting.
 */
export class GpsSimulatorService {
  constructor() {
    this.isRunning = false;
    this.intervalId = null;
    this.emitSocket = null;
    this.OVERSPEED_LIMIT = 80.0; // km/h

    // Custom route waypoints centered around Coimbatore / Tamil Nadu region
    this.routes = {
      VH001: [
        { lat: 11.0168, lng: 76.9558 }, { lat: 11.0200, lng: 76.9600 }, { lat: 11.0250, lng: 76.9700 },
        { lat: 11.0300, lng: 76.9800 }, { lat: 11.0280, lng: 76.9900 }, { lat: 11.0200, lng: 76.9700 }
      ],
      VH002: [
        { lat: 11.0250, lng: 76.9620 }, { lat: 11.0300, lng: 76.9700 }, { lat: 11.0400, lng: 76.9850 },
        { lat: 11.0450, lng: 76.9900 }, { lat: 11.0350, lng: 76.9750 }
      ],
      VH004: [
        { lat: 11.0310, lng: 76.9800 }, { lat: 11.0400, lng: 76.9950 }, { lat: 11.0500, lng: 77.0100 },
        { lat: 11.0600, lng: 77.0250 }, { lat: 11.0450, lng: 77.0000 }
      ],
      VH007: [
        { lat: 11.0420, lng: 76.9320 }, { lat: 11.0500, lng: 76.9400 }, { lat: 11.0620, lng: 76.9550 },
        { lat: 11.0750, lng: 76.9700 }, { lat: 11.0550, lng: 76.9450 }
      ],
      VH010: [
        { lat: 11.0280, lng: 76.9580 }, { lat: 11.0350, lng: 76.9650 }, { lat: 11.0450, lng: 76.9750 },
        { lat: 11.0500, lng: 76.9800 }, { lat: 11.0380, lng: 76.9680 }
      ]
    };

    this.routeIndices = { VH001: 0, VH002: 0, VH004: 0, VH007: 0, VH010: 0 };
  }

  start(emitSocketFn) {
    if (this.isRunning) return;
    this.isRunning = true;
    this.emitSocket = emitSocketFn;

    console.log('🌐 [GPS SIMULATOR] Started live GPS telemetry simulator (Update rate: 3 seconds)');

    this.intervalId = setInterval(() => {
      this.stepSimulation();
    }, 3000);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('⏹️ [GPS SIMULATOR] Telemetry simulation paused.');
  }

  stepSimulation() {
    const movingVehicles = ['VH001', 'VH002', 'VH004', 'VH007', 'VH010'];

    for (const vId of movingVehicles) {
      const route = this.routes[vId];
      if (!route) continue;

      let idx = this.routeIndices[vId] || 0;
      const targetWaypoint = route[idx];

      // Add minor realistic jitter (+/- 0.0002)
      const latJitter = (Math.random() - 0.5) * 0.0004;
      const lngJitter = (Math.random() - 0.5) * 0.0004;
      const currentLat = parseFloat((targetWaypoint.lat + latJitter).toFixed(6));
      const currentLng = parseFloat((targetWaypoint.lng + lngJitter).toFixed(6));

      // Speed generation between 40 km/h and 90 km/h (VH007 randomly exceeds 80 km/h for overspeed demo)
      let speed = Math.floor(42 + Math.random() * 35);
      if (vId === 'VH007' && Math.random() > 0.5) {
        speed = 88; // Trigger overspeed test
      }

      const direction = Math.floor(Math.random() * 360);
      const timestamp = new Date().toISOString();

      // Find vehicle & location record in database
      const vehicle = db.vehicles.find(v => v.id === vId);
      let locRecord = db.vehicle_locations.find(l => l.vehicle_id === vId);

      if (vehicle && locRecord) {
        locRecord.latitude = currentLat;
        locRecord.longitude = currentLng;
        locRecord.speed = speed;
        locRecord.direction = direction;
        locRecord.battery = Math.max(70, Math.floor(locRecord.battery - 0.01));
        locRecord.timestamp = timestamp;

        vehicle.status = 'MOVING';

        // 1. Check Overspeed Alert
        if (speed > this.OVERSPEED_LIMIT) {
          const existingAlert = db.alerts.find(a => a.vehicle_id === vId && a.type === 'OVERSPEED' && a.is_resolved === 0);
          if (!existingAlert) {
            const overspeedAlert = {
              id: `ALT_SPD_${Date.now()}_${vId}`,
              vehicle_id: vId,
              type: 'OVERSPEED',
              severity: 'HIGH',
              message: `⚠️ OVERSPEED ALERT! Vehicle ${vehicle.registration_number} travelling at ${speed} km/h (Limit: ${this.OVERSPEED_LIMIT} km/h).`,
              latitude: currentLat,
              longitude: currentLng,
              is_resolved: 0,
              timestamp
            };
            db.alerts.unshift(overspeedAlert);
            if (this.emitSocket) this.emitSocket('overspeedDetected', overspeedAlert);
          }
        }

        // 2. Evaluate Geofence Engine
        geofenceEngine.evaluateLocation(vId, currentLat, currentLng, this.emitSocket);

        // 3. Emit real-time WebSocket packet
        if (this.emitSocket) {
          this.emitSocket('vehicleLocationUpdated', {
            vehicleId: vId,
            registrationNumber: vehicle.registration_number,
            latitude: currentLat,
            longitude: currentLng,
            speed,
            direction,
            ignition: locRecord.ignition,
            battery: locRecord.battery,
            alcoholReading: locRecord.alcohol_reading,
            status: vehicle.status,
            safetyInterlock: vehicle.safety_interlock_status,
            timestamp
          });
        }
      }

      // Advance route index
      this.routeIndices[vId] = (idx + 1) % route.length;
    }
  }

  /**
   * Developer manual trigger simulation for any custom starting lat/lng & destination
   */
  startCustomSimulation(vehicleId, startLat, startLng, destLat, destLng, speed = 60) {
    const steps = 10;
    let stepCount = 0;

    const timer = setInterval(() => {
      stepCount++;
      const factor = stepCount / steps;
      const curLat = parseFloat((startLat + (destLat - startLat) * factor).toFixed(6));
      const curLng = parseFloat((startLng + (destLng - startLng) * factor).toFixed(6));

      const vehicle = db.vehicles.find(v => v.id === vehicleId);
      let locRecord = db.vehicle_locations.find(l => l.vehicle_id === vehicleId);

      if (vehicle && locRecord) {
        locRecord.latitude = curLat;
        locRecord.longitude = curLng;
        locRecord.speed = speed;
        locRecord.ignition = 'ON';
        locRecord.timestamp = new Date().toISOString();

        if (this.emitSocket) {
          this.emitSocket('vehicleLocationUpdated', {
            vehicleId,
            registrationNumber: vehicle.registration_number,
            latitude: curLat,
            longitude: curLng,
            speed,
            ignition: 'ON',
            timestamp: locRecord.timestamp
          });
        }
      }

      if (stepCount >= steps) {
        clearInterval(timer);
      }
    }, 2000);
  }
}

export const gpsSimulator = new GpsSimulatorService();
