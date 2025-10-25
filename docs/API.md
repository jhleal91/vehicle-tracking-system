# 📡 Documentación de la API

Esta documentación describe todos los endpoints disponibles en el Sistema de Monitoreo GPS + OBD-II.

## 🔗 Base URL

```
http://localhost:3000/api
```

## 🔐 Autenticación

La API utiliza JWT (JSON Web Tokens) para la autenticación. Incluye el token en el header `Authorization`:

```
Authorization: Bearer <tu_token>
```

## 📋 Endpoints

### 🔑 Autenticación

#### POST `/auth/register`
Registrar un nuevo usuario.

**Request Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123",
  "name": "Juan Pérez"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "email": "usuario@ejemplo.com",
    "name": "Juan Pérez",
    "subscription": "basic"
  }
}
```

#### POST `/auth/login`
Iniciar sesión.

**Request Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "email": "usuario@ejemplo.com",
    "name": "Juan Pérez",
    "subscription": "basic"
  }
}
```

### 🚗 Vehículos

#### GET `/vehicles`
Obtener todos los vehículos del usuario.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "vehicleId": "VEH001",
    "name": "Mi Auto",
    "owner": "60f7b3b3b3b3b3b3b3b3b3b3",
    "make": "Toyota",
    "model": "Corolla",
    "year": 2020,
    "vin": "1HGBH41JXMN109186",
    "licensePlate": "ABC-123",
    "isActive": true,
    "lastUpdate": "2023-12-01T10:30:00.000Z",
    "settings": {
      "speedLimit": 120,
      "geofence": {
        "enabled": false,
        "center": null,
        "radius": 1000
      },
      "alerts": {
        "speedExceeded": true,
        "engineOnWithoutMovement": true,
        "geofenceExit": false
      }
    }
  }
]
```

#### POST `/vehicles`
Crear un nuevo vehículo.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "vehicleId": "VEH002",
  "name": "Mi Moto",
  "make": "Honda",
  "model": "CBR600",
  "year": 2021,
  "vin": "JH2SC5900GK123456",
  "licensePlate": "XYZ-789"
}
```

**Response:**
```json
{
  "_id": "60f7b3b3b3b3b3b3b3b3b3b4",
  "vehicleId": "VEH002",
  "name": "Mi Moto",
  "owner": "60f7b3b3b3b3b3b3b3b3b3b3",
  "make": "Honda",
  "model": "CBR600",
  "year": 2021,
  "vin": "JH2SC5900GK123456",
  "licensePlate": "XYZ-789",
  "isActive": true,
  "lastUpdate": "2023-12-01T10:30:00.000Z",
  "settings": {
    "speedLimit": 120,
    "geofence": {
      "enabled": false,
      "center": null,
      "radius": 1000
    },
    "alerts": {
      "speedExceeded": true,
      "engineOnWithoutMovement": true,
      "geofenceExit": false
    }
  }
}
```

### 📊 Datos del Vehículo

#### POST `/vehicle-data`
Recibir datos del dispositivo OBD-II + GPS.

**Headers:**
```
vehicle-id: VEH001
Content-Type: application/json
```

**Request Body:**
```json
{
  "lat": 19.4326,
  "lng": -99.1332,
  "speed": 65.5,
  "rpm": 2500,
  "temp": 85,
  "fuel": 75,
  "battery": 12.4,
  "engineLoad": 45,
  "throttle": 30,
  "heading": 180,
  "altitude": 2240,
  "satellites": 8,
  "hdop": 1.2,
  "timestamp": 1701432000000
}
```

**Response:**
```json
{
  "success": true,
  "message": "Datos recibidos correctamente"
}
```

#### GET `/vehicle/:vehicleId/current`
Obtener datos actuales de un vehículo.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "_id": "60f7b3b3b3b3b3b3b3b3b3b5",
  "vehicleId": "VEH001",
  "latitude": 19.4326,
  "longitude": -99.1332,
  "speed": 65.5,
  "rpm": 2500,
  "temperature": 85,
  "fuelLevel": 75,
  "batteryVoltage": 12.4,
  "engineLoad": 45,
  "throttlePosition": 30,
  "heading": 180,
  "altitude": 2240,
  "satellites": 8,
  "hdop": 1.2,
  "timestamp": "2023-12-01T10:30:00.000Z",
  "isEngineOn": true
}
```

#### GET `/vehicle/:vehicleId/history`
Obtener historial de datos de un vehículo.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `startDate` (opcional): Fecha de inicio (ISO 8601)
- `endDate` (opcional): Fecha de fin (ISO 8601)
- `limit` (opcional): Número máximo de registros (default: 100)

**Example:**
```
GET /vehicle/VEH001/history?startDate=2023-12-01T00:00:00.000Z&endDate=2023-12-01T23:59:59.999Z&limit=50
```

**Response:**
```json
[
  {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b5",
    "vehicleId": "VEH001",
    "latitude": 19.4326,
    "longitude": -99.1332,
    "speed": 65.5,
    "rpm": 2500,
    "temperature": 85,
    "fuelLevel": 75,
    "batteryVoltage": 12.4,
    "engineLoad": 45,
    "throttlePosition": 30,
    "heading": 180,
    "altitude": 2240,
    "satellites": 8,
    "hdop": 1.2,
    "timestamp": "2023-12-01T10:30:00.000Z",
    "isEngineOn": true
  }
]
```

#### GET `/vehicle/:vehicleId/stats`
Obtener estadísticas de un vehículo.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `days` (opcional): Número de días para las estadísticas (default: 7)

**Response:**
```json
{
  "totalDistance": 1250.5,
  "avgSpeed": 45.2,
  "maxSpeed": 120.0,
  "totalTrips": 15,
  "avgFuelLevel": 65.8,
  "avgTemperature": 82.5,
  "totalEngineHours": 45.5
}
```

### 🚨 Alertas

#### GET `/vehicle/:vehicleId/alerts`
Obtener alertas de un vehículo.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `limit` (opcional): Número máximo de alertas (default: 50)
- `unreadOnly` (opcional): Solo alertas no leídas (true/false)

**Response:**
```json
[
  {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b6",
    "vehicleId": "VEH001",
    "type": "speed_exceeded",
    "message": "Velocidad excedida: 125 km/h (límite: 120 km/h)",
    "severity": "high",
    "data": {
      "speed": 125,
      "limit": 120
    },
    "timestamp": "2023-12-01T10:30:00.000Z",
    "isRead": false,
    "isResolved": false
  }
]
```

#### PUT `/alerts/:alertId/read`
Marcar una alerta como leída.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "_id": "60f7b3b3b3b3b3b3b3b3b3b6",
  "vehicleId": "VEH001",
  "type": "speed_exceeded",
  "message": "Velocidad excedida: 125 km/h (límite: 120 km/h)",
  "severity": "high",
  "data": {
    "speed": 125,
    "limit": 120
  },
  "timestamp": "2023-12-01T10:30:00.000Z",
  "isRead": true,
  "isResolved": false
}
```

## 🔌 WebSocket

### Conexión
```
ws://localhost:8080
```

### Eventos

#### `vehicle_update`
Recibido cuando se actualizan los datos de un vehículo.

```json
{
  "type": "vehicle_update",
  "data": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b5",
    "vehicleId": "VEH001",
    "latitude": 19.4326,
    "longitude": -99.1332,
    "speed": 65.5,
    "rpm": 2500,
    "temperature": 85,
    "fuelLevel": 75,
    "batteryVoltage": 12.4,
    "engineLoad": 45,
    "throttlePosition": 30,
    "heading": 180,
    "altitude": 2240,
    "satellites": 8,
    "hdop": 1.2,
    "timestamp": "2023-12-01T10:30:00.000Z",
    "isEngineOn": true
  }
}
```

#### `alert`
Recibido cuando se genera una nueva alerta.

```json
{
  "type": "alert",
  "data": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b6",
    "vehicleId": "VEH001",
    "type": "speed_exceeded",
    "message": "Velocidad excedida: 125 km/h (límite: 120 km/h)",
    "severity": "high",
    "data": {
      "speed": 125,
      "limit": 120
    },
    "timestamp": "2023-12-01T10:30:00.000Z",
    "isRead": false,
    "isResolved": false
  }
}
```

### Suscripción
Para suscribirse a actualizaciones de un vehículo específico:

```javascript
socket.emit('subscribe', { vehicleId: 'VEH001' });
```

## 📝 Códigos de Error

| Código | Descripción |
|--------|-------------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Internal Server Error |

## 🔒 Seguridad

### Rate Limiting
- 100 requests por minuto por IP
- 1000 requests por hora por usuario autenticado

### Validación
- Todos los inputs son validados
- Sanitización de datos
- Protección contra inyección SQL

### CORS
- Configurado para dominios específicos
- Credentials habilitados para autenticación

## 📊 Ejemplos de Uso

### JavaScript/Node.js
```javascript
const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Obtener vehículos
const vehicles = await api.get('/vehicles');

// Crear vehículo
const newVehicle = await api.post('/vehicles', {
  vehicleId: 'VEH003',
  name: 'Mi Camioneta',
  make: 'Ford',
  model: 'Ranger'
});
```

### Python
```python
import requests

headers = {
    'Authorization': f'Bearer {token}',
    'Content-Type': 'application/json'
}

# Obtener vehículos
response = requests.get('http://localhost:3000/api/vehicles', headers=headers)
vehicles = response.json()

# Crear vehículo
data = {
    'vehicleId': 'VEH003',
    'name': 'Mi Camioneta',
    'make': 'Ford',
    'model': 'Ranger'
}
response = requests.post('http://localhost:3000/api/vehicles', json=data, headers=headers)
```

### cURL
```bash
# Obtener vehículos
curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:3000/api/vehicles

# Crear vehículo
curl -X POST \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"vehicleId":"VEH003","name":"Mi Camioneta","make":"Ford","model":"Ranger"}' \
     http://localhost:3000/api/vehicles
```
