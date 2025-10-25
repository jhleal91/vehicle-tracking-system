# 🚀 Guía de Instalación

Esta guía te ayudará a instalar y configurar el Sistema de Monitoreo GPS + OBD-II paso a paso.

## 📋 Prerrequisitos

### Software
- **Node.js** 16+ ([Descargar](https://nodejs.org/))
- **MongoDB** 4.4+ ([Descargar](https://www.mongodb.com/try/download/community))
- **Arduino IDE** ([Descargar](https://www.arduino.cc/en/software))
- **Git** ([Descargar](https://git-scm.com/))

### Hardware
- **Arduino Uno** o **ESP32**
- **ELM327** OBD-II Scanner
- **GPS NEO-6M** o similar
- **Módulo GSM SIM800L** o **4G/LTE**
- **Cables y protoboard**
- **Caja protectora**

## 🔧 Instalación del Backend

### 1. Clonar el repositorio
```bash
git clone <tu-repositorio>
cd vehicle-tracking-system
```

### 2. Configurar Backend
```bash
cd backend
npm install
```

### 3. Configurar variables de entorno
```bash
cp env.example .env
```

Editar `.env` con tus configuraciones:
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/vehicle_tracking
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui
CORS_ORIGIN=http://localhost:3001
WS_PORT=8080
```

### 4. Iniciar MongoDB
```bash
# En macOS con Homebrew
brew services start mongodb-community

# En Ubuntu/Debian
sudo systemctl start mongod

# En Windows
net start MongoDB
```

### 5. Ejecutar el servidor
```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3000`

## 🌐 Instalación del Frontend

### 1. Configurar Frontend
```bash
cd frontend
npm install
```

### 2. Configurar variables de entorno
```bash
# Crear archivo .env
echo "REACT_APP_API_URL=http://localhost:3000/api" > .env
```

### 3. Ejecutar la aplicación
```bash
npm start
```

La aplicación estará disponible en `http://localhost:3001`

## 🔌 Configuración del Hardware

### 1. Instalar Arduino IDE
- Descargar desde [arduino.cc](https://www.arduino.cc/en/software)
- Instalar las librerías necesarias:
  - **TinyGPS++**: Herramientas → Administrar librerías → Buscar "TinyGPS++"
  - **ArduinoJson**: Herramientas → Administrar librerías → Buscar "ArduinoJson"

### 2. Conexiones del Hardware

#### Arduino Uno
```
ELM327 OBD-II:
- VCC → 5V
- GND → GND
- TX → Pin 2 (OBD_RX)
- RX → Pin 3 (OBD_TX)

GPS NEO-6M:
- VCC → 5V
- GND → GND
- TX → Pin 4 (GPS_RX)
- RX → Pin 5 (GPS_TX)

SIM800L:
- VCC → 5V
- GND → GND
- TX → Pin 6 (GSM_RX)
- RX → Pin 7 (GSM_TX)
```

#### ESP32
```
ELM327 OBD-II:
- VCC → 3.3V
- GND → GND
- TX → GPIO 16
- RX → GPIO 17

GPS NEO-6M:
- VCC → 3.3V
- GND → GND
- TX → GPIO 18
- RX → GPIO 19

SIM800L:
- VCC → 3.3V
- GND → GND
- TX → GPIO 21
- RX → GPIO 22
```

### 3. Configurar el código Arduino
1. Abrir `arduino/vehicle_tracker.ino` en Arduino IDE
2. Cambiar `SERVER_URL` por tu servidor
3. Cambiar `VEHICLE_ID` por un ID único
4. Configurar pines según tu hardware
5. Subir el código al microcontrolador

### 4. Configurar tarjeta SIM
1. Insertar tarjeta SIM en el módulo GSM
2. Verificar que tenga saldo de datos
3. Configurar APN según tu operador

## 🧪 Pruebas

### 1. Probar Backend
```bash
curl http://localhost:3000/api
```

### 2. Probar Frontend
- Abrir `http://localhost:3001`
- Registrar un usuario
- Crear un vehículo

### 3. Probar Hardware
- Conectar el dispositivo al vehículo
- Verificar que se encienda el LED
- Revisar logs en el monitor serial

## 🔧 Configuración Avanzada

### MongoDB
```bash
# Crear base de datos
mongo
use vehicle_tracking

# Crear índices
db.vehicledata.createIndex({ "vehicleId": 1, "timestamp": -1 })
db.alerts.createIndex({ "vehicleId": 1, "timestamp": -1 })
```

### Nginx (Producción)
```nginx
server {
    listen 80;
    server_name tu-dominio.com;
    
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    location / {
        root /path/to/frontend/build;
        try_files $uri $uri/ /index.html;
    }
}
```

### SSL con Let's Encrypt
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d tu-dominio.com
```

## 🚨 Troubleshooting

### Backend no inicia
- Verificar que MongoDB esté corriendo
- Revisar variables de entorno
- Verificar puertos disponibles

### Frontend no carga
- Verificar que el backend esté corriendo
- Revisar configuración de CORS
- Verificar variables de entorno

### Hardware no funciona
- Verificar conexiones
- Revisar voltajes
- Comprobar configuración de pines
- Verificar tarjeta SIM

### GPS no obtiene señal
- Esperar hasta 10 minutos
- Verificar antena GPS
- Comprobar voltaje de alimentación
- Revisar obstáculos

### OBD-II no responde
- Verificar que el vehículo esté encendido
- Comprobar conexión al puerto OBD-II
- Revisar protocolo del vehículo
- Verificar códigos de error

## 📞 Soporte

Si tienes problemas:
1. Revisar los logs del servidor
2. Verificar la consola del navegador
3. Revisar el monitor serial de Arduino
4. Consultar la documentación
5. Crear un issue en GitHub

## 🔄 Actualizaciones

Para actualizar el sistema:
```bash
git pull origin main
cd backend && npm install
cd ../frontend && npm install
npm run build
```

## 📊 Monitoreo

### Logs del servidor
```bash
# Ver logs en tiempo real
tail -f logs/app.log

# Ver logs de errores
grep "ERROR" logs/app.log
```

### Métricas de MongoDB
```bash
# Conectar a MongoDB
mongo

# Ver estadísticas
db.stats()

# Ver colecciones
show collections
```
