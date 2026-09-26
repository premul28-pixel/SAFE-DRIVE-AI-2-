# SafeDrive AI

> **Tagline:** "Detect. Prevent. Protect."

**SafeDrive AI** is a complete, modern, production-ready **Smart Drunk-Driving Detection, Vehicle Ignition Safety Interlock, Real-time GPS Telematics, and Emergency Notification Platform**.

---

## 🌟 Key Features

1. **Smart Drunk-Driving Impairment Detection**:
   - Calibrated MQ-3 breathalyzer sensor processing.
   - 5-sample moving average noise filter algorithm & 15-second thermal warmup stabilization check.
   - Pre-ignition start decision engine (`START_ALLOWED` vs `START_BLOCKED`).
   - Safe pull-over protocol for in-transit impairment detection.

2. **Vehicle Safety Ignition Interlock Simulation**:
   - Hardware relay & DC motor interlock state controller (`VEHICLE_READY`, `START_ALLOWED`, `START_BLOCKED`, `MOVING`, `SAFE_STOP_REQUESTED`).
   - Prevents starting when impaired while enforcing safe pull-over procedures on road vehicles.

3. **Real-time GPS Tracking & Interactive Simulator**:
   - Live Leaflet interactive map with custom color-coded status pins:
     - 🟢 **GREEN**: Moving
     - 🔴 **RED**: Alert (Alcohol Impairment or SOS)
     - 🟠 **ORANGE**: Idle
     - ⚪ **GRAY**: Offline
     - 🔵 **BLUE**: Parked
   - Full developer GPS Telemetry Simulator allowing trajectory movement between custom start/end waypoints without physical hardware.

4. **Multi-Channel Emergency Alert Dispatcher**:
   - Priority-based contact emergency routing (Primary Contact Father, Fleet Manager, Safety Officer).
   - Instant Mobile Push Notifications.
   - SMS Alerts via Twilio/Vonage/Exotel integration.
   - Automated Programmable Voice Calls with retry loop (up to 3 attempts, 30s interval delay).
   - Emergency SOS Button modal.

5. **Fleet & Telematics Management**:
   - 10 Pre-loaded Demo Vehicles, Drivers, GPS Devices, MQ-3 Sensors, Geofences, Trips, Maintenance, and Fuel records.
   - Geofencing Engine (Circle & Polygon zones with instant entry/exit alerts).
   - Driver Safety Scoring (0–100 score based on overspeed, harsh braking, and alcohol events).
   - Maintenance & Fuel Cost Trackers.
   - Exportable Reports (PDF & Excel format).
   - Analytics Dashboard (Chart.js charts).
   - Role-Based Access Control (Super Admin, Fleet Admin, Vehicle Owner, Driver).

6. **IoT Hardware Integration**:
   - Complete C++ ESP32 Arduino sketch (`iot_firmware/esp32_safedrive.ino`) for MQ-3 sensor, NEO-6M GPS, SIM800L 4G/GSM, Relays, Buzzer, LEDs, and MQTT payloads.

---

## 🏗️ Architecture Overview

```
              DRIVER
                |
                v
         ALCOHOL SENSOR (MQ-3)
                |
                v
         IoT CONTROLLER (ESP32)
         /            \
        /              \
       v                v
 GPS MODULE (NEO-6M) VEHICLE IGNITION CONTROL (Relay / DC Motor)
       |                |
       v                v
  4G / Wi-Fi       Safety Interlock (START_BLOCKED)
       |
       v
   CLOUD SERVER (Node.js + Express)
       |
 +-----+-----+
 |           |
 v           v
DATABASE    REAL-TIME SERVER (WebSocket & MQTT Gateway)
 |           |
 +-----+-----+
       |
       v
  SAFE DRIVE API
       |
 +-----+-----+-----+-----+
 |     |     |     |     |
 v     v     v     v     v
Mobile Web  Push  SMS  Voice
 App  Admin FCM   API  Calling
 |
 v
EMERGENCY CONTACTS (Priority Retry Loop)
```

---

## ⚡ Technology Stack

- **Frontend**: React 18, Vite, Lucide Icons, Leaflet Maps (`react-leaflet`), Chart.js, TailwindCSS.
- **Backend**: Node.js, Express.js, Socket.IO, MQTT (`mqtt`), JWT Authentication, CORS.
- **Database**: Pure JS In-Memory DB with JSON File Persistence out-of-the-box + PostGIS PostgreSQL ready schema (`schema.sql`).
- **IoT Firmware**: ESP32 C++ Arduino Sketch with PubSubClient & TinyGPS++.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js v18+ & NPM v9+ installed.

### 1. Install Backend & Frontend Dependencies
```bash
# Install Backend packages
cd backend
npm install

# Install Frontend packages
cd ../frontend
npm install
```

### 2. Start the Backend Server (Port 5000)
```bash
cd backend
npm start
```
*Backend runs on `http://localhost:5000` with WebSocket, MQTT gateway, and seed database.*

### 3. Start the Frontend Application (Port 3000)
```bash
cd frontend
npm run dev
```
*Open `http://localhost:3000` in your web browser.*

---

## 🧪 Demo Control Triggers

- **Simulate Alcohol Event**: Click "Simulate Alcohol Impairment (VH001)" on the dashboard or use the MQ-3 Breathalyzer gauge.
- **Test Emergency SMS**: Go to **Emergency Contacts** page -> Click **TEST SMS**.
- **Test Automated Voice Call**: Go to **Emergency Contacts** page -> Click **TEST PHONE CALL**.
- **Emergency SOS Trigger**: Click the glowing **SOS EMERGENCY** button in the top navbar.
- **Live GPS Movement**: Go to **Live Tracking** -> Launch the **Live GPS Telemetry Simulator**.

---

## 📄 License & Project Scope

This project is built for College Final-Year Projects, IoT Demonstrations, Fleet Management Prototypes, and Smart Transportation System Research.
