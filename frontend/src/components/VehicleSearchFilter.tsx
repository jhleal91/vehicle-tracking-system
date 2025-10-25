import React from 'react';
import { Autocomplete, TextField, Box, Typography } from '@mui/material';
import { Search, DirectionsCar } from '@mui/icons-material';

export interface VehicleOption {
  label: string;
  value: string;
  type?: string;
  vehicleId?: string;
  vehicleName?: string;
  licensePlate?: string;
}

export interface VehicleSearchFilterProps {
  vehicles: Array<{
    vehicleId?: string;
    vehicleName?: string;
    licensePlate?: string;
    speed?: number;
    fuelLevel?: number;
    engineTemperature?: number;
  }>;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  placeholder?: string;
  width?: number | string;
  size?: 'small' | 'medium';
  showAllOption?: boolean;
  searchFields?: string[];
}

const VehicleSearchFilter: React.FC<VehicleSearchFilterProps> = ({
  vehicles,
  searchQuery,
  onSearchChange,
  placeholder = "Buscar por nombre, placa, ID...",
  width = 300,
  size = 'small',
  showAllOption = true,
  searchFields = ['name', 'licensePlate', 'vehicleId', 'speed', 'fuelLevel', 'engineTemperature']
}) => {
  // Generar opciones para el autocompletado
  const getSearchOptions = (): VehicleOption[] => {
    const options: VehicleOption[] = [];
    
    // Agregar opción para mostrar todos
    if (showAllOption) {
      options.push({ 
        label: 'Todos los vehículos', 
        value: '',
        type: 'Todos'
      });
    }
    
    // Agregar cada vehículo con múltiples opciones de búsqueda
    vehicles.forEach(vehicle => {
      // Opción por nombre
      if (searchFields.includes('name') && vehicle.vehicleName) {
        options.push({ 
          label: `${vehicle.vehicleName}`, 
          value: vehicle.vehicleName,
          type: 'Nombre',
          vehicleId: vehicle.vehicleId,
          vehicleName: vehicle.vehicleName,
          licensePlate: vehicle.licensePlate
        });
      }
      
      // Opción por placa
      if (searchFields.includes('licensePlate') && vehicle.licensePlate) {
        options.push({ 
          label: `Placa: ${vehicle.licensePlate}`, 
          value: vehicle.licensePlate,
          type: 'Placa',
          vehicleId: vehicle.vehicleId,
          vehicleName: vehicle.vehicleName,
          licensePlate: vehicle.licensePlate
        });
      }
      
      // Opción por ID
      if (searchFields.includes('vehicleId') && vehicle.vehicleId) {
        options.push({ 
          label: `ID: ${vehicle.vehicleId}`, 
          value: vehicle.vehicleId,
          type: 'ID',
          vehicleId: vehicle.vehicleId,
          vehicleName: vehicle.vehicleName,
          licensePlate: vehicle.licensePlate
        });
      }

      // Opción por velocidad
      if (searchFields.includes('speed') && vehicle.speed !== undefined) {
        options.push({ 
          label: `Velocidad: ${vehicle.speed} km/h`, 
          value: vehicle.speed.toString(),
          type: 'Velocidad',
          vehicleId: vehicle.vehicleId,
          vehicleName: vehicle.vehicleName,
          licensePlate: vehicle.licensePlate
        });
      }

      // Opción por combustible
      if (searchFields.includes('fuelLevel') && vehicle.fuelLevel !== undefined) {
        options.push({ 
          label: `Combustible: ${vehicle.fuelLevel}%`, 
          value: vehicle.fuelLevel.toString(),
          type: 'Combustible',
          vehicleId: vehicle.vehicleId,
          vehicleName: vehicle.vehicleName,
          licensePlate: vehicle.licensePlate
        });
      }

      // Opción por temperatura
      if (searchFields.includes('engineTemperature') && vehicle.engineTemperature !== undefined) {
        options.push({ 
          label: `Temperatura: ${vehicle.engineTemperature}°C`, 
          value: vehicle.engineTemperature.toString(),
          type: 'Temperatura',
          vehicleId: vehicle.vehicleId,
          vehicleName: vehicle.vehicleName,
          licensePlate: vehicle.licensePlate
        });
      }
    });
    
    return options;
  };


  const options = getSearchOptions();

  return (
    <Autocomplete
      size={size}
      sx={{ minWidth: width }}
      freeSolo
      options={options}
      value={searchQuery}
      onInputChange={(event, newValue) => {
        onSearchChange(newValue || '');
      }}
      onChange={(event, newValue) => {
        if (typeof newValue === 'string') {
          onSearchChange(newValue);
        } else if (newValue) {
          onSearchChange(newValue.value);
        } else {
          onSearchChange('');
        }
      }}
      getOptionLabel={(option) => {
        if (typeof option === 'string') return option;
        return option.label;
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={placeholder}
          InputProps={{
            ...params.InputProps,
            startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />
          }}
        />
      )}
      renderOption={(props, option) => (
        <Box component="li" {...props}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DirectionsCar fontSize="small" color="primary" />
            <Box>
              <Typography variant="body2">{option.label}</Typography>
              {option.type && (
                <Typography variant="caption" color="text.secondary">
                  {option.type}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      )}
    />
  );
};

export default VehicleSearchFilter;
