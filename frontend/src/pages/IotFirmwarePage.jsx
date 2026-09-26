import React, { useState } from 'react';
import { Terminal, Copy, Check, Cpu, Zap, Wifi } from 'lucide-react';

export const IotFirmwarePage = () => {
  const [copied, setCopied] = useState(false);

  const cppCode = `/*
 * SafeDrive AI - ESP32 IoT Smart Alcohol Sensor & Telematics Firmware
 * Hardware Pinout:
 *  - MQ-3 Alcohol Sensor: Analog Pin VP (GPIO 36)
 *  - NEO-6M GPS Module: RX (GPIO 16), TX (GPIO 17) [UART2]
 *  - Relay Interlock (DC Motor / Starter Cut): GPIO 26
 *  - Piezo Buzzer: GPIO 25
 *  - Status LEDs: Green (GPIO 18), Yellow (GPIO 19), Red (GPIO 21)
 *  - SOS Push Button: GPIO 34 (Pull-Up Interrupt)
 */

#include <WiFi.h>
#include <PubSubClient.h>
#include <TinyGPS++.h>

// WiFi & MQTT Broker Config
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* mqtt_server = "broker.hivemq.com";
const int mqtt_port = 1883;
const char* device_id = "SD-GPS-001";

// Hardware Pins
#define MQ3_PIN 36
#define RELAY_PIN 26
#define BUZZER_PIN 25
#define LED_GREEN 18
#define LED_YELLOW 19
#define LED_RED 21
#define SOS_BUTTON_PIN 34

WiFiClient espClient;
PubSubClient client(espClient);
TinyGPSPlus gps;
HardwareSerial SerialGPS(2);

// Moving Average Filter Buffer (5 Samples)
const int SAMPLE_COUNT = 5;
float samples[SAMPLE_COUNT];
int sampleIndex = 0;

void setup() {
  Serial.begin(115200);
  SerialGPS.begin(9600, SERIAL_8N1, 16, 17);

  pinMode(MQ3_PIN, INPUT);
  pinMode(RELAY_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(LED_GREEN, OUTPUT);
  pinMode(LED_YELLOW, OUTPUT);
  pinMode(LED_RED, OUTPUT);
  pinMode(SOS_BUTTON_PIN, INPUT_PULLUP);

  digitalWrite(RELAY_PIN, HIGH); // START ALLOWED
  digitalWrite(LED_GREEN, HIGH);

  connectWiFi();
  client.setServer(mqtt_server, mqtt_port);
}

void loop() {
  if (!client.connected()) {
    reconnectMQTT();
  }
  client.loop();

  // Read GPS Stream
  while (SerialGPS.available() > 0) {
    gps.encode(SerialGPS.read());
  }

  // 1. Read & Filter MQ-3 Alcohol Sensor Reading
  float rawADC = analogRead(MQ3_PIN);
  float bacValue = (rawADC / 4095.0) * 0.50; // Calibrated BAC scale

  samples[sampleIndex] = bacValue;
  sampleIndex = (sampleIndex + 1) % SAMPLE_COUNT;

  float sum = 0;
  for (int i = 0; i < SAMPLE_COUNT; i++) sum += samples[i];
  float filteredBAC = sum / SAMPLE_COUNT;

  // 2. Safety Interlock Logic
  if (filteredBAC >= 0.20) {
    // ALCOHOL DETECTED
    digitalWrite(RELAY_PIN, LOW); // BLOCK START / DISENGAGE RELAY
    digitalWrite(LED_RED, HIGH);
    digitalWrite(LED_GREEN, LOW);
    digitalWrite(LED_YELLOW, LOW);
    tone(BUZZER_PIN, 1000); // Audible Warning Buzzer

    publishAlcoholAlert(filteredBAC, "ALCOHOL_DETECTED");
  } else if (filteredBAC >= 0.08) {
    digitalWrite(LED_YELLOW, HIGH);
    digitalWrite(LED_RED, LOW);
    noTone(BUZZER_PIN);
  } else {
    digitalWrite(RELAY_PIN, HIGH); // START ALLOWED
    digitalWrite(LED_GREEN, HIGH);
    digitalWrite(LED_RED, LOW);
    digitalWrite(LED_YELLOW, LOW);
    noTone(BUZZER_PIN);
  }

  // 3. Publish Telemetry every 3 seconds
  static unsigned long lastPub = 0;
  if (millis() - lastPub > 3000) {
    lastPub = millis();
    publishTelemetry(filteredBAC);
  }
}

void publishTelemetry(float bac) {
  String topic = "safedrive/" + String(device_id) + "/location";
  String payload = "{\\"deviceId\\":\\"" + String(device_id) +
                   "\\",\\"latitude\\":" + String(gps.location.lat(), 6) +
                   ",\\"longitude\\":" + String(gps.location.lng(), 6) +
                   ",\\"speed\\":" + String(gps.speed.kmph()) +
                   ",\\"alcoholReading\\":" + String(bac) + "}";
  client.publish(topic.c_str(), payload.c_str());
}

void publishAlcoholAlert(float bac, const char* status) {
  String topic = "safedrive/" + String(device_id) + "/alcohol";
  String payload = "{\\"deviceId\\":\\"" + String(device_id) +
                   "\\",\\"reading\\":" + String(bac) +
                   ",\\"status\\":\\"" + String(status) + "\\"}";
  client.publish(topic.c_str(), payload.c_str());
}

void connectWiFi() {
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
  }
}

void reconnectMQTT() {
  while (!client.connected()) {
    if (client.connect(device_id)) {
      client.subscribe("safedrive/+/cmd/#");
    } else {
      delay(2000);
    }
  }
}
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(cppCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between glass-panel p-5 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
            <Terminal className="w-6 h-6 text-cyan-400" />
            <span>ESP32 Arduino IoT Hardware Firmware</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Complete Arduino C++ sketch for ESP32, MQ-3 alcohol sensor, NEO-6M GPS, relay interlock, buzzer, and MQTT telemetry.
          </p>
        </div>

        <button
          onClick={handleCopy}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs border border-slate-700 flex items-center gap-2 shadow-lg"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'CODE COPIED!' : 'COPY C++ CODE'}</span>
        </button>
      </div>

      <div className="glass-panel p-4 rounded-2xl border border-slate-800">
        <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-cyan-300 overflow-x-auto max-h-[500px]">
          <code>{cppCode}</code>
        </pre>
      </div>
    </div>
  );
};
