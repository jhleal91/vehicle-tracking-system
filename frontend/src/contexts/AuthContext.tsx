import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '../types';
import { authService } from '../services/authService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Verificar si hay un token guardado
    const token = localStorage.getItem('token');
    if (token) {
      // Verificar token con el servidor
      authService.verifyToken()
        .then(userData => {
          setUser(userData);
          setIsAuthenticated(true);
        })
        .catch((error) => {
          console.warn('Token inválido o expirado:', error);
          localStorage.removeItem('token');
          setUser(null);
          setIsAuthenticated(false);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      const response = await authService.login({ email, password });
      
      // Guardar token
      localStorage.setItem('token', response.token);
      
      // Actualizar usuario y estado de autenticación
      setUser(response.user);
      setIsAuthenticated(true);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string): Promise<void> => {
    try {
      setLoading(true);
      const response = await authService.register({ email, password, name });
      
      // Guardar token
      localStorage.setItem('token', response.token);
      
      // Actualizar usuario
      setUser(response.user);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = (): void => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
