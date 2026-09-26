import { db, saveDb } from '../db/dbHelper.js';

/**
 * SafeDrive AI Geofencing Calculation Engine
 * Supports Circle geofences (center + radius meters) and Polygon geofences.
 */
export class GeofenceEngineService {
  constructor() {
    // Keeps track of vehicle geofence state: `${vehicleId}_${geofenceId}` -> boolean inside
    this.vehicleState = new Map();
  }

  /**
   * Haversine formula to compute distance between two lat/lng coordinates in meters
   */
  getDistanceMeters(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Earth radius in meters
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Point-in-polygon check for polygon geofences
   */
  isPointInPolygon(point, polygon) {
    let x = point[0], y = point[1];
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      let xi = polygon[i][0], yi = polygon[i][1];
      let xj = polygon[j][0], yj = polygon[j][1];
      let intersect = ((yi > y) !== (yj > y)) &&
        (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }

  /**
   * Evaluate all registered geofences for a vehicle's new GPS position
   */
  evaluateLocation(vehicleId, latitude, longitude, emitSocket) {
    const geofences = db.geofences;
    const eventsTriggered = [];

    for (const gf of geofences) {
      let isInside = false;

      if (gf.type === 'CIRCLE') {
        const dist = this.getDistanceMeters(latitude, longitude, gf.center_lat, gf.center_lng);
        isInside = dist <= (gf.radius || 500);
      } else if (gf.type === 'POLYGON' && gf.polygon_coords) {
        try {
          const coords = typeof gf.polygon_coords === 'string' ? JSON.parse(gf.polygon_coords) : gf.polygon_coords;
          isInside = this.isPointInPolygon([latitude, longitude], coords);
        } catch (e) {
          isInside = false;
        }
      }

      const stateKey = `${vehicleId}_${gf.id}`;
      const wasInside = this.vehicleState.get(stateKey) || false;

      if (isInside && !wasInside) {
        // ENTRY Event
        this.vehicleState.set(stateKey, true);
        const alertRecord = {
          id: `ALT_GEO_ENTRY_${Date.now()}_${Math.floor(Math.random()*1000)}`,
          vehicle_id: vehicleId,
          type: 'GEOFENCE_ENTRY',
          severity: 'MEDIUM',
          message: `📍 Vehicle ${vehicleId} entered geofence zone: "${gf.name}".`,
          latitude,
          longitude,
          is_resolved: 0,
          timestamp: new Date().toISOString()
        };
        db.alerts.unshift(alertRecord);
        eventsTriggered.push(alertRecord);
        if (emitSocket) emitSocket('geofenceEntered', alertRecord);
      } else if (!isInside && wasInside) {
        // EXIT Event
        this.vehicleState.set(stateKey, false);
        const alertRecord = {
          id: `ALT_GEO_EXIT_${Date.now()}_${Math.floor(Math.random()*1000)}`,
          vehicle_id: vehicleId,
          type: 'GEOFENCE_EXIT',
          severity: 'MEDIUM',
          message: `📍 Vehicle ${vehicleId} exited geofence zone: "${gf.name}".`,
          latitude,
          longitude,
          is_resolved: 0,
          timestamp: new Date().toISOString()
        };
        db.alerts.unshift(alertRecord);
        eventsTriggered.push(alertRecord);
        if (emitSocket) emitSocket('geofenceExited', alertRecord);
      }
    }

    if (eventsTriggered.length > 0) saveDb();
    return eventsTriggered;
  }
}

export const geofenceEngine = new GeofenceEngineService();
