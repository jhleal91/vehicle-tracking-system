import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Vehicle, VehicleData } from '../types';
import { vehicleService } from '../services/vehicleService';

interface VehicleContextType {
  vehicles: Vehicle[];
  currentVehicle: Vehicle | null;
  vehicleData: VehicleData[];
  loading: boolean;
  error: string | null;
  setCurrentVehicle: (vehicle: Vehicle | null) => void;
  refreshVehicles: () => Promise<void>;
  refreshVehicleData: (vehicleId: string) => Promise<void>;
}

const VehicleContext = createContext<VehicleContextType | undefined>(undefined);

interface VehicleProviderProps {
  children: ReactNode;
}

export const VehicleProvider: React.FC<VehicleProviderProps> = ({ children }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [currentVehicle, setCurrentVehicle] = useState<Vehicle | null>(null);
  const [vehicleData, setVehicleData] = useState<VehicleData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshVehicles = async () => {
    try {
      setLoading(true);
      setError(null);
      const vehiclesData = await vehicleService.getVehicles();
      setVehicles(vehiclesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando vehículos');
    } finally {
      setLoading(false);
    }
  };

  const refreshVehicleData = async (vehicleId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await vehicleService.getVehicleHistory(vehicleId);
      setVehicleData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando datos del vehículo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshVehicles();
  }, []);

  useEffect(() => {
    if (currentVehicle) {
      refreshVehicleData(currentVehicle.vehicleId);
    }
  }, [currentVehicle]);

  const value: VehicleContextType = {
    vehicles,
    currentVehicle,
    vehicleData,
    loading,
    error,
    setCurrentVehicle,
    refreshVehicles,
    refreshVehicleData
  };

  return (
    <VehicleContext.Provider value={value}>
      {children}
    </VehicleContext.Provider>
  );
};

export const useVehicle = (): VehicleContextType => {
  const context = useContext(VehicleContext);
  if (context === undefined) {
    throw new Error('useVehicle must be used within a VehicleProvider');
  }
  return context;
};
