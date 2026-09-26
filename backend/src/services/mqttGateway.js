import mqtt from 'mqtt';
import { db, saveDb } from '../db/dbHelper.js';
import { alcoholFilter } from './alcoholFilter.js';
import { emergencyDispatcher } from './emergencyDispatcher.js';

/**
 * SafeDrive AI MQTT IoT Gateway Service
 * Connects to MQTT Broker (or operates simulated broker topic handler)
 * for ESP32 hardware payloads on topics:
 *  - safedrive/{deviceId}/location
 *  - safedrive/{deviceId}/alcohol
 *  - safedrive/{deviceId}/status
 *  - safedrive/{deviceId}/sos
 */
export class MqttGatewayService {
  constructor() {
    this.client = null;
    this.emitSocket = null;
  }

  init(emitSocketFn, mqttUrl = process.env.MQTT_URL || 'mqtt://broker.hivemq.com:1883') {
    this.emitSocket = emitSocketFn;

    try {
      console.log(`📡 [MQTT GATEWAY] Connecting to MQTT broker at ${mqttUrl}...`);
      this.client = mqtt.connect(mqttUrl, {
        clientId: `SafeDrive_Backend_${Math.random().toString(16).substr(2, 8)}`,
        clean: true,
        connectTimeout: 4000,
        reconnectPeriod: 10000
      });

      this.client.on('connect', () => {
        console.log('✅ [MQTT GATEWAY] Connected to MQTT broker!');
        // Subscribe to all safedrive IoT topics
        this.client.subscribe('safedrive/+/location');
        this.client.subscribe('safedrive/+/alcohol');
        this.client.subscribe('safedrive/+/status');
        this.client.subscribe('safedrive/+/sos');
        this.client.subscribe('safedrive/+/heartbeat');
      });

      this.client.on('message', (topic, message) => {
        this.handleIncomingMqttMessage(topic, message.toString());
      });

      this.client.on('error', (err) => {
        console.log(`⚠️ [MQTT GATEWAY] MQTT connection warning: ${err.message}. Using simulated WebSocket IoT channel.`);
      });
    } catch (e) {
      console.log('⚠️ [MQTT GATEWAY] MQTT client initialization error:', e.message);
    }
  }

  handleIncomingMqttMessage(topic, payloadStr) {
    try {
      const parts = topic.split('/');
      const deviceId = parts[1];
      const channel = parts[2];
      const payload = JSON.parse(payloadStr);

      console.log(`📥 [MQTT RECV] Topic: ${topic} | Payload:`, payload);

      const device = db.gps_devices.find(d => d.id === deviceId || d.device_code === deviceId);
      const vehicleId = device ? device.vehicle_id : payload.vehicleId || 'VH001';
      const vehicle = db.vehicles.find(v => v.id === vehicleId);

      if (channel === 'alcohol') {
        const rawVal = parseFloat(payload.reading || 0.0);
        const temp = parseFloat(payload.temperature || 25.0);

        // Process through noise filter algorithm
        const filterResult = alcoholFilter.processSample(deviceId, rawVal, temp);

        if (vehicle) {
          vehicle.safety_interlock_status = filterResult.interlockAction;
          if (filterResult.status === 'ALCOHOL_DETECTED') {
            vehicle.status = 'ALCOHOL_ALERT';
            // Trigger emergency workflow
            emergencyDispatcher.dispatchEmergencyWorkflow({
              type: 'ALCOHOL',
              vehicle,
              driver: db.drivers.find(d => d.id === vehicle.driver_id),
              latitude: payload.latitude || 11.0168,
              longitude: payload.longitude || 76.9558,
              alcoholReading: filterResult.filteredReading,
              emitSocket: this.emitSocket
            });
          }
        }
      } else if (channel === 'sos') {
        if (vehicle) {
          vehicle.status = 'SOS_ALERT';
          emergencyDispatcher.dispatchEmergencyWorkflow({
            type: 'SOS',
            vehicle,
            driver: db.drivers.find(d => d.id === vehicle.driver_id),
            latitude: payload.latitude || 11.0168,
            longitude: payload.longitude || 76.9558,
            emitSocket: this.emitSocket
          });
        }
      }

      saveDb();
    } catch (err) {
      console.error('Error handling MQTT message:', err.message);
    }
  }

  publishCommand(deviceId, command, payload = {}) {
    if (this.client && this.client.connected) {
      const topic = `safedrive/${deviceId}/cmd/${command}`;
      this.client.publish(topic, JSON.stringify(payload));
      console.log(`📤 [MQTT PUB] Topic: ${topic} | Command: ${command}`);
    }
  }
}

export const mqttGateway = new MqttGatewayService();
