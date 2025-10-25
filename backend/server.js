/*
 * Servidor Backend para Sistema de Monitoreo GPS + OBD-II
 * Node.js + Express + MongoDB + WebSocket
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const WebSocket = require('ws');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const WS_PORT = process.env.WS_PORT || 8080;

// Middleware de seguridad
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));

// Middleware básico
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
  credentials: true
}));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vehicle_tracking', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Conectado a MongoDB'))
.catch(err => console.error('❌ Error conectando a MongoDB:', err));

// Esquemas de la base de datos
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  subscription: { 
    type: String, 
    enum: ['basic', 'premium', 'enterprise'], 
    default: 'basic' 
  },
  vehicles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' }],
  createdAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
});

const vehicleSchema = new mongoose.Schema({
  vehicleId: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  make: String,
  model: String,
  year: Number,
  vin: String,
  licensePlate: String,
  isActive: { type: Boolean, default: true },
  lastUpdate: { type: Date, default: Date.now },
  settings: {
    speedLimit: { type: Number, default: 120 },
    geofence: {
      enabled: { type: Boolean, default: false },
      center: { lat: Number, lng: Number },
      radius: { type: Number, default: 1000 }
    },
    alerts: {
      speedExceeded: { type: Boolean, default: true },
      engineOnWithoutMovement: { type: Boolean, default: true },
      geofenceExit: { type: Boolean, default: false }
    }
  }
});

const vehicleDataSchema = new mongoose.Schema({
  vehicleId: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  speed: { type: Number, default: 0 },
  rpm: { type: Number, default: 0 },
  temperature: { type: Number, default: 0 },
  fuelLevel: { type: Number, default: 0 },
  batteryVoltage: { type: Number, default: 0 },
  engineLoad: { type: Number, default: 0 },
  throttlePosition: { type: Number, default: 0 },
  timestamp: { type: Date, default: Date.now },
  isEngineOn: { type: Boolean, default: false },
  heading: { type: Number, default: 0 },
  altitude: { type: Number, default: 0 },
  satellites: { type: Number, default: 0 },
  hdop: { type: Number, default: 0 }
});

const alertSchema = new mongoose.Schema({
  vehicleId: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['speed_exceeded', 'engine_on_no_movement', 'geofence_exit', 'low_fuel', 'maintenance_due'],
    required: true 
  },
  message: { type: String, required: true },
  severity: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'critical'], 
    default: 'medium' 
  },
  data: mongoose.Schema.Types.Mixed,
  timestamp: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false },
  isResolved: { type: Boolean, default: false }
});

// Modelos
const User = mongoose.model('User', userSchema);
const Vehicle = mongoose.model('Vehicle', vehicleSchema);
const VehicleData = mongoose.model('VehicleData', vehicleDataSchema);
const Alert = mongoose.model('Alert', alertSchema);

// Middleware de autenticación
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acceso requerido' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// WebSocket Server
const wss = new WebSocket.Server({ port: WS_PORT });

wss.on('connection', (ws, req) => {
  console.log('🔌 Cliente WebSocket conectado');
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      if (data.type === 'subscribe' && data.vehicleId) {
        ws.vehicleId = data.vehicleId;
        console.log(`📡 Cliente suscrito a vehículo: ${data.vehicleId}`);
      }
    } catch (error) {
      console.error('Error procesando mensaje WebSocket:', error);
    }
  });
  
  ws.on('close', () => {
    console.log('🔌 Cliente WebSocket desconectado');
  });
});

// Función para broadcast a clientes WebSocket
function broadcastToClients(vehicleId, data) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN && client.vehicleId === vehicleId) {
      client.send(JSON.stringify(data));
    }
  });
}

// Función para crear alertas
async function createAlert(vehicleId, type, message, severity = 'medium', data = {}) {
  try {
    const alert = new Alert({
      vehicleId,
      type,
      message,
      severity,
      data
    });
    await alert.save();
    
    // Broadcast alerta a clientes WebSocket
    broadcastToClients(vehicleId, {
      type: 'alert',
      data: alert
    });
  } catch (error) {
    console.error('Error creando alerta:', error);
  }
}

// API Routes

// Autenticación
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }
    
    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Crear usuario
    const user = new User({
      email,
      password: hashedPassword,
      name
    });
    
    await user.save();
    
    // Generar token JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        subscription: user.subscription
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Buscar usuario
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    // Generar token JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        subscription: user.subscription
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verificar token
app.get('/api/auth/verify', authenticateToken, async (req, res) => {
  try {
    // Si llegamos aquí, el token es válido
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    res.json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        name: user.name,
        subscription: user.subscription
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Recibir datos del dispositivo OBD-II
app.post('/api/vehicle-data', async (req, res) => {
  try {
    const {
      lat, lng, speed, rpm, temp, fuel, battery, engineLoad,
      throttle, heading, altitude, satellites, hdop, timestamp
    } = req.body;
    
    const vehicleId = req.headers['vehicle-id'] || 'default-vehicle';
    
    // Crear nuevo registro
    const vehicleData = new VehicleData({
      vehicleId,
      latitude: lat,
      longitude: lng,
      speed: speed || 0,
      rpm: rpm || 0,
      temperature: temp || 0,
      fuelLevel: fuel || 0,
      batteryVoltage: battery || 0,
      engineLoad: engineLoad || 0,
      throttlePosition: throttle || 0,
      heading: heading || 0,
      altitude: altitude || 0,
      satellites: satellites || 0,
      hdop: hdop || 0,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      isEngineOn: (rpm || 0) > 0
    });
    
    await vehicleData.save();
    
    // Actualizar último registro del vehículo
    await Vehicle.findOneAndUpdate(
      { vehicleId },
      { lastUpdate: new Date() },
      { upsert: true }
    );
    
    // Verificar alertas
    const vehicle = await Vehicle.findOne({ vehicleId });
    if (vehicle && vehicle.settings) {
      // Alerta de velocidad excedida
      if (vehicle.settings.alerts.speedExceeded && speed > vehicle.settings.speedLimit) {
        await createAlert(
          vehicleId,
          'speed_exceeded',
          `Velocidad excedida: ${speed} km/h (límite: ${vehicle.settings.speedLimit} km/h)`,
          'high',
          { speed, limit: vehicle.settings.speedLimit }
        );
      }
      
      // Alerta de combustible bajo
      if (fuel < 20) {
        await createAlert(
          vehicleId,
          'low_fuel',
          `Combustible bajo: ${fuel}%`,
          'medium',
          { fuelLevel: fuel }
        );
      }
    }
    
    // Broadcast a clientes WebSocket
    broadcastToClients(vehicleId, {
      type: 'vehicle_update',
      data: vehicleData
    });
    
    res.json({ success: true, message: 'Datos recibidos correctamente' });
  } catch (error) {
    console.error('Error al procesar datos:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Obtener ubicación actual de un vehículo
app.get('/api/vehicle/:vehicleId/current', authenticateToken, async (req, res) => {
  try {
    const vehicleId = req.params.vehicleId;
    
    // Verificar que el usuario tiene acceso al vehículo
    const vehicle = await Vehicle.findOne({ vehicleId, owner: req.user.userId });
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    }
    
    const currentData = await VehicleData.findOne({ vehicleId })
      .sort({ timestamp: -1 });
    
    if (!currentData) {
      return res.status(404).json({ error: 'No hay datos disponibles' });
    }
    
    res.json(currentData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener historial de ubicaciones
app.get('/api/vehicle/:vehicleId/history', authenticateToken, async (req, res) => {
  try {
    const vehicleId = req.params.vehicleId;
    const { startDate, endDate, limit = 100 } = req.query;
    
    // Verificar que el usuario tiene acceso al vehículo
    const vehicle = await Vehicle.findOne({ vehicleId, owner: req.user.userId });
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    }
    
    let query = { vehicleId };
    
    if (startDate && endDate) {
      query.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const history = await VehicleData.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));
    
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener todos los vehículos del usuario
app.get('/api/vehicles', authenticateToken, async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ owner: req.user.userId, isActive: true });
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Registrar nuevo vehículo
app.post('/api/vehicles', authenticateToken, async (req, res) => {
  try {
    const { vehicleId, name, make, model, year, vin, licensePlate } = req.body;
    
    const vehicle = new Vehicle({
      vehicleId,
      name,
      owner: req.user.userId,
      make,
      model,
      year,
      vin,
      licensePlate
    });
    
    await vehicle.save();
    
    // Actualizar usuario con el nuevo vehículo
    await User.findByIdAndUpdate(req.user.userId, {
      $push: { vehicles: vehicle._id }
    });
    
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Agregar geocercas a vehículos existentes
app.put('/api/vehicles/:vehicleId/geofence', authenticateToken, async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const { enabled, center, radius } = req.body;
    
    const vehicle = await Vehicle.findOne({ vehicleId, owner: req.user.userId });
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    }
    
    // Actualizar configuración de geocerca
    if (!vehicle.settings) {
      vehicle.settings = {};
    }
    if (!vehicle.settings.geofence) {
      vehicle.settings.geofence = {};
    }
    
    vehicle.settings.geofence.enabled = enabled;
    if (center) {
      vehicle.settings.geofence.center = center;
    }
    if (radius) {
      vehicle.settings.geofence.radius = radius;
    }
    
    await vehicle.save();
    
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear vehículos de prueba con geocercas
app.post('/api/vehicles/demo', authenticateToken, async (req, res) => {
  try {
    const demoVehicles = [
      {
        vehicleId: 'VEH001',
        name: 'Camión de Reparto',
        make: 'Ford',
        model: 'Transit',
        year: 2022,
        vin: '1FTBW2CM5GKA12345',
        licensePlate: 'ABC-123',
        settings: {
          speedLimit: 80,
          geofence: {
            enabled: true,
            center: { lat: 19.4326, lng: -99.1332 },
            radius: 2000
          },
          alerts: {
            speedExceeded: true,
            engineOnWithoutMovement: true,
            geofenceExit: true
          }
        }
      },
      {
        vehicleId: 'VEH002',
        name: 'Vehículo de Servicio',
        make: 'Chevrolet',
        model: 'Express',
        year: 2021,
        vin: '1GC1KXCG5LF123456',
        licensePlate: 'XYZ-789',
        settings: {
          speedLimit: 100,
          geofence: {
            enabled: true,
            center: { lat: 19.4426, lng: -99.1432 },
            radius: 1500
          },
          alerts: {
            speedExceeded: true,
            engineOnWithoutMovement: true,
            geofenceExit: true
          }
        }
      }
    ];

    const createdVehicles = [];
    
    for (const vehicleData of demoVehicles) {
      const vehicle = new Vehicle({
        ...vehicleData,
        owner: req.user.userId
      });
      
      await vehicle.save();
      createdVehicles.push(vehicle);
      
      // Actualizar usuario con el nuevo vehículo
      await User.findByIdAndUpdate(req.user.userId, {
        $push: { vehicles: vehicle._id }
      });
    }
    
    res.json(createdVehicles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener alertas de un vehículo
app.get('/api/vehicle/:vehicleId/alerts', authenticateToken, async (req, res) => {
  try {
    const vehicleId = req.params.vehicleId;
    const { limit = 50, unreadOnly = false } = req.query;
    
    // Verificar que el usuario tiene acceso al vehículo
    const vehicle = await Vehicle.findOne({ vehicleId, owner: req.user.userId });
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    }
    
    let query = { vehicleId };
    if (unreadOnly === 'true') {
      query.isRead = false;
    }
    
    const alerts = await Alert.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));
    
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Marcar alerta como leída
app.put('/api/alerts/:alertId/read', authenticateToken, async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.alertId,
      { isRead: true },
      { new: true }
    );
    
    if (!alert) {
      return res.status(404).json({ error: 'Alerta no encontrada' });
    }
    
    res.json(alert);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener estadísticas del vehículo
app.get('/api/vehicle/:vehicleId/stats', authenticateToken, async (req, res) => {
  try {
    const vehicleId = req.params.vehicleId;
    const { days = 7 } = req.query;
    
    // Verificar que el usuario tiene acceso al vehículo
    const vehicle = await Vehicle.findOne({ vehicleId, owner: req.user.userId });
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    }
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    const stats = await VehicleData.aggregate([
      {
        $match: {
          vehicleId,
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalDistance: { $sum: '$speed' }, // Aproximación
          avgSpeed: { $avg: '$speed' },
          maxSpeed: { $max: '$speed' },
          totalTrips: { $sum: { $cond: [{ $gt: ['$rpm', 0] }, 1, 0] } },
          avgFuelLevel: { $avg: '$fuelLevel' },
          avgTemperature: { $avg: '$temperature' },
          totalEngineHours: { $sum: { $cond: [{ $gt: ['$rpm', 0] }, 1, 0] } }
        }
      }
    ]);
    
    res.json(stats[0] || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Servir archivos estáticos
app.use(express.static('public'));

// Ruta principal
app.get('/', (req, res) => {
  res.json({
    message: '🚗 Sistema de Monitoreo GPS + OBD-II',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      vehicles: '/api/vehicles',
      data: '/api/vehicle-data',
      websocket: `ws://localhost:${WS_PORT}`
    }
  });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo salió mal!' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`🔌 WebSocket corriendo en puerto ${WS_PORT}`);
  console.log(`📊 API disponible en http://localhost:${PORT}/api`);
});

module.exports = app;
