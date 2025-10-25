import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  GridLegacy as Grid,
  Paper,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  History,
  FilterList,
  Map,
  Timeline,
  Speed,
  Download,
  Refresh,
  Search,
  DirectionsCar
} from '@mui/icons-material';
import { Vehicle, Driver } from '../types';
import { vehicleService } from '../services/vehicleService';
import { driverService } from '../services/driverService';
import VehicleSearchFilter from './VehicleSearchFilter';

interface RouteHistoryProps {
  selectedVehicle?: Vehicle | null;
  onClose?: () => void;
}

interface RoutePoint {
  id: string;
  timestamp: Date;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  address?: string;
  fuelLevel?: number;
  engineTemperature?: number;
  odometer?: number;
  driverId?: string;
  driverName?: string;
}

interface RouteSegment {
  id: string;
  startTime: Date;
  endTime: Date;
  startLocation: string;
  endLocation: string;
  distance: number;
  avgSpeed: number;
  maxSpeed: number;
  duration: number;
  points: RoutePoint[];
  driverId?: string;
  driverName?: string;
  shift?: string; // Turno: mañana, tarde, noche
  routeType?: string; // Tipo de ruta: entrega, recogida, mantenimiento, etc.
}

const RouteHistory: React.FC<RouteHistoryProps> = ({ selectedVehicle, onClose }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(selectedVehicle?._id || '');
  const [routeHistory, setRouteHistory] = useState<RouteSegment[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  
  // Filtros
  const [minSpeed, setMinSpeed] = useState<number>(0);
  const [maxSpeed, setMaxSpeed] = useState<number>(200);
  const [searchAddress, setSearchAddress] = useState<string>('');
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const [selectedShift, setSelectedShift] = useState<string>('');
  const [selectedRouteType, setSelectedRouteType] = useState<string>('');
  
  // Estados para diálogos
  const [showFilters, setShowFilters] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState<RouteSegment | null>(null);

  const loadVehicles = async () => {
    try {
      const [vehiclesData, driversData] = await Promise.all([
        vehicleService.getVehicles(),
        driverService.getDrivers()
      ]);
      setVehicles(vehiclesData);
      setDrivers(driversData);
    } catch (error) {
      console.error('Error cargando vehículos y choferes:', error);
    }
  };

  const loadRouteHistory = useCallback(async () => {
    if (!selectedVehicleId) return;
    
    setLoading(true);
    try {
      // Obtener el vehículo seleccionado para saber qué choferes han estado asignados
      const selectedVehicle = vehicles.find(v => v._id === selectedVehicleId);
      const assignedDrivers = drivers.filter(d => d.assignedVehicle === selectedVehicleId);
      
      // Por ahora usamos datos mock, pero aquí se haría la llamada al backend
      const mockHistory: RouteSegment[] = [
        {
          id: '1',
          startTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
          endTime: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hora atrás
          startLocation: 'Oficina Principal, Ciudad de México',
          endLocation: 'Plaza Central, Ciudad de México',
          distance: 15.2,
          avgSpeed: 45.5,
          maxSpeed: 78.2,
          duration: 20, // minutos
          points: generateMockRoutePoints(assignedDrivers[0]?._id || 'DRV001', assignedDrivers[0]?.name || 'Juan Pérez'),
          driverId: assignedDrivers[0]?._id || 'DRV001',
          driverName: assignedDrivers[0]?.name || 'Juan Pérez',
          shift: 'Mañana',
          routeType: 'Entrega'
        },
        {
          id: '2',
          startTime: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 horas atrás
          endTime: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 horas atrás
          startLocation: 'Plaza Central, Ciudad de México',
          endLocation: 'Zona Industrial, Ciudad de México',
          distance: 8.7,
          avgSpeed: 32.1,
          maxSpeed: 65.0,
          duration: 16,
          points: generateMockRoutePoints(assignedDrivers[1]?._id || 'DRV002', assignedDrivers[1]?.name || 'María González'),
          driverId: assignedDrivers[1]?._id || 'DRV002',
          driverName: assignedDrivers[1]?.name || 'María González',
          shift: 'Tarde',
          routeType: 'Recogida'
        },
        {
          id: '3',
          startTime: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 horas atrás
          endTime: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 horas atrás
          startLocation: 'Zona Industrial, Ciudad de México',
          endLocation: 'Oficina Principal, Ciudad de México',
          distance: 12.3,
          avgSpeed: 38.7,
          maxSpeed: 72.1,
          duration: 19,
          points: generateMockRoutePoints(assignedDrivers[0]?._id || 'DRV001', assignedDrivers[0]?.name || 'Juan Pérez'),
          driverId: assignedDrivers[0]?._id || 'DRV001',
          driverName: assignedDrivers[0]?.name || 'Juan Pérez',
          shift: 'Noche',
          routeType: 'Mantenimiento'
        }
      ];
      
      // Aplicar filtros
      let filteredHistory = mockHistory;
      
      if (selectedDriverId) {
        filteredHistory = filteredHistory.filter(route => route.driverId === selectedDriverId);
      }
      
      if (selectedShift) {
        filteredHistory = filteredHistory.filter(route => route.shift === selectedShift);
      }
      
      if (selectedRouteType) {
        filteredHistory = filteredHistory.filter(route => route.routeType === selectedRouteType);
      }
      
      if (searchAddress) {
        filteredHistory = filteredHistory.filter(route => 
          route.startLocation.toLowerCase().includes(searchAddress.toLowerCase()) ||
          route.endLocation.toLowerCase().includes(searchAddress.toLowerCase())
        );
      }
      
      setRouteHistory(filteredHistory);
    } catch (error) {
      console.error('Error cargando historial de rutas:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedVehicleId, vehicles, drivers, selectedDriverId, selectedShift, selectedRouteType, searchAddress]);

  useEffect(() => {
    loadVehicles();
  }, []);

  useEffect(() => {
    if (selectedVehicleId) {
      loadRouteHistory();
    }
  }, [selectedVehicleId, minSpeed, maxSpeed, searchAddress, selectedDriverId, selectedShift, selectedRouteType, loadRouteHistory]);

  const generateMockRoutePoints = (driverId?: string, driverName?: string): RoutePoint[] => {
    const points: RoutePoint[] = [];
    for (let i = 0; i < 10; i++) {
      points.push({
        id: `point_${i}`,
        timestamp: new Date(Date.now() - (i * 5 * 60 * 1000)),
        latitude: 19.4326 + (Math.random() - 0.5) * 0.01,
        longitude: -99.1332 + (Math.random() - 0.5) * 0.01,
        speed: Math.floor(Math.random() * 80) + 20,
        heading: Math.floor(Math.random() * 360),
        address: `Dirección ${i + 1}, Ciudad de México`,
        fuelLevel: Math.floor(Math.random() * 40) + 60,
        engineTemperature: Math.floor(Math.random() * 20) + 80,
        odometer: 15000 + (i * 2),
        driverId: driverId,
        driverName: driverName
      });
    }
    return points;
  };

  const handleExportHistory = () => {
    // Implementar exportación a CSV/Excel
    console.log('Exportando historial...');
  };

  const handleViewOnMap = (segment: RouteSegment) => {
    setSelectedSegment(segment);
    setShowMap(true);
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDateTime = (date: Date): string => {
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredHistory = routeHistory.filter(segment => {
    // Aplicar filtros aquí
    if (minSpeed > 0 && segment.avgSpeed < minSpeed) return false;
    if (maxSpeed < 200 && segment.maxSpeed > maxSpeed) return false;
    if (searchAddress && !segment.startLocation.toLowerCase().includes(searchAddress.toLowerCase()) && 
        !segment.endLocation.toLowerCase().includes(searchAddress.toLowerCase())) return false;
    return true;
  });

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <History color="primary" sx={{ fontSize: 32 }} />
          <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
              Historial de Rutas
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Monitoreo detallado de desplazamientos y rutas
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<FilterList />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filtros
          </Button>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={handleExportHistory}
          >
            Exportar
          </Button>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadRouteHistory}
            disabled={loading}
          >
            Actualizar
          </Button>
          {onClose && (
            <Button variant="outlined" onClick={onClose}>
              Cerrar
            </Button>
          )}
        </Box>
      </Box>

      {/* Filtros */}
      {showFilters && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Filtros de Búsqueda
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <VehicleSearchFilter
                vehicles={vehicles}
                searchQuery={selectedVehicleId}
                onSearchChange={(query) => {
                  const vehicle = vehicles.find(v => v.name === query || v.vehicleId === query);
                  setSelectedVehicleId(vehicle?._id || '');
                }}
                placeholder="Seleccionar vehículo..."
                width="100%"
                size="small"
                showAllOption={true}
                searchFields={['name', 'vehicleId', 'licensePlate']}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Buscar por dirección"
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Velocidad mínima (km/h)"
                type="number"
                value={minSpeed}
                onChange={(e) => setMinSpeed(parseInt(e.target.value) || 0)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Velocidad máxima (km/h)"
                type="number"
                value={maxSpeed}
                onChange={(e) => setMaxSpeed(parseInt(e.target.value) || 200)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Chofer</InputLabel>
                <Select
                  value={selectedDriverId}
                  onChange={(e) => setSelectedDriverId(e.target.value)}
                  label="Chofer"
                >
                  <MenuItem value="">Todos los choferes</MenuItem>
                  {drivers.map((driver) => (
                    <MenuItem key={driver._id} value={driver._id}>
                      {driver.name} ({driver.driverId})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Turno</InputLabel>
                <Select
                  value={selectedShift}
                  onChange={(e) => setSelectedShift(e.target.value)}
                  label="Turno"
                >
                  <MenuItem value="">Todos los turnos</MenuItem>
                  <MenuItem value="Mañana">Mañana</MenuItem>
                  <MenuItem value="Tarde">Tarde</MenuItem>
                  <MenuItem value="Noche">Noche</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Tipo de Ruta</InputLabel>
                <Select
                  value={selectedRouteType}
                  onChange={(e) => setSelectedRouteType(e.target.value)}
                  label="Tipo de Ruta"
                >
                  <MenuItem value="">Todos los tipos</MenuItem>
                  <MenuItem value="Entrega">Entrega</MenuItem>
                  <MenuItem value="Recogida">Recogida</MenuItem>
                  <MenuItem value="Mantenimiento">Mantenimiento</MenuItem>
                  <MenuItem value="Inspección">Inspección</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab icon={<Timeline />} label="Lista de Rutas" />
          <Tab icon={<Map />} label="Vista de Mapa" />
          <Tab icon={<DirectionsCar />} label="Estadísticas" />
        </Tabs>
      </Box>

      {/* Contenido de las tabs */}
      {activeTab === 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Fecha/Hora</TableCell>
                <TableCell>Ruta</TableCell>
                <TableCell>Chofer</TableCell>
                <TableCell>Turno</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Distancia</TableCell>
                <TableCell>Duración</TableCell>
                <TableCell>Velocidad Prom.</TableCell>
                <TableCell>Velocidad Máx.</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredHistory.map((segment) => (
                <TableRow key={segment.id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {formatDateTime(segment.startTime)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDateTime(segment.endTime)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {segment.startLocation}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        → {segment.endLocation}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {segment.driverName || 'Sin chofer'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ID: {segment.driverId || 'N/A'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={segment.shift || 'N/A'}
                      color={segment.shift === 'Mañana' ? 'success' : segment.shift === 'Tarde' ? 'warning' : 'info'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={segment.routeType || 'N/A'}
                      color="primary"
                      variant="outlined"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {segment.distance} km
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDuration(segment.duration)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Speed sx={{ fontSize: 16, color: 'primary.main' }} />
                      <Typography variant="body2">
                        {segment.avgSpeed} km/h
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={`${segment.maxSpeed} km/h`}
                      color={segment.maxSpeed > 80 ? 'error' : segment.maxSpeed > 60 ? 'warning' : 'success'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Ver en mapa">
                      <IconButton
                        size="small"
                        onClick={() => handleViewOnMap(segment)}
                        color="primary"
                      >
                        <Map />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {activeTab === 1 && (
        <Paper sx={{ p: 3, textAlign: 'center', minHeight: 400 }}>
          <Map sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Vista de Mapa
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Selecciona una ruta de la lista para verla en el mapa
          </Typography>
        </Paper>
      )}

      {activeTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Resumen del Período
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Total de Rutas:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {filteredHistory.length}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Distancia Total:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {filteredHistory.reduce((sum, seg) => sum + seg.distance, 0).toFixed(1)} km
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Tiempo Total:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {formatDuration(filteredHistory.reduce((sum, seg) => sum + seg.duration, 0))}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Velocidad Promedio:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {filteredHistory.length > 0 
                        ? (filteredHistory.reduce((sum, seg) => sum + seg.avgSpeed, 0) / filteredHistory.length).toFixed(1)
                        : 0} km/h
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Gráfico de Velocidades
                </Typography>
                <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Gráfico de velocidades por ruta
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Dialog para ver ruta en mapa */}
      <Dialog open={showMap} onClose={() => setShowMap(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Map color="primary" />
            <Typography variant="h6">
              Ruta: {selectedSegment?.startLocation} → {selectedSegment?.endLocation}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedSegment && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" color="primary">
                        {selectedSegment.distance} km
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Distancia
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" color="primary">
                        {formatDuration(selectedSegment.duration)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Duración
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" color="primary">
                        {selectedSegment.avgSpeed} km/h
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Velocidad Prom.
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" color="primary">
                        {selectedSegment.maxSpeed} km/h
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Velocidad Máx.
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
              
              <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 1, borderColor: 'divider' }}>
                <Typography variant="body2" color="text.secondary">
                  Mapa con la ruta detallada
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowMap(false)}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RouteHistory;
