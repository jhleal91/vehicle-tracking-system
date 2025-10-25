import { Vehicle, VehicleData, Alert, DashboardMetrics } from '../types';

// Datos mock para vehículos
export const mockVehicles: Vehicle[] = [
  {
    vehicleId: 'VH001',
    name: 'Camión de Reparto #1',
    make: 'Ford',
    model: 'Transit',
    year: 2022,
    vin: '1FTBW2CM5GKA12345',
    licensePlate: 'ABC-123',
    isActive: true,
    lastSeen: new Date(Date.now() - 5 * 60 * 1000), // 5 minutos atrás
    createdAt: new Date('2022-01-15'),
    updatedAt: new Date()
  },
  {
    vehicleId: 'VH002',
    name: 'Furgoneta Comercial',
    make: 'Mercedes',
    model: 'Sprinter',
    year: 2021,
    vin: 'WDB9066321LA12345',
    licensePlate: 'XYZ-789',
    isActive: true,
    lastSeen: new Date(Date.now() - 2 * 60 * 1000), // 2 minutos atrás
    createdAt: new Date('2021-11-20'),
    updatedAt: new Date()
  },
  {
    vehicleId: 'VH003',
    name: 'Camión de Carga',
    make: 'Volvo',
    model: 'FH16',
    year: 2020,
    vin: 'YV2A2A2A1GA123456',
    licensePlate: 'DEF-456',
    isActive: false,
    lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
    createdAt: new Date('2020-08-10'),
    updatedAt: new Date()
  },
  {
    vehicleId: 'VH004',
    name: 'Vehículo de Servicio',
    make: 'Toyota',
    model: 'Hilux',
    year: 2023,
    vin: 'MR0KB3CD5P1234567',
    licensePlate: 'GHI-012',
    isActive: true,
    lastSeen: new Date(Date.now() - 1 * 60 * 1000), // 1 minuto atrás
    createdAt: new Date('2023-03-05'),
    updatedAt: new Date()
  },
  {
    vehicleId: 'VH005',
    name: 'Camión Refrigerado',
    make: 'Iveco',
    model: 'Daily',
    year: 2022,
    vin: 'ZCFC70A000N123456',
    licensePlate: 'JKL-345',
    isActive: true,
    lastSeen: new Date(Date.now() - 3 * 60 * 1000), // 3 minutos atrás
    createdAt: new Date('2022-06-12'),
    updatedAt: new Date()
  }
];

// Generar datos de vehículos en tiempo real
export const generateMockVehicleData = (vehicleId: string): VehicleData => {
  const baseSpeed = Math.random() * 80 + 20; // 20-100 km/h
  const baseFuel = Math.random() * 40 + 20; // 20-60%
  const baseTemp = Math.random() * 20 + 80; // 80-100°C
  
  return {
    vehicleId,
    timestamp: new Date(),
    location: {
      latitude: 40.4168 + (Math.random() - 0.5) * 0.1, // Madrid área
      longitude: -3.7038 + (Math.random() - 0.5) * 0.1,
      address: `Calle ${Math.floor(Math.random() * 100) + 1}, Madrid`
    },
    speed: Math.round(baseSpeed),
    fuelLevel: Math.round(baseFuel),
    engineTemperature: Math.round(baseTemp),
    batteryVoltage: Math.round((Math.random() * 2 + 12) * 10) / 10, // 12-14V
    odometer: Math.floor(Math.random() * 100000) + 50000,
    rpm: Math.floor(Math.random() * 3000) + 1000,
    throttlePosition: Math.round(Math.random() * 100),
    brakePressure: Math.round(Math.random() * 50),
    tirePressure: {
      frontLeft: Math.round((Math.random() * 10 + 30) * 10) / 10,
      frontRight: Math.round((Math.random() * 10 + 30) * 10) / 10,
      rearLeft: Math.round((Math.random() * 10 + 30) * 10) / 10,
      rearRight: Math.round((Math.random() * 10 + 30) * 10) / 10
    },
    alerts: Math.random() > 0.8 ? ['Low fuel', 'High temperature'] : []
  };
};

// Datos mock para alertas
export const mockAlerts: Alert[] = [
  {
    id: 'AL001',
    vehicleId: 'VH001',
    type: 'warning',
    message: 'Nivel de combustible bajo (15%)',
    timestamp: new Date(Date.now() - 10 * 60 * 1000),
    isRead: false,
    severity: 'medium'
  },
  {
    id: 'AL002',
    vehicleId: 'VH002',
    type: 'error',
    message: 'Temperatura del motor alta (105°C)',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    isRead: false,
    severity: 'high'
  },
  {
    id: 'AL003',
    vehicleId: 'VH003',
    type: 'info',
    message: 'Vehículo fuera de línea por más de 2 horas',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    isRead: true,
    severity: 'low'
  },
  {
    id: 'AL004',
    vehicleId: 'VH004',
    type: 'warning',
    message: 'Presión de neumático baja - Rueda delantera izquierda',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    isRead: false,
    severity: 'medium'
  },
  {
    id: 'AL005',
    vehicleId: 'VH005',
    type: 'success',
    message: 'Mantenimiento programado completado',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
    isRead: true,
    severity: 'low'
  }
];

// Generar métricas del dashboard
export const generateMockMetrics = (): DashboardMetrics => {
  const activeVehicles = mockVehicles.filter(v => v.isActive).length;
  const totalVehicles = mockVehicles.length;
  const unreadAlerts = mockAlerts.filter(a => !a.isRead).length;
  
  // Generar datos de velocidad promedio
  const speedData = Array.from({ length: 10 }, (_, i) => 
    generateMockVehicleData(mockVehicles[i % mockVehicles.length].vehicleId)
  );
  const avgSpeed = speedData.reduce((sum, data) => sum + data.speed, 0) / speedData.length;
  
  return {
    totalVehicles,
    activeVehicles,
    totalAlerts: mockAlerts.length,
    unreadAlerts,
    avgSpeed: Math.round(avgSpeed),
    totalDistance: Math.floor(Math.random() * 10000) + 50000 // 50k-60k km
  };
};

// Generar datos para gráficos
export const generateSpeedChartData = () => {
  const now = new Date();
  return Array.from({ length: 24 }, (_, i) => {
    const time = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000);
    return {
      time: time.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      VH001: Math.round(Math.random() * 60 + 30), // Camión de Reparto #1
      VH002: Math.round(Math.random() * 50 + 25), // Furgoneta Comercial
      VH003: Math.round(Math.random() * 40 + 20), // Camión de Carga
      VH004: Math.round(Math.random() * 70 + 35), // Vehículo de Servicio
      VH005: Math.round(Math.random() * 45 + 25), // Camión Refrigerado
    };
  });
};

export const generateFuelChartData = () => {
  return mockVehicles.map(vehicle => ({
    name: vehicle.name,
    fuel: Math.round(Math.random() * 50 + 25), // 25-75%
    color: vehicle.isActive ? '#10b981' : '#ef4444'
  }));
};

export const generateTemperatureData = () => {
  return mockVehicles.map(vehicle => ({
    name: vehicle.name,
    temperature: Math.round(Math.random() * 20 + 80), // 80-100°C
    status: vehicle.isActive ? 'active' : 'inactive'
  }));
};

// Simular actualizaciones en tiempo real
export const simulateRealTimeUpdates = (callback: (data: VehicleData) => void) => {
  const interval = setInterval(() => {
    const randomVehicle = mockVehicles[Math.floor(Math.random() * mockVehicles.length)];
    const newData = generateMockVehicleData(randomVehicle.vehicleId);
    callback(newData);
  }, 5000); // Actualizar cada 5 segundos

  return () => clearInterval(interval);
};
