import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { Paper, Typography, Box, Chip, IconButton, Tooltip } from '@mui/material';
import { Refresh, MyLocation, DirectionsCar, LocationOn, LocationOff } from '@mui/icons-material';
import VehicleSearchFilter from './VehicleSearchFilter';
import { Socket } from 'socket.io-client';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { vehicleService } from '../services/vehicleService';
import { Vehicle, VehicleData } from '../types';

// Fix para iconos de Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

interface MapViewProps {
  socket: Socket | null;
}

interface VehicleLocation {
  vehicleId: string;
  vehicleName: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  timestamp: Date;
  isEngineOn: boolean;
  fuelLevel?: number;
  engineTemperature?: number;
  licensePlate?: string;
}

const MapView: React.FC<MapViewProps> = ({ socket }) => {
  const [vehicles, setVehicles] = useState<VehicleLocation[]>([]);
  const [allVehicles, setAllVehicles] = useState<VehicleLocation[]>([]);
  const [vehicleData, setVehicleData] = useState<Vehicle[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [center, setCenter] = useState<[number, number]>([19.4326, -99.1332]); // Ciudad de México
  const [zoom, setZoom] = useState(13);
  const [loading, setLoading] = useState(true);
  const [showGeofences, setShowGeofences] = useState(true);

  // Función para aplicar filtro de búsqueda
  const applyVehicleFilter = (vehicleList: VehicleLocation[], query: string) => {
    if (!query.trim()) {
      setVehicles(vehicleList);
    } else {
      const searchTerm = query.toLowerCase().trim();
      const filtered = vehicleList.filter(vehicle => 
        vehicle.vehicleName?.toLowerCase().includes(searchTerm) ||
        vehicle.licensePlate?.toLowerCase().includes(searchTerm) ||
        vehicle.vehicleId?.toLowerCase().includes(searchTerm) ||
        vehicle.speed?.toString().includes(searchTerm) ||
        vehicle.fuelLevel?.toString().includes(searchTerm) ||
        vehicle.engineTemperature?.toString().includes(searchTerm)
      );
      setVehicles(filtered);
    }
  };

  const loadVehicleLocations = useCallback(async () => {
    try {
      setLoading(true);
      
      // Obtener vehículos reales de la base de datos
      const realVehicles = await vehicleService.getVehicles();
      setVehicleData(realVehicles); // Guardar datos completos de vehículos para geocercas
      const vehicleLocations: VehicleLocation[] = [];
      
      // Para cada vehículo, obtener su ubicación actual
      for (const vehicle of realVehicles) {
        try {
          const vehicleId = vehicle.vehicleId || vehicle._id;
          if (vehicleId) {
            const currentData = await vehicleService.getCurrentData(vehicleId);
            
            vehicleLocations.push({
              vehicleId: vehicleId,
              vehicleName: vehicle.name,
              latitude: currentData.location?.latitude || 19.4326,
              longitude: currentData.location?.longitude || -99.1332,
              speed: currentData.speed || 0,
              heading: currentData.heading || 0,
              timestamp: currentData.timestamp || new Date(),
              isEngineOn: (currentData.speed || 0) > 0,
              fuelLevel: currentData.fuelLevel,
              engineTemperature: currentData.engineTemperature,
              licensePlate: vehicle.licensePlate
            });
          }
        } catch (error) {
          console.warn(`No se pudieron obtener datos para vehículo ${vehicle.name}:`, error);
          
          // Fallback: usar ubicación dummy con datos del vehículo
          vehicleLocations.push({
            vehicleId: vehicle.vehicleId || vehicle._id || 'unknown',
            vehicleName: vehicle.name,
            latitude: 19.4326 + (Math.random() - 0.5) * 0.01, // Ubicación dummy en CDMX
            longitude: -99.1332 + (Math.random() - 0.5) * 0.01,
            speed: 0,
            heading: 0,
            timestamp: new Date(),
            isEngineOn: false,
            fuelLevel: 50,
            engineTemperature: 75,
            licensePlate: vehicle.licensePlate
          });
        }
      }
      
      setAllVehicles(vehicleLocations);
      applyVehicleFilter(vehicleLocations, searchQuery);
      console.log('📍 Ubicaciones de vehículos cargadas:', vehicleLocations.length);
      
    } catch (error) {
      console.error('Error cargando ubicaciones:', error);
      
      // Fallback a datos mock si hay error
      const mockVehicles: VehicleLocation[] = [
        {
          vehicleId: 'VEH001',
          vehicleName: 'Vehículo Demo',
          latitude: 19.4326,
          longitude: -99.1332,
          speed: 45,
          heading: 90,
          timestamp: new Date(),
          isEngineOn: true,
          fuelLevel: 75,
          engineTemperature: 85,
          licensePlate: 'DEMO-001'
        }
      ];
      setAllVehicles(mockVehicles);
      applyVehicleFilter(mockVehicles, searchQuery);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  const handleVehicleUpdate = useCallback((data: any) => {
    const updatedVehicle = {
      vehicleId: data.vehicleId,
      vehicleName: data.vehicleName || 'Vehículo',
      latitude: data.latitude,
      longitude: data.longitude,
      speed: data.speed,
      heading: data.heading,
      timestamp: new Date(data.timestamp),
      isEngineOn: data.isEngineOn || data.speed > 0,
      fuelLevel: data.fuelLevel,
      engineTemperature: data.engineTemperature,
      licensePlate: data.licensePlate
    };

    // Actualizar la lista completa
    setAllVehicles(prev => {
      const updated = prev.filter(v => v.vehicleId !== data.vehicleId);
      const newList = [...updated, updatedVehicle];
      // Aplicar filtro a la nueva lista
      applyVehicleFilter(newList, searchQuery);
      return newList;
    });
  }, [searchQuery]);

  // Efecto para aplicar filtro cuando cambia la búsqueda
  useEffect(() => {
    if (allVehicles.length > 0) {
      applyVehicleFilter(allVehicles, searchQuery);
    }
  }, [searchQuery, allVehicles]);

  useEffect(() => {
    loadVehicleLocations();
    
    if (socket) {
      socket.on('vehicle_update', handleVehicleUpdate);
    }
    
    return () => {
      if (socket) {
        socket.off('vehicle_update', handleVehicleUpdate);
      }
    };
  }, [socket, loadVehicleLocations, handleVehicleUpdate]);

  const handleRefresh = () => {
    loadVehicleLocations();
  };


  const handleCenterMap = () => {
    if (vehicles.length > 0) {
      const avgLat = vehicles.reduce((sum, v) => sum + v.latitude, 0) / vehicles.length;
      const avgLng = vehicles.reduce((sum, v) => sum + v.longitude, 0) / vehicles.length;
      setCenter([avgLat, avgLng]);
      setZoom(15);
    }
  };

  const getVehicleIcon = (vehicle: VehicleLocation) => {
    const color = vehicle.isEngineOn ? (vehicle.speed > 0 ? 'green' : 'orange') : 'red';
    return L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="
        background-color: ${color};
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      "></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">Cargando mapa...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Mapa de Vehículos ({vehicles.length} vehículos)
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <VehicleSearchFilter
            vehicles={allVehicles}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            placeholder="Buscar por nombre, placa, ID..."
            width={300}
            size="small"
            showAllOption={true}
            searchFields={['name', 'licensePlate', 'vehicleId', 'speed', 'fuelLevel', 'engineTemperature']}
          />
          <Box>
            <Tooltip title={showGeofences ? "Ocultar geocercas" : "Mostrar geocercas"}>
              <IconButton 
                onClick={() => setShowGeofences(!showGeofences)} 
                color={showGeofences ? "primary" : "default"}
              >
                {showGeofences ? <LocationOn /> : <LocationOff />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Centrar en vehículos">
              <IconButton onClick={handleCenterMap} color="primary">
                <MyLocation />
              </IconButton>
            </Tooltip>
            <Tooltip title="Actualizar ubicaciones">
              <IconButton onClick={handleRefresh} color="primary">
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>

      <Paper sx={{ height: '600px', overflow: 'hidden' }}>
        <MapContainer
          center={center}
          zoom={zoom}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {vehicles.map((vehicle) => (
            <Marker
              key={vehicle.vehicleId}
              position={[vehicle.latitude, vehicle.longitude]}
              icon={getVehicleIcon(vehicle)}
            >
              <Popup>
                <Box sx={{ minWidth: 200 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <DirectionsCar sx={{ color: 'primary.main' }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {vehicle.vehicleName}
                    </Typography>
                  </Box>
                  
                  {vehicle.licensePlate && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Placa: {vehicle.licensePlate}
                    </Typography>
                  )}
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Chip
                      label={vehicle.isEngineOn ? 'En movimiento' : 'Detenido'}
                      color={vehicle.isEngineOn ? 'success' : 'default'}
                      size="small"
                      sx={{ alignSelf: 'flex-start' }}
                    />
                    
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                      <Typography variant="body2">
                        <strong>Velocidad:</strong><br />
                        {vehicle.speed} km/h
                      </Typography>
                      <Typography variant="body2">
                        <strong>Dirección:</strong><br />
                        {vehicle.heading}°
                      </Typography>
                    </Box>
                    
                    {vehicle.fuelLevel !== undefined && (
                      <Typography variant="body2">
                        <strong>Combustible:</strong> {vehicle.fuelLevel}%
                      </Typography>
                    )}
                    
                    {vehicle.engineTemperature !== undefined && (
                      <Typography variant="body2">
                        <strong>Temperatura:</strong> {vehicle.engineTemperature}°C
                      </Typography>
                    )}
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: '0.75rem' }}>
                      Actualizado: {vehicle.timestamp.toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              </Popup>
            </Marker>
          ))}
          
          {/* Geocercas */}
          {showGeofences && vehicleData.map((vehicle) => {
            const geofence = vehicle.settings?.geofence;
            if (geofence?.enabled && geofence.center) {
              return (
                <Circle
                  key={`geofence-${vehicle._id}`}
                  center={[geofence.center.lat, geofence.center.lng]}
                  radius={geofence.radius}
                  pathOptions={{
                    color: '#ff4444',
                    fillColor: '#ff4444',
                    fillOpacity: 0.1,
                    weight: 2,
                    dashArray: '5, 5'
                  }}
                >
                  <Popup>
                    <Box sx={{ minWidth: 200 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        🚫 Geocerca - {vehicle.name}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Radio:</strong> {geofence.radius} metros
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Centro:</strong> {geofence.center.lat.toFixed(6)}, {geofence.center.lng.toFixed(6)}
                      </Typography>
                      <Typography variant="body2" color="error">
                        ⚠️ El vehículo no debe salir de esta zona
                      </Typography>
                    </Box>
                  </Popup>
                </Circle>
              );
            }
            return null;
          })}
        </MapContainer>
      </Paper>

      <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Chip label="🟢 En movimiento" size="small" />
        <Chip label="🟠 En ralentí" size="small" />
        <Chip label="🔴 Apagado" size="small" />
        {showGeofences && (
          <Chip 
            label="🚫 Geocerca" 
            size="small" 
            sx={{ 
              border: '2px dashed #ff4444',
              color: '#ff4444',
              backgroundColor: 'rgba(255, 68, 68, 0.1)'
            }} 
          />
        )}
      </Box>
    </Box>
  );
};

export default MapView;
