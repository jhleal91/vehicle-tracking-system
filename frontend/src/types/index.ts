// Tipos TypeScript para el sistema de monitoreo

export interface User {
  id: string;
  email: string;
  name: string;
  subscription: 'basic' | 'premium' | 'enterprise';
  vehicles: string[];
  createdAt: string;
  isActive: boolean;
}

export interface Driver {
  _id?: string;
  driverId: string;
  name: string;
  email?: string;
  phone?: string;
  licenseNumber: string;
  licenseExpiry: Date;
  isActive: boolean;
  assignedVehicle?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Vehicle {
  _id?: string;
  vehicleId: string;
  name: string;
  owner?: string;
  make?: string;
  model?: string;
  year?: number;
  vin?: string;
  licensePlate?: string;
  isActive: boolean;
  lastSeen?: Date;
  lastUpdate?: string;
  createdAt?: Date;
  updatedAt?: Date;
  settings?: VehicleSettings;
  assignedDriver?: Driver;
}

export interface VehicleSettings {
  speedLimit: number;
  geofence: {
    enabled: boolean;
    center?: {
      lat: number;
      lng: number;
    };
    radius: number;
  };
  alerts: {
    speedExceeded: boolean;
    engineOnWithoutMovement: boolean;
    geofenceExit: boolean;
  };
}

export interface VehicleData {
  _id?: string;
  vehicleId: string;
  timestamp: Date;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  speed: number;
  rpm: number;
  engineTemperature: number;
  fuelLevel: number;
  batteryVoltage: number;
  engineLoad?: number;
  throttlePosition: number;
  brakePressure?: number;
  heading?: number;
  altitude?: number;
  satellites?: number;
  hdop?: number;
  odometer: number;
  isEngineOn?: boolean;
  tirePressure?: {
    frontLeft: number;
    frontRight: number;
    rearLeft: number;
    rearRight: number;
  };
  alerts: string[];
}

export interface Alert {
  id: string;
  vehicleId: string;
  type: 'warning' | 'error' | 'info' | 'success';
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  data?: any;
  timestamp: Date;
  isRead: boolean;
  isResolved?: boolean;
}

export interface VehicleStats {
  totalDistance: number;
  avgSpeed: number;
  maxSpeed: number;
  totalTrips: number;
  avgFuelLevel: number;
  avgTemperature: number;
  totalEngineHours: number;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export interface VehicleContextType {
  vehicles: Vehicle[];
  selectedVehicle: Vehicle | null;
  setSelectedVehicle: (vehicle: Vehicle | null) => void;
  refreshVehicles: () => Promise<void>;
  loading: boolean;
}

export interface WebSocketMessage {
  type: 'vehicle_update' | 'alert' | 'status';
  data: any;
  timestamp: string;
}

export interface MapMarker {
  id: string;
  position: [number, number];
  title: string;
  description: string;
  icon?: string;
  color?: string;
}

export interface RoutePoint {
  lat: number;
  lng: number;
  timestamp: string;
  speed: number;
}

export interface Geofence {
  id: string;
  name: string;
  center: [number, number];
  radius: number;
  type: 'circle' | 'polygon';
  color: string;
  enabled: boolean;
}

export interface DashboardMetrics {
  totalVehicles: number;
  activeVehicles: number;
  totalAlerts: number;
  unreadAlerts: number;
  avgSpeed: number;
  totalDistance: number;
}

export interface ChartData {
  name: string;
  value: number;
  timestamp?: string;
  color?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface VehicleCreateRequest {
  vehicleId: string;
  name: string;
  make?: string;
  model?: string;
  year?: number;
  vin?: string;
  licensePlate?: string;
}

export interface VehicleUpdateRequest {
  name?: string;
  make?: string;
  model?: string;
  year?: number;
  vin?: string;
  licensePlate?: string;
  settings?: Partial<VehicleSettings>;
}

export interface AlertUpdateRequest {
  isRead?: boolean;
  isResolved?: boolean;
}

export interface FilterOptions {
  startDate?: string;
  endDate?: string;
  vehicleId?: string;
  alertType?: string;
  severity?: string;
  limit?: number;
  offset?: number;
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

export interface PaginationOptions {
  page: number;
  limit: number;
  total: number;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}
