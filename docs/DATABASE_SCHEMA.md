# 📊 Esquema de Base de Datos - FleetTrack Pro

## 🗄️ Resumen General

El sistema FleetTrack Pro utiliza **MongoDB** como base de datos principal para almacenar información de usuarios, vehículos, datos de telemetría, alertas y configuraciones del sistema.

---

## 👤 Entidad: User (Usuarios)

### **Descripción**
Almacena información de los usuarios del sistema, incluyendo datos de autenticación y suscripciones.

### **Campos**

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `_id` | ObjectId | ✅ | Identificador único del usuario |
| `email` | String | ✅ | Email del usuario (único) |
| `password` | String | ✅ | Contraseña hasheada con bcrypt |
| `name` | String | ✅ | Nombre completo del usuario |
| `subscription` | String | ❌ | Tipo de suscripción: `basic`, `premium`, `enterprise` |
| `vehicles` | Array[ObjectId] | ❌ | Referencias a vehículos del usuario |
| `createdAt` | Date | ❌ | Fecha de creación del usuario |
| `updatedAt` | Date | ❌ | Fecha de última actualización |

### **Ejemplo de Documento**
```json
{
  "_id": "68f83a8c656a0c2ebcf5cccf",
  "email": "admin@test.com",
  "password": "$2b$10$hashedpassword...",
  "name": "Administrador",
  "subscription": "premium",
  "vehicles": ["68f99cdc71e3dc72d602ee2a", "68f99d34083cfb10ae43fbc0"],
  "createdAt": "2025-10-23T03:00:00.000Z",
  "updatedAt": "2025-10-23T13:30:00.000Z"
}
```

---

## 🚗 Entidad: Vehicle (Vehículos)

### **Descripción**
Almacena información detallada de cada vehículo registrado en el sistema, incluyendo configuraciones y geocercas.

### **Campos**

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `_id` | ObjectId | ✅ | Identificador único del vehículo |
| `vehicleId` | String | ✅ | ID único del vehículo (ej: CAM001) |
| `name` | String | ✅ | Nombre del vehículo |
| `owner` | ObjectId | ✅ | Referencia al usuario propietario |
| `make` | String | ❌ | Marca del vehículo (Ford, Chevrolet, etc.) |
| `model` | String | ❌ | Modelo del vehículo |
| `year` | Number | ❌ | Año del vehículo |
| `vin` | String | ❌ | Número de identificación del vehículo |
| `licensePlate` | String | ❌ | Placa del vehículo |
| `status` | String | ❌ | Estado: `active`, `inactive`, `maintenance` |
| `isActive` | Boolean | ❌ | Si el vehículo está activo |
| `lastUpdate` | Date | ❌ | Última actualización de datos |
| `assignedDriver` | Object | ❌ | Información del chofer asignado |
| `settings` | Object | ❌ | Configuraciones del vehículo |
| `createdAt` | Date | ❌ | Fecha de creación |
| `updatedAt` | Date | ❌ | Fecha de última actualización |

### **Sub-entidad: settings**
```json
{
  "speedLimit": 120,
  "geofence": {
    "enabled": true,
    "center": {
      "lat": 19.4326,
      "lng": -99.1332
    },
    "radius": 2000
  },
  "alerts": {
    "speedExceeded": true,
    "engineOnWithoutMovement": true,
    "geofenceExit": true
  }
}
```

### **Sub-entidad: assignedDriver**
```json
{
  "driverId": "DRV001",
  "name": "Juan Pérez",
  "licenseNumber": "12345678",
  "phone": "+52 55 1234 5678"
}
```

### **Ejemplo de Documento**
```json
{
  "_id": "68f99cdc71e3dc72d602ee2a",
  "vehicleId": "CAM001",
  "name": "Camión 001",
  "owner": "68f83a8c656a0c2ebcf5cccf",
  "make": "Ford",
  "model": "F-150",
  "year": 2023,
  "vin": "1FTFW1ET5DFC12345",
  "licensePlate": "ABC-123",
  "status": "active",
  "isActive": true,
  "lastUpdate": "2025-10-23T13:24:32.854Z",
  "assignedDriver": {
    "driverId": "DRV001",
    "name": "Jose Horacio Lopez Leal",
    "licenseNumber": "00010009009",
    "phone": "812747994"
  },
  "settings": {
    "speedLimit": 120,
    "geofence": {
      "enabled": true,
      "center": {
        "lat": 19.4326,
        "lng": -99.1332
      },
      "radius": 2000
    },
    "alerts": {
      "speedExceeded": true,
      "engineOnWithoutMovement": true,
      "geofenceExit": true
    }
  },
  "createdAt": "2025-10-23T03:11:24.312Z",
  "updatedAt": "2025-10-23T13:30:00.000Z"
}
```

---

## 📡 Entidad: VehicleData (Datos de Telemetría)

### **Descripción**
Almacena datos de telemetría en tiempo real de cada vehículo, incluyendo ubicación, velocidad, estado del motor y más.

### **Campos**

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `_id` | ObjectId | ✅ | Identificador único del registro |
| `vehicleId` | String | ✅ | ID del vehículo |
| `timestamp` | Date | ✅ | Momento de la medición |
| `location` | Object | ❌ | Información de ubicación |
| `speed` | Number | ❌ | Velocidad en km/h |
| `rpm` | Number | ❌ | Revoluciones por minuto del motor |
| `engineTemperature` | Number | ❌ | Temperatura del motor en °C |
| `fuelLevel` | Number | ❌ | Nivel de combustible en % |
| `batteryVoltage` | Number | ❌ | Voltaje de la batería |
| `engineLoad` | Number | ❌ | Carga del motor en % |
| `throttlePosition` | Number | ❌ | Posición del acelerador en % |
| `brakePressure` | Number | ❌ | Presión de frenos |
| `heading` | Number | ❌ | Dirección en grados (0-360) |
| `altitude` | Number | ❌ | Altitud en metros |
| `satellites` | Number | ❌ | Número de satélites GPS |
| `hdop` | Number | ❌ | Precisión horizontal del GPS |
| `odometer` | Number | ❌ | Odómetro en kilómetros |
| `isEngineOn` | Boolean | ❌ | Si el motor está encendido |
| `tirePressure` | Object | ❌ | Presión de neumáticos |
| `alerts` | Array[String] | ❌ | Alertas activas |

### **Sub-entidad: location**
```json
{
  "latitude": 19.4326,
  "longitude": -99.1332,
  "address": "Ciudad de México, CDMX, México"
}
```

### **Sub-entidad: tirePressure**
```json
{
  "frontLeft": 32.5,
  "frontRight": 32.1,
  "rearLeft": 30.8,
  "rearRight": 31.2
}
```

### **Ejemplo de Documento**
```json
{
  "_id": "68fa26a389c471fddbbb6e24",
  "vehicleId": "CAM001",
  "timestamp": "2025-10-23T13:30:00.000Z",
  "location": {
    "latitude": 19.4326,
    "longitude": -99.1332,
    "address": "Ciudad de México, CDMX, México"
  },
  "speed": 45.5,
  "rpm": 2500,
  "engineTemperature": 85.2,
  "fuelLevel": 75.5,
  "batteryVoltage": 12.4,
  "engineLoad": 35.0,
  "throttlePosition": 15.0,
  "brakePressure": 0.0,
  "heading": 180.0,
  "altitude": 2240.0,
  "satellites": 8,
  "hdop": 1.2,
  "odometer": 15420.5,
  "isEngineOn": true,
  "tirePressure": {
    "frontLeft": 32.5,
    "frontRight": 32.1,
    "rearLeft": 30.8,
    "rearRight": 31.2
  },
  "alerts": ["speed_exceeded"]
}
```

---

## 🚨 Entidad: Alert (Alertas)

### **Descripción**
Almacena alertas generadas por el sistema basadas en eventos de los vehículos.

### **Campos**

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `_id` | ObjectId | ✅ | Identificador único de la alerta |
| `vehicleId` | String | ✅ | ID del vehículo |
| `type` | String | ✅ | Tipo de alerta |
| `message` | String | ✅ | Mensaje descriptivo |
| `severity` | String | ✅ | Severidad: `low`, `medium`, `high`, `critical` |
| `timestamp` | Date | ✅ | Momento de la alerta |
| `isRead` | Boolean | ❌ | Si la alerta ha sido leída |
| `location` | Object | ❌ | Ubicación donde ocurrió la alerta |
| `metadata` | Object | ❌ | Datos adicionales específicos del tipo |

### **Tipos de Alertas**
- `speed_exceeded`: Velocidad excedida
- `geofence_exit`: Salida de geocerca
- `engine_on_without_movement`: Motor encendido sin movimiento
- `low_fuel`: Combustible bajo
- `high_temperature`: Temperatura alta
- `battery_low`: Batería baja
- `tire_pressure_low`: Presión de neumáticos baja
- `maintenance_due`: Mantenimiento requerido

### **Ejemplo de Documento**
```json
{
  "_id": "68fa26a389c471fddbbb6e25",
  "vehicleId": "CAM001",
  "type": "speed_exceeded",
  "message": "Velocidad excedida: 95 km/h (límite: 80 km/h)",
  "severity": "medium",
  "timestamp": "2025-10-23T13:25:00.000Z",
  "isRead": false,
  "location": {
    "latitude": 19.4326,
    "longitude": -99.1332,
    "address": "Av. Reforma, Ciudad de México"
  },
  "metadata": {
    "currentSpeed": 95,
    "speedLimit": 80,
    "duration": 120
  }
}
```

---

## 👨‍💼 Entidad: Driver (Choferes)

### **Descripción**
Almacena información de los choferes asignados a los vehículos.

### **Campos**

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `_id` | ObjectId | ✅ | Identificador único del chofer |
| `driverId` | String | ✅ | ID único del chofer |
| `name` | String | ✅ | Nombre completo |
| `email` | String | ❌ | Email del chofer |
| `phone` | String | ❌ | Teléfono de contacto |
| `licenseNumber` | String | ✅ | Número de licencia |
| `licenseExpiry` | Date | ✅ | Fecha de vencimiento de licencia |
| `isActive` | Boolean | ❌ | Si el chofer está activo |
| `assignedVehicle` | String | ❌ | ID del vehículo asignado |
| `createdAt` | Date | ❌ | Fecha de creación |
| `updatedAt` | Date | ❌ | Fecha de última actualización |

### **Ejemplo de Documento**
```json
{
  "_id": "68fa26a389c471fddbbb6e26",
  "driverId": "DRV001",
  "name": "Jose Horacio Lopez Leal",
  "email": "jose.lopez@empresa.com",
  "phone": "812747994",
  "licenseNumber": "00010009009",
  "licenseExpiry": "2026-12-31T23:59:59.000Z",
  "isActive": true,
  "assignedVehicle": "CAM001",
  "createdAt": "2025-10-23T03:00:00.000Z",
  "updatedAt": "2025-10-23T13:30:00.000Z"
}
```

---

## 🔗 Relaciones entre Entidades

### **User ↔ Vehicle**
- **Relación**: 1:N (Un usuario puede tener múltiples vehículos)
- **Campo de enlace**: `Vehicle.owner` → `User._id`
- **Campo de referencia**: `User.vehicles[]` → `Vehicle._id`

### **Vehicle ↔ VehicleData**
- **Relación**: 1:N (Un vehículo genera múltiples registros de datos)
- **Campo de enlace**: `VehicleData.vehicleId` → `Vehicle.vehicleId`

### **Vehicle ↔ Alert**
- **Relación**: 1:N (Un vehículo puede generar múltiples alertas)
- **Campo de enlace**: `Alert.vehicleId` → `Vehicle.vehicleId`

### **Vehicle ↔ Driver**
- **Relación**: 1:1 (Un vehículo puede tener un chofer asignado)
- **Campo de enlace**: `Vehicle.assignedDriver.driverId` → `Driver.driverId`
- **Campo de referencia**: `Driver.assignedVehicle` → `Vehicle.vehicleId`

---

## 📊 Índices Recomendados

### **User Collection**
```javascript
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "createdAt": 1 })
```

### **Vehicle Collection**
```javascript
db.vehicles.createIndex({ "vehicleId": 1 }, { unique: true })
db.vehicles.createIndex({ "owner": 1 })
db.vehicles.createIndex({ "licensePlate": 1 })
db.vehicles.createIndex({ "isActive": 1 })
```

### **VehicleData Collection**
```javascript
db.vehicledata.createIndex({ "vehicleId": 1, "timestamp": -1 })
db.vehicledata.createIndex({ "timestamp": -1 })
db.vehicledata.createIndex({ "location": "2dsphere" })
```

### **Alert Collection**
```javascript
db.alerts.createIndex({ "vehicleId": 1, "timestamp": -1 })
db.alerts.createIndex({ "isRead": 1 })
db.alerts.createIndex({ "severity": 1 })
db.alerts.createIndex({ "type": 1 })
```

### **Driver Collection**
```javascript
db.drivers.createIndex({ "driverId": 1 }, { unique: true })
db.drivers.createIndex({ "licenseNumber": 1 })
db.drivers.createIndex({ "assignedVehicle": 1 })
```

---

## 🚀 Consultas Comunes

### **Obtener vehículos de un usuario**
```javascript
db.vehicles.find({ "owner": ObjectId("68f83a8c656a0c2ebcf5cccf") })
```

### **Obtener datos recientes de un vehículo**
```javascript
db.vehicledata.find({ "vehicleId": "CAM001" }).sort({ "timestamp": -1 }).limit(1)
```

### **Obtener alertas no leídas**
```javascript
db.alerts.find({ "isRead": false }).sort({ "timestamp": -1 })
```

### **Obtener vehículos con geocercas activas**
```javascript
db.vehicles.find({ "settings.geofence.enabled": true })
```

### **Obtener choferes activos sin vehículo asignado**
```javascript
db.drivers.find({ "isActive": true, "assignedVehicle": { $exists: false } })
```

---

## 📈 Métricas y Estadísticas

### **Conteo de vehículos por usuario**
```javascript
db.vehicles.aggregate([
  { $group: { _id: "$owner", count: { $sum: 1 } } }
])
```

### **Promedio de velocidad por vehículo (últimas 24 horas)**
```javascript
db.vehicledata.aggregate([
  { $match: { "timestamp": { $gte: new Date(Date.now() - 24*60*60*1000) } } },
  { $group: { _id: "$vehicleId", avgSpeed: { $avg: "$speed" } } }
])
```

### **Alertas por tipo y severidad**
```javascript
db.alerts.aggregate([
  { $group: { 
    _id: { type: "$type", severity: "$severity" }, 
    count: { $sum: 1 } 
  } }
])
```

---

## 🔧 Configuración de MongoDB

### **Variables de Entorno**
```bash
MONGODB_URI=mongodb://localhost:27017/fleettrack
```

### **Colecciones Principales**
- `users` - Usuarios del sistema
- `vehicles` - Vehículos registrados
- `vehicledata` - Datos de telemetría
- `alerts` - Alertas del sistema
- `drivers` - Choferes (almacenado en localStorage en el frontend)

---

*Documento generado para FleetTrack Pro - Sistema de Monitoreo Inteligente de Flotas*
*Última actualización: 23 de Octubre, 2025*
