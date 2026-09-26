import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { loadDb } from './db/dbHelper.js';
import { createApiRouter } from './routes/api.js';
import { gpsSimulator } from './services/gpsSimulator.js';
import { mqttGateway } from './services/mqttGateway.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Enable CORS for modern web & mobile clients
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Initialize In-Memory / File Database
loadDb();

// Initialize Socket.IO Real-time WebSocket Gateway
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log(`🔌 [WEBSOCKET] Client connected: ${socket.id}`);

  socket.on('joinVehicleRoom', (vehicleId) => {
    socket.join(`vehicle_${vehicleId}`);
  });

  socket.on('disconnect', () => {
    console.log(`🔌 [WEBSOCKET] Client disconnected: ${socket.id}`);
  });
});

const emitSocket = (event, data) => {
  io.emit(event, data);
};

// Initialize MQTT IoT Gateway
mqttGateway.init(emitSocket);

// Start Real-Time GPS Telemetry Simulator
gpsSimulator.start(emitSocket);

// Attach API Routes
app.use('/api', createApiRouter(io));

// Root Health Check Route
app.get('/', (req, res) => {
  res.json({
    app: 'SafeDrive AI Telematics Core Engine',
    version: '1.0.0',
    tagline: 'Detect. Prevent. Protect.',
    status: 'ONLINE',
    realtimeWebSocket: 'ACTIVE',
    mqttGateway: 'ACTIVE',
    gpsSimulator: 'RUNNING'
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`
===============================================================
🚗 SAFEDRIVE AI TELEMATICS & SAFETY CORE SERVER IS RUNNING 🚗
===============================================================
📍 REST API:            http://localhost:${PORT}/api
🔌 WebSocket Server:    ws://localhost:${PORT}
📡 MQTT Broker Sub:     safedrive/+/location, safedrive/+/alcohol
🧪 DEMO Mode:           Active (10 Dynamic Vehicles, Real-time Map Sim)
===============================================================
  `);
});
