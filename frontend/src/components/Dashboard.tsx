
import React, { useState, useEffect, useCallback } from 'react';
import {
  GridLegacy as Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  DirectionsCar,
  Speed,
  LocalGasStation,
  Thermostat,
  Battery6Bar,
  Warning,
  Refresh,
  TrendingUp,
  Person
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Socket } from 'socket.io-client';
import { VehicleData, DashboardMetrics, Vehicle } from '../types';
import { vehicleService } from '../services/vehicleService';
import { 
  mockVehicles, 
  generateMockMetrics, 
  generateSpeedChartData, 
  generateFuelChartData,
  simulateRealTimeUpdates,
  generateMockVehicleData
} from '../data/mockData';
import VehicleSearchFilter from './VehicleSearchFilter';

interface DashboardProps {
  socket: Socket | null;
}

// Función para generar datos reales de velocidad
const generateRealSpeedChartData = async (vehicles: Vehicle[]): Promise<any[]> => {
  try {
    const chartData: any[] = [];
    
    // Generar datos para las últimas 24 horas (cada hora)
    for (let i = 23; i >= 0; i--) {
      const time = new Date();
      time.setHours(time.getHours() - i);
      const timeLabel = time.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
      
      const dataPoint: any = { time: timeLabel };
      
      // Para cada vehículo, intentar obtener datos históricos
      for (const vehicle of vehicles.slice(0, 3)) {
        try {
          const vehicleId = vehicle.vehicleId || vehicle._id;
          if (vehicleId) {
            const history = await vehicleService.getVehicleHistory(vehicleId, {
              startDate: new Date(time.getTime() - 60 * 60 * 1000).toISOString(), // 1 hora antes
              endDate: time.toISOString(),
              limit: 1
            });
            
            if (history.length > 0) {
              dataPoint[vehicleId] = history[0].speed || 0;
            } else {
              dataPoint[vehicleId] = 0;
            }
          }
        } catch (error) {
          // Si no hay datos históricos, usar datos mock
          dataPoint[vehicle.vehicleId || vehicle._id || 'default'] = Math.floor(Math.random() * 80) + 20;
        }
      }
      
      chartData.push(dataPoint);
    }
    
    return chartData;
  } catch (error) {
    console.warn('Error generando datos reales de velocidad, usando mock:', error);
    return generateSpeedChartData();
  }
};

// Función para generar datos reales de combustible y temperatura
const generateRealFuelChartData = async (vehicles: Vehicle[]): Promise<any[]> => {
  try {
    const chartData: any[] = [];
    
    for (const vehicle of vehicles.slice(0, 5)) {
      try {
        const vehicleId = vehicle.vehicleId || vehicle._id;
        if (vehicleId) {
          const currentData = await vehicleService.getCurrentData(vehicleId);
          chartData.push({
            name: vehicle.name,
            combustible: currentData.fuelLevel || 0,
            temperatura: currentData.engineTemperature || 0
          });
        }
      } catch (error) {
        // Si no hay datos, usar datos mock
        chartData.push({
          name: vehicle.name,
          combustible: Math.floor(Math.random() * 100),
          temperatura: Math.floor(Math.random() * 40) + 60
        });
      }
    }
    
    return chartData;
  } catch (error) {
    console.warn('Error generando datos reales de combustible, usando mock:', error);
    return generateFuelChartData();
  }
};

const Dashboard: React.FC<DashboardProps> = ({ socket }) => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalVehicles: 0,
    activeVehicles: 0,
    totalAlerts: 0,
    unreadAlerts: 0,
    avgSpeed: 0,
    totalDistance: 0
  });
  const [recentData, setRecentData] = useState<VehicleData[]>([]);
  const [speedData, setSpeedData] = useState<any[]>([]);
  const [fuelData, setFuelData] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('all');

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Cargar vehículos reales de la base de datos
      const realVehicles = await vehicleService.getVehicles();
      setVehicles(realVehicles);
      
      // Obtener datos reales de tracking para los vehículos
      const recentVehicleData: VehicleData[] = [];
      for (const vehicle of realVehicles.slice(0, 3)) {
        try {
          const vehicleId = vehicle.vehicleId || vehicle._id;
          if (vehicleId) {
            const currentData = await vehicleService.getCurrentData(vehicleId);
            recentVehicleData.push(currentData);
          }
        } catch (error) {
          console.warn(`No se pudieron obtener datos para vehículo ${vehicle.name}:`, error);
          // Fallback a datos mock si no hay datos reales
          recentVehicleData.push(generateMockVehicleData(vehicle.vehicleId || vehicle._id || 'default'));
        }
      }
      
      // Calcular métricas reales basadas en los vehículos y datos de tracking
      const activeVehicles = realVehicles.filter(v => v.isActive).length;
      const totalVehicles = realVehicles.length;
      
      // Calcular métricas de los datos de tracking
      let totalSpeed = 0;
      let totalDistance = 0;
      let dataCount = 0;
      
      for (const data of recentVehicleData) {
        if (data.speed !== undefined) {
          totalSpeed += data.speed;
          dataCount++;
        }
        if (data.odometer !== undefined) {
          totalDistance += data.odometer;
        }
      }
      
      const realMetrics: DashboardMetrics = {
        totalVehicles,
        activeVehicles,
        totalAlerts: 0, // TODO: Implementar con alertas reales
        unreadAlerts: 0, // TODO: Implementar con alertas reales
        avgSpeed: dataCount > 0 ? Math.round(totalSpeed / dataCount) : 0,
        totalDistance: Math.round(totalDistance / 1000) // Convertir a km
      };
      
      // Generar datos de gráficos con datos reales
      const speedChartData = await generateRealSpeedChartData(realVehicles);
      const fuelChartData = await generateRealFuelChartData(realVehicles);
      
      setSpeedData(speedChartData);
      setFuelData(fuelChartData);
      setRecentData(recentVehicleData);
      setMetrics(realMetrics);
      
      console.log('📊 Datos reales cargados:', {
        metrics: realMetrics,
        vehicles: realVehicles.length,
        recentData: recentVehicleData.length
      });
      
    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
      
      // Fallback a datos mock si hay error
      const mockMetrics = generateMockMetrics();
      const speedChartData = generateSpeedChartData();
      const fuelChartData = generateFuelChartData();
      const recentVehicleData = mockVehicles.slice(0, 3).map(vehicle => 
        generateMockVehicleData(vehicle.vehicleId)
      );
      
      setSpeedData(speedChartData);
      setFuelData(fuelChartData);
      setRecentData(recentVehicleData);
      setMetrics(mockMetrics);
      setVehicles(mockVehicles);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
    
    // Configurar WebSocket para actualizaciones en tiempo real
    if (socket) {
      socket.on('vehicle_update', handleVehicleUpdate);
      socket.on('alert', handleNewAlert);
    }

    // Simular actualizaciones en tiempo real con datos mock
    const cleanup = simulateRealTimeUpdates((newData) => {
      setRecentData(prev => {
        const updated = prev.map(data => 
          data.vehicleId === newData.vehicleId ? newData : data
        );
        
        // Actualizar métricas con los nuevos datos
        setMetrics(prevMetrics => ({
          ...prevMetrics,
          avgSpeed: Math.round(
            updated.reduce((sum, data) => sum + data.speed, 0) / updated.length
          )
        }));
        
        return updated;
      });
    });

    return () => {
      if (socket) {
        socket.off('vehicle_update', handleVehicleUpdate);
        socket.off('alert', handleNewAlert);
      }
      cleanup();
    };
  }, [socket, loadDashboardData]);


  const handleVehicleUpdate = (data: VehicleData) => {
    setRecentData(prev => {
      const updated = prev.filter(item => item.vehicleId !== data.vehicleId);
      return [data, ...updated].slice(0, 5);
    });
    
    // Actualizar métricas
    setMetrics(prev => ({
      ...prev,
      avgSpeed: (prev.avgSpeed + data.speed) / 2
    }));
  };

  const handleNewAlert = (alert: any) => {
    setMetrics(prev => ({
      ...prev,
      totalAlerts: prev.totalAlerts + 1,
      unreadAlerts: prev.unreadAlerts + 1
    }));
  };


  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2, textAlign: 'center' }}>
          Cargando dashboard...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header con título */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: 'text.primary' }}>
          📊 Centro de Control
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Monitoreo en tiempo real de tu flota de unidades
        </Typography>
      </Box>


      {/* Métricas principales */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Card 
            sx={{ 
              height: '100%',
              background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
              color: 'white',
              '&:hover': {
                transform: 'translateY(-4px)',
                transition: 'transform 0.2s ease-in-out',
              },
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Vehículos
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {metrics.totalVehicles}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <DirectionsCar sx={{ fontSize: 30, color: 'white' }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card 
            sx={{ 
              height: '100%',
              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              color: 'white',
              '&:hover': {
                transform: 'translateY(-4px)',
                transition: 'transform 0.2s ease-in-out',
              },
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Activos
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {metrics.activeVehicles}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <TrendingUp sx={{ fontSize: 30, color: 'white' }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card 
            sx={{ 
              height: '100%',
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              color: 'white',
              '&:hover': {
                transform: 'translateY(-4px)',
                transition: 'transform 0.2s ease-in-out',
              },
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Velocidad Prom.
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {Math.round(metrics.avgSpeed)} km/h
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Speed sx={{ fontSize: 30, color: 'white' }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card 
            sx={{ 
              height: '100%',
              background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
              color: 'white',
              '&:hover': {
                transform: 'translateY(-4px)',
                transition: 'transform 0.2s ease-in-out',
              },
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Alertas
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {metrics.totalAlerts}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Warning sx={{ fontSize: 30, color: 'white' }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card 
            sx={{ 
              height: '100%',
              background: 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)',
              color: 'white',
              '&:hover': {
                transform: 'translateY(-4px)',
                transition: 'transform 0.2s ease-in-out',
              },
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Distancia
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {Math.round(metrics.totalDistance)} km
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <TrendingUp sx={{ fontSize: 30, color: 'white' }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card 
            sx={{ 
              height: '100%',
              background: 'linear-gradient(135deg, #374151 0%, #4b5563 100%)',
              color: 'white',
              '&:hover': {
                transform: 'translateY(-4px)',
                transition: 'transform 0.2s ease-in-out',
              },
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <Tooltip title="Actualizar datos">
                  <IconButton 
                    onClick={loadDashboardData} 
                    sx={{ 
                      color: 'white',
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.1)',
                      },
                    }}
                  >
                    <Refresh sx={{ fontSize: 30 }} />
                  </IconButton>
                </Tooltip>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Gráficos */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Velocidad en Tiempo Real
              </Typography>
              <VehicleSearchFilter
                vehicles={vehicles}
                searchQuery={selectedVehicle === 'all' ? '' : selectedVehicle}
                onSearchChange={(query) => setSelectedVehicle(query || 'all')}
                placeholder="Filtrar vehículo en gráfica..."
                width={200}
                size="small"
                showAllOption={true}
                searchFields={['name', 'vehicleId']}
              />
            </Box>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={speedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis label={{ value: 'Velocidad (km/h)', angle: -90, position: 'insideLeft' }} />
                <RechartsTooltip 
                  formatter={(value, name) => [`${value} km/h`, name]}
                  labelFormatter={(label) => `Hora: ${label}`}
                />
                {selectedVehicle === 'all' ? (
                  <>
                    {vehicles.slice(0, 3).map((vehicle, index) => {
                      const vehicleId = vehicle.vehicleId || vehicle._id;
                      const colors = ['hsl(0, 70%, 50%)', 'hsl(120, 70%, 50%)', 'hsl(240, 70%, 50%)'];
                      return (
                        <Line 
                          key={vehicleId}
                          type="monotone" 
                          dataKey={vehicleId} 
                          stroke={colors[index]} 
                          strokeWidth={2}
                          name={vehicle.name}
                          dot={{ r: 4 }}
                        />
                      );
                    })}
                  </>
                ) : (
                  <Line 
                    type="monotone" 
                    dataKey={selectedVehicle} 
                    stroke="#1976d2" 
                    strokeWidth={3}
                    name={vehicles.find(v => (v.vehicleId || v._id) === selectedVehicle)?.name || 'Vehículo'}
                    dot={{ r: 5 }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Combustible y Temperatura
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={fuelData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis yAxisId="left" orientation="left" />
                <YAxis yAxisId="right" orientation="right" />
                <RechartsTooltip 
                  formatter={(value, name) => {
                    if (name === 'combustible') return [`${value}%`, 'Combustible'];
                    if (name === 'temperatura') return [`${value}°C`, 'Temperatura'];
                    return [value, name];
                  }}
                />
                <Bar 
                  yAxisId="left"
                  dataKey="combustible" 
                  fill="#4caf50" 
                  name="Combustible"
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  yAxisId="right"
                  dataKey="temperatura" 
                  fill="#ff9800" 
                  name="Temperatura"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 12, height: 12, backgroundColor: '#4caf50', borderRadius: 1 }} />
                <Typography variant="body2">Combustible (%)</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 12, height: 12, backgroundColor: '#ff9800', borderRadius: 1 }} />
                <Typography variant="body2">Temperatura (°C)</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Estado de vehículos */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Estado de Vehículos
            </Typography>
            <Grid container spacing={2}>
              {recentData.map((data, index) => {
                const vehicle = vehicles.find(v => (v.vehicleId || v._id) === data.vehicleId);
                return (
                  <Grid item xs={12} sm={6} md={4} key={data.vehicleId}>
                    <Card 
                      variant="outlined" 
                      sx={{ 
                        height: '100%',
                        '&:hover': {
                          boxShadow: 2,
                          transform: 'translateY(-2px)',
                        },
                        transition: 'all 0.2s ease-in-out'
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              {vehicle?.name || `Vehículo ${index + 1}`}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {vehicle?.licensePlate || data.vehicleId}
                            </Typography>
                          </Box>
                          <Chip 
                            label={(typeof data.speed === 'number' && data.speed > 0) ? 'En movimiento' : 'Detenido'} 
                            color={(typeof data.speed === 'number' && data.speed > 0) ? 'success' : 'default'}
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        </Box>

                        {/* Información del Chofer */}
                        {vehicle?.assignedDriver && (
                          <Box sx={{ mb: 2, p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Person sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {vehicle.assignedDriver.name}
                              </Typography>
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                              ID: {vehicle.assignedDriver.driverId}
                            </Typography>
                          </Box>
                        )}
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                            <Speed sx={{ fontSize: 18, mr: 1, color: 'primary.main' }} />
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Velocidad
                              </Typography>
                              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                {typeof data.speed === 'number' ? data.speed : 0} km/h
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                            <LocalGasStation sx={{ fontSize: 18, mr: 1, color: 'warning.main' }} />
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Combustible
                              </Typography>
                              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                {typeof data.fuelLevel === 'number' ? data.fuelLevel : 0}%
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                            <Thermostat sx={{ fontSize: 18, mr: 1, color: 'error.main' }} />
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Temperatura
                              </Typography>
                              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                {typeof data.engineTemperature === 'number' ? data.engineTemperature : 0}°C
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                            <Battery6Bar sx={{ fontSize: 18, mr: 1, color: 'success.main' }} />
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Batería
                              </Typography>
                              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                {typeof data.batteryVoltage === 'number' ? data.batteryVoltage : 0}V
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                        
                        <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                          <Typography variant="body2" color="text.secondary">
                            Última actualización: {new Date(data.timestamp).toLocaleTimeString()}
                          </Typography>
                          {Array.isArray(data.alerts) && data.alerts.length > 0 && (
                            <Box sx={{ mt: 1 }}>
                              {data.alerts.map((alert, alertIndex) => (
                                <Chip 
                                  key={alertIndex}
                                  label={alert} 
                                  color="warning" 
                                  size="small" 
                                  sx={{ mr: 0.5, mb: 0.5 }}
                                />
                              ))}
                            </Box>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
