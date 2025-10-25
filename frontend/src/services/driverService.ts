import axios from 'axios';
import { Driver } from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Configurar axios con interceptores para manejar tokens
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token a las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // No redirigir automáticamente, dejar que AuthContext maneje
    }
    return Promise.reject(error);
  }
);

export interface CreateDriverRequest {
  driverId: string;
  name: string;
  email?: string;
  phone?: string;
  licenseNumber: string;
  licenseExpiry: Date;
  isActive: boolean;
  assignedVehicle?: string;
}

export interface UpdateDriverRequest extends Partial<CreateDriverRequest> {
  _id: string;
}

export interface DriverResponse {
  success: boolean;
  data: Driver;
}

export interface DriversResponse {
  success: boolean;
  data: Driver[];
}

class DriverService {
  private readonly STORAGE_KEY = 'fleet_tracking_drivers';

  // Obtener todos los choferes
  async getDrivers(): Promise<Driver[]> {
    try {
      const response = await api.get<DriversResponse>('/drivers');
      return response.data.data;
    } catch (error) {
      console.error('Error obteniendo choferes:', error);
      // Usar localStorage como fallback
      return this.getDriversFromStorage();
    }
  }

  // Obtener un chofer por ID
  async getDriver(id: string): Promise<Driver> {
    try {
      const response = await api.get<DriverResponse>(`/drivers/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error obteniendo chofer:', error);
      throw error;
    }
  }

  // Crear nuevo chofer
  async createDriver(driverData: CreateDriverRequest): Promise<Driver> {
    try {
      const response = await api.post<DriverResponse>('/drivers', driverData);
      return response.data.data;
    } catch (error) {
      console.error('Error creando chofer:', error);
      // Crear chofer en localStorage
      const newDriver: Driver = {
        _id: Date.now().toString(),
        ...driverData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.saveDriverToStorage(newDriver);
      return newDriver;
    }
  }

  // Actualizar chofer
  async updateDriver(id: string, driverData: Partial<CreateDriverRequest>): Promise<Driver> {
    try {
      const response = await api.put<DriverResponse>(`/drivers/${id}`, driverData);
      return response.data.data;
    } catch (error) {
      console.error('Error actualizando chofer:', error);
      // Actualizar chofer en localStorage
      const drivers = this.getDriversFromStorage();
      const driverIndex = drivers.findIndex(d => d._id === id);
      if (driverIndex !== -1) {
        drivers[driverIndex] = {
          ...drivers[driverIndex],
          ...driverData,
          updatedAt: new Date()
        };
        this.saveDriversToStorage(drivers);
        return drivers[driverIndex];
      }
      throw new Error('Chofer no encontrado');
    }
  }

  // Eliminar chofer
  async deleteDriver(id: string): Promise<void> {
    try {
      await api.delete(`/drivers/${id}`);
    } catch (error) {
      console.error('Error eliminando chofer:', error);
      // Eliminar chofer de localStorage
      const drivers = this.getDriversFromStorage();
      const filteredDrivers = drivers.filter(d => d._id !== id);
      this.saveDriversToStorage(filteredDrivers);
    }
  }

  // Asignar chofer a vehículo
  async assignDriverToVehicle(driverId: string, vehicleId: string): Promise<Driver> {
    try {
      const response = await api.post<DriverResponse>(`/drivers/${driverId}/assign`, {
        vehicleId
      });
      return response.data.data;
    } catch (error) {
      console.error('Error asignando chofer:', error);
      // Asignar chofer en localStorage
      const drivers = this.getDriversFromStorage();
      const driverIndex = drivers.findIndex(d => d._id === driverId);
      if (driverIndex !== -1) {
        drivers[driverIndex] = {
          ...drivers[driverIndex],
          assignedVehicle: vehicleId,
          updatedAt: new Date()
        };
        this.saveDriversToStorage(drivers);
        return drivers[driverIndex];
      }
      throw new Error('Chofer no encontrado');
    }
  }

  // Desasignar chofer de vehículo
  async unassignDriverFromVehicle(driverId: string): Promise<Driver> {
    try {
      const response = await api.post<DriverResponse>(`/drivers/${driverId}/unassign`);
      return response.data.data;
    } catch (error) {
      console.error('Error desasignando chofer:', error);
      // Desasignar chofer en localStorage
      const drivers = this.getDriversFromStorage();
      const driverIndex = drivers.findIndex(d => d._id === driverId);
      if (driverIndex !== -1) {
        drivers[driverIndex] = {
          ...drivers[driverIndex],
          assignedVehicle: undefined,
          updatedAt: new Date()
        };
        this.saveDriversToStorage(drivers);
        return drivers[driverIndex];
      }
      throw new Error('Chofer no encontrado');
    }
  }

  // Obtener choferes por vehículo
  async getDriversByVehicle(vehicleId: string): Promise<Driver[]> {
    try {
      const response = await api.get<DriversResponse>(`/drivers/vehicle/${vehicleId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error obteniendo choferes por vehículo:', error);
      return [];
    }
  }

  // Funciones de localStorage
  private getDriversFromStorage(): Driver[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const drivers = JSON.parse(stored);
        // Convertir fechas de string a Date
        return drivers.map((driver: any) => ({
          ...driver,
          licenseExpiry: new Date(driver.licenseExpiry),
          createdAt: driver.createdAt ? new Date(driver.createdAt) : undefined,
          updatedAt: driver.updatedAt ? new Date(driver.updatedAt) : undefined
        }));
      }
      return [];
    } catch (error) {
      console.error('Error leyendo choferes del localStorage:', error);
      return [];
    }
  }

  private saveDriversToStorage(drivers: Driver[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(drivers));
    } catch (error) {
      console.error('Error guardando choferes en localStorage:', error);
    }
  }

  private saveDriverToStorage(driver: Driver): void {
    try {
      const drivers = this.getDriversFromStorage();
      drivers.push(driver);
      this.saveDriversToStorage(drivers);
    } catch (error) {
      console.error('Error guardando chofer en localStorage:', error);
    }
  }
}

export const driverService = new DriverService();
