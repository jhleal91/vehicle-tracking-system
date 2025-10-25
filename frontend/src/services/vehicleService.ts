import axios from 'axios';
import { Vehicle, VehicleData, VehicleStats, Alert, VehicleCreateRequest, VehicleUpdateRequest } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Configurar axios con interceptores
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token a las peticiones
apiClient.interceptors.request.use(
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

export const vehicleService = {
  // Obtener todos los vehículos del usuario
  async getVehicles(): Promise<Vehicle[]> {
    try {
      const response = await apiClient.get<Vehicle[]>('/vehicles');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Error obteniendo vehículos');
    }
  },

  // Obtener un vehículo por ID
  async getVehicle(vehicleId: string): Promise<Vehicle> {
    try {
      const response = await apiClient.get<Vehicle>(`/vehicles/${vehicleId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Error obteniendo vehículo');
    }
  },

  // Crear nuevo vehículo
  async createVehicle(vehicleData: VehicleCreateRequest): Promise<Vehicle> {
    try {
      const response = await apiClient.post<Vehicle>('/vehicles', vehicleData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Error creando vehículo');
    }
  },

  // Actualizar vehículo
  async updateVehicle(vehicleId: string, vehicleData: VehicleUpdateRequest): Promise<Vehicle> {
    try {
      const response = await apiClient.put<Vehicle>(`/vehicles/${vehicleId}`, vehicleData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Error actualizando vehículo');
    }
  },

  // Eliminar vehículo
  async deleteVehicle(vehicleId: string): Promise<void> {
    try {
      await apiClient.delete(`/vehicles/${vehicleId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Error eliminando vehículo');
    }
  },

  // Obtener datos actuales de un vehículo
  async getCurrentData(vehicleId: string): Promise<VehicleData> {
    try {
      const response = await apiClient.get<VehicleData>(`/vehicle/${vehicleId}/current`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Error obteniendo datos actuales');
    }
  },

  // Obtener historial de datos de un vehículo
  async getVehicleHistory(vehicleId: string, options?: {
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<VehicleData[]> {
    try {
      const params = new URLSearchParams();
      if (options?.startDate) params.append('startDate', options.startDate);
      if (options?.endDate) params.append('endDate', options.endDate);
      if (options?.limit) params.append('limit', options.limit.toString());

      const response = await apiClient.get<VehicleData[]>(
        `/vehicle/${vehicleId}/history?${params.toString()}`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Error obteniendo historial');
    }
  },

  // Obtener estadísticas de un vehículo
  async getStats(vehicleId: string, days: number = 7): Promise<VehicleStats> {
    try {
      const response = await apiClient.get<VehicleStats>(
        `/vehicle/${vehicleId}/stats?days=${days}`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Error obteniendo estadísticas');
    }
  },

  // Obtener alertas de un vehículo
  async getAlerts(vehicleId: string, options?: {
    limit?: number;
    unreadOnly?: boolean;
  }): Promise<Alert[]> {
    try {
      const params = new URLSearchParams();
      if (options?.limit) params.append('limit', options.limit.toString());
      if (options?.unreadOnly) params.append('unreadOnly', options.unreadOnly.toString());

      const response = await apiClient.get<Alert[]>(
        `/vehicle/${vehicleId}/alerts?${params.toString()}`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Error obteniendo alertas');
    }
  },

  // Marcar alerta como leída
  async markAlertAsRead(alertId: string): Promise<Alert> {
    try {
      const response = await apiClient.put<Alert>(`/alerts/${alertId}/read`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Error marcando alerta como leída');
    }
  },

  // Obtener todas las alertas del usuario
  async getAllAlerts(options?: {
    limit?: number;
    unreadOnly?: boolean;
    severity?: string;
  }): Promise<Alert[]> {
    try {
      const params = new URLSearchParams();
      if (options?.limit) params.append('limit', options.limit.toString());
      if (options?.unreadOnly) params.append('unreadOnly', options.unreadOnly.toString());
      if (options?.severity) params.append('severity', options.severity);

      const response = await apiClient.get<Alert[]>(`/alerts?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Error obteniendo alertas');
    }
  },

  // Enviar datos de prueba (para testing)
  async sendTestData(vehicleId: string, data: Partial<VehicleData>): Promise<void> {
    try {
      await apiClient.post('/vehicle-data', {
        ...data,
        vehicleId
      }, {
        headers: {
          'vehicle-id': vehicleId
        }
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Error enviando datos de prueba');
    }
  },

  // Obtener ubicaciones para ruta
  async getRoute(vehicleId: string, startDate: string, endDate: string): Promise<VehicleData[]> {
    try {
      const response = await apiClient.get<VehicleData[]>(
        `/vehicle/${vehicleId}/route?startDate=${startDate}&endDate=${endDate}`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Error obteniendo ruta');
    }
  },

  // Exportar datos
  async exportData(vehicleId: string, format: 'csv' | 'json', options?: {
    startDate?: string;
    endDate?: string;
  }): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      params.append('format', format);
      if (options?.startDate) params.append('startDate', options.startDate);
      if (options?.endDate) params.append('endDate', options.endDate);

      const response = await apiClient.get(
        `/vehicle/${vehicleId}/export?${params.toString()}`,
        { responseType: 'blob' }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Error exportando datos');
    }
  }
};

export default vehicleService;
