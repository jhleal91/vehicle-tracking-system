# 🚗 FleetTrack Pro - Sistema de Monitoreo Inteligente de Flotas

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-5.0+-green.svg)](https://mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Sistema completo de monitoreo de vehículos que combina datos GPS en tiempo real con información del motor a través del puerto OBD-II. Incluye dashboard interactivo, geocercas, gestión de choferes, historial de rutas y alertas inteligentes.

## ✨ Características Principales

### 🗺️ **Monitoreo en Tiempo Real**
- **Ubicación GPS** con precisión de metros
- **Datos del motor**: velocidad, RPM, temperatura, combustible
- **Mapas interactivos** con Leaflet y OpenStreetMap
- **Geocercas visuales** con alertas automáticas

### 📊 **Dashboard Inteligente**
- **Métricas en tiempo real** de toda la flota
- **Gráficos dinámicos** de velocidad y combustible
- **Estado de vehículos** con indicadores visuales
- **Filtros avanzados** por vehículo, chofer y fecha

### 👨‍💼 **Gestión de Choferes**
- **Asignación de choferes** a vehículos
- **Validación de licencias** con fechas de vencimiento
- **Historial por chofer** en rutas y turnos
- **Información de contacto** completa

### 📈 **Historial y Reportes**
- **Rutas detalladas** con puntos GPS
- **Filtros por fecha, hora y dirección**
- **Estadísticas de uso** por vehículo
- **Exportación de datos** en CSV

### 🚨 **Sistema de Alertas**
- **Velocidad excedida** con límites personalizables
- **Salida de geocercas** con notificaciones
- **Motor encendido sin movimiento**
- **Niveles bajos de combustible**

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   📱 Vehículo   │───▶│  🔧 Arduino/    │───▶│  🌐 Internet    │
│                 │    │     ESP32       │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  📊 Dashboard   │◀───│  🖥️ Frontend    │◀───│  🚀 Backend     │
│   React App     │    │   (Puerto 3001) │    │  (Puerto 3000)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │  🗄️ MongoDB     │    │  🔌 WebSocket   │
                       │   Database      │    │  (Puerto 8080)  │
                       └─────────────────┘    └─────────────────┘
```

---

## 📋 Prerrequisitos

### 💻 **Software Requerido**

| Software | Versión | Descripción |
|----------|---------|-------------|
| **Node.js** | 18+ | Runtime de JavaScript |
| **npm** | 8+ | Gestor de paquetes |
| **MongoDB** | 5.0+ | Base de datos |
| **Git** | 2.0+ | Control de versiones |
| **Arduino IDE** | 2.0+ | Para programar microcontroladores |

### 🔧 **Hardware Recomendado**

#### **Opción Básica (~$80 USD)**
- Arduino Uno R3
- Módulo ELM327 OBD-II
- GPS NEO-6M
- Módulo GSM SIM800L
- Cables y protoboard

#### **Opción Avanzada (~$150 USD)**
- ESP32 DevKit
- Módulo 4G/LTE
- GPS de alta precisión
- Batería de respaldo
- Carcasa protectora

---

## 🚀 Instalación Paso a Paso

### 1️⃣ **Clonar el Repositorio**

```bash
# Clonar el proyecto
git clone https://github.com/tu-usuario/vehicle-tracking-system.git
cd vehicle-tracking-system

# Verificar la estructura
ls -la
```

### 2️⃣ **Instalar MongoDB**

#### **En macOS (usando Homebrew):**
```bash
# Instalar Homebrew si no lo tienes
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Instalar MongoDB
brew tap mongodb/brew
brew install mongodb-community

# Iniciar MongoDB
brew services start mongodb/brew/mongodb-community
```

#### **En Ubuntu/Debian:**
```bash
# Importar clave pública
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Agregar repositorio
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Instalar MongoDB
sudo apt-get update
sudo apt-get install -y mongodb-org

# Iniciar MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

#### **En Windows:**
1. Descargar MongoDB Community Server desde [mongodb.com](https://www.mongodb.com/try/download/community)
2. Ejecutar el instalador
3. Seguir las instrucciones del asistente
4. MongoDB se iniciará automáticamente como servicio

#### **Verificar Instalación:**
```bash
# Verificar que MongoDB esté corriendo
mongosh --version

# Conectar a MongoDB
mongosh
```

### 3️⃣ **Configurar el Backend**

```bash
# Navegar al directorio backend
cd backend

# Instalar dependencias
npm install

# Copiar archivo de configuración
cp env.example .env

# Editar variables de entorno
nano .env
```

#### **Configurar archivo `.env`:**
```env
# Configuración del Servidor
PORT=3000
NODE_ENV=development

# Base de Datos MongoDB
MONGODB_URI=mongodb://localhost:27017/vehicle_tracking

# JWT Secret (cambiar por uno seguro)
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui_123456789

# Configuración de CORS
CORS_ORIGIN=http://localhost:3001

# Configuración de WebSocket
WS_PORT=8080
```

#### **Iniciar el Backend:**
```bash
# Modo desarrollo (con nodemon)
npm run dev

# O modo producción
npm start
```

**✅ Verificar Backend:**
```bash
# El backend debería responder en:
curl http://localhost:3000
```

### 4️⃣ **Configurar el Frontend**

```bash
# Navegar al directorio frontend
cd ../frontend

# Instalar dependencias
npm install

# Crear archivo de configuración
echo "PORT=3001" > .env
echo "REACT_APP_API_URL=http://localhost:3000/api" >> .env
echo "REACT_APP_WS_URL=http://localhost:8080" >> .env
```

#### **Iniciar el Frontend:**
```bash
# Iniciar en modo desarrollo
npm start

# El frontend se abrirá automáticamente en:
# http://localhost:3001
```

### 5️⃣ **Configurar Arduino (Opcional)**

```bash
# Navegar al directorio arduino
cd ../arduino

# Abrir en Arduino IDE
# Archivo: vehicle_tracker.ino
```

#### **Librerías Requeridas:**
Instalar las siguientes librerías en Arduino IDE:
- `SoftwareSerial`
- `TinyGPS++`
- `GSM`
- `Wire`
- `SPI`

#### **Configuración del Hardware:**
1. Conectar ELM327 al puerto OBD-II del vehículo
2. Conectar GPS NEO-6M a pines digitales
3. Conectar módulo GSM con tarjeta SIM
4. Subir código al Arduino/ESP32

---

## 🎯 Uso del Sistema

### **1. Acceso Inicial**
1. Abrir navegador en `http://localhost:3001`
2. Crear cuenta de usuario
3. Iniciar sesión

### **2. Configurar Vehículos**
1. Ir a **"Vehículos"** en el menú lateral
2. Hacer clic en **"+ Agregar Vehículo"**
3. Completar información del vehículo
4. Configurar geocercas si es necesario

### **3. Gestionar Choferes**
1. Ir a **"Choferes"** en el menú lateral
2. Agregar información del chofer
3. Asignar vehículo al chofer
4. Verificar fechas de vencimiento de licencias

### **4. Monitorear en Tiempo Real**
1. Ir a **"Mapa"** para ver ubicaciones
2. Activar geocercas con el botón 📍
3. Ver detalles de vehículos haciendo clic en marcadores
4. Usar filtros de búsqueda

### **5. Revisar Historial**
1. Ir a **"Historial"** en el menú lateral
2. Seleccionar vehículo y rango de fechas
3. Filtrar por chofer, turno o tipo de ruta
4. Exportar datos si es necesario

---

## 🔧 Scripts Disponibles

### **Instalación Completa:**
```bash
# Instalar todas las dependencias
npm run install-all

# Iniciar backend y frontend simultáneamente
npm run dev

# Solo backend
npm run dev-backend

# Solo frontend
npm run dev-frontend
```

### **Producción:**
```bash
# Construir frontend
npm run build

# Iniciar en modo producción
npm run start

# Limpiar archivos temporales
npm run clean
```

### **Desarrollo:**
```bash
# Ejecutar tests
npm run test

# Linting
npm run lint

# Verificar tipos TypeScript
npm run type-check
```

---

## 🗄️ Estructura de la Base de Datos

### **Colecciones Principales:**
- **`users`** - Usuarios del sistema
- **`vehicles`** - Vehículos registrados
- **`vehicledata`** - Datos de telemetría
- **`alerts`** - Alertas del sistema
- **`drivers`** - Choferes (localStorage)

### **Consultas Útiles:**
```javascript
// Ver todos los vehículos
db.vehicles.find()

// Ver datos recientes de un vehículo
db.vehicledata.find({vehicleId: "CAM001"}).sort({timestamp: -1}).limit(10)

// Ver alertas no leídas
db.alerts.find({isRead: false})
```

---

## 🚨 Solución de Problemas

### **Backend no inicia:**
```bash
# Verificar que MongoDB esté corriendo
brew services list | grep mongodb

# Verificar puerto 3000
lsof -i :3000

# Revisar logs
npm run dev
```

### **Frontend no inicia:**
```bash
# Verificar puerto 3001
lsof -i :3001

# Limpiar cache
npm start -- --reset-cache

# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

### **MongoDB no conecta:**
```bash
# Verificar estado
brew services list | grep mongodb

# Reiniciar MongoDB
brew services restart mongodb/brew/mongodb-community

# Verificar logs
tail -f /usr/local/var/log/mongodb/mongo.log
```

### **Geocercas no aparecen:**
1. Verificar que el botón de geocercas esté activo (azul)
2. Comprobar que los vehículos tengan geocercas configuradas
3. Revisar la consola del navegador (F12)

---

## 📚 Documentación Adicional

- **[API Documentation](docs/API.md)** - Documentación completa de la API
- **[Database Schema](docs/DATABASE_SCHEMA.md)** - Esquema detallado de la base de datos
- **[Installation Guide](docs/INSTALLATION.md)** - Guía detallada de instalación

---

## 🤝 Contribuir

1. **Fork** el proyecto
2. **Crear** una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. **Push** a la rama (`git push origin feature/AmazingFeature`)
5. **Abrir** un Pull Request

### **Estándares de Código:**
- Usar TypeScript en el frontend
- Seguir convenciones de ESLint
- Documentar funciones complejas
- Escribir tests para nuevas funcionalidades

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

---

## 📞 Soporte y Contacto

- **📧 Email**: soporte@fleettrackpro.com
- **💬 Discord**: [Servidor de la Comunidad](https://discord.gg/fleettrackpro)
- **🐛 Issues**: [GitHub Issues](https://github.com/tu-usuario/vehicle-tracking-system/issues)
- **📖 Wiki**: [Documentación Completa](https://github.com/tu-usuario/vehicle-tracking-system/wiki)

---

## 🎉 Agradecimientos

- **OpenStreetMap** por los mapas gratuitos
- **Material-UI** por los componentes de React
- **Leaflet** por la librería de mapas
- **MongoDB** por la base de datos
- **Arduino** por la plataforma de hardware

---

**Desarrollado con ❤️ para la comunidad de IoT y automoción**

*Si este proyecto te ha sido útil, considera darle una ⭐ en GitHub*