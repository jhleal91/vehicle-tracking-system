import axios from 'axios';
import { User, LoginRequest, RegisterRequest, ApiResponse } from '../types';

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

// Interceptor para manejar respuestas
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido - solo limpiar token, no redirigir
      localStorage.removeItem('token');
      // No redirigir automáticamente, dejar que el AuthContext maneje esto
    }
    return Promise.reject(error);
  }
);

interface LoginResponse {
  success: boolean;
  token: string;
  user: User;
}

interface RegisterResponse {
  success: boolean;
  token: string;
  user: User;
}

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Error al iniciar sesión');
    }
  },

  async register(userData: RegisterRequest): Promise<RegisterResponse> {
    try {
      const response = await apiClient.post<RegisterResponse>('/auth/register', userData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Error al registrarse');
    }
  },

  async verifyToken(): Promise<User> {
    try {
      const response = await apiClient.get<ApiResponse<User>>('/auth/verify');
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error('Token inválido');
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Error verificando token');
    }
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      // Ignorar errores en logout
    } finally {
      localStorage.removeItem('token');
    }
  },

  async refreshToken(): Promise<string> {
    try {
      const response = await apiClient.post<{ token: string }>('/auth/refresh');
      const newToken = response.data.token;
      localStorage.setItem('token', newToken);
      return newToken;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Error renovando token');
    }
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      await apiClient.post('/auth/change-password', {
        currentPassword,
        newPassword
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Error cambiando contraseña');
    }
  },

  async resetPassword(email: string): Promise<void> {
    try {
      await apiClient.post('/auth/reset-password', { email });
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Error enviando email de recuperación');
    }
  },

  async updateProfile(userData: Partial<User>): Promise<User> {
    try {
      const response = await apiClient.put<ApiResponse<User>>('/auth/profile', userData);
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error('Error actualizando perfil');
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Error actualizando perfil');
    }
  }
};

export default authService;
