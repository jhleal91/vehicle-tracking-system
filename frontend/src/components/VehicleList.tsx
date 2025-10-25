import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  GridLegacy as Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Speed,
  LocalGasStation,
  Thermostat,
  Battery6Bar,
  Refresh,
  LocationOn,
  History,
  Person
} from '@mui/icons-material';
import { Vehicle, Driver } from '../types';
import { vehicleService } from '../services/vehicleService';
import { driverService } from '../services/driverService';
import VehicleSearchFilter from './VehicleSearchFilter';
import VehicleGeofenceConfig from './VehicleGeofenceConfig';
import RouteHistory from './RouteHistory';
import DriverManagement from './DriverManagement';

const VehicleList: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [geofenceDialogOpen, setGeofenceDialogOpen] = useState(false);
  const [selectedVehicleForGeofence, setSelectedVehicleForGeofence] = useState<Vehicle | null>(null);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedVehicleForHistory, setSelectedVehicleForHistory] = useState<Vehicle | null>(null);
  const [driverDialogOpen, setDriverDialogOpen] = useState(false);
  const [selectedVehicleForDriver, setSelectedVehicleForDriver] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState({
    vehicleId: '',
    name: '',
    make: '',
    model: '',
    year: '',
    vin: '',
    licensePlate: ''
  });

  useEffect(() => {
    loadVehicles();
  }, []);

  // Filtrar vehículos basado en la búsqueda
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredVehicles(vehicles);
    } else {
      const searchTerm = searchQuery.toLowerCase().trim();
      const filtered = vehicles.filter(vehicle => 
        vehicle.name?.toLowerCase().includes(searchTerm) ||
        vehicle.licensePlate?.toLowerCase().includes(searchTerm) ||
        vehicle.vehicleId?.toLowerCase().includes(searchTerm) ||
        vehicle.make?.toLowerCase().includes(searchTerm) ||
        vehicle.model?.toLowerCase().includes(searchTerm) ||
        vehicle.vin?.toLowerCase().includes(searchTerm)
      );
      setFilteredVehicles(filtered);
    }
  }, [searchQuery, vehicles]);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const [vehiclesData, driversData] = await Promise.all([
        vehicleService.getVehicles(),
        driverService.getDrivers()
      ]);
      
      // Asignar choferes a vehículos
      const vehiclesWithDrivers = vehiclesData.map(vehicle => {
        const assignedDriver = driversData.find(driver => driver.assignedVehicle === vehicle._id);
        return {
          ...vehicle,
          assignedDriver
        };
      });
      
      setVehicles(vehiclesWithDrivers);
      setDrivers(driversData);
    } catch (error) {
      console.error('Error cargando vehículos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (vehicle?: Vehicle) => {
    if (vehicle) {
      setEditingVehicle(vehicle);
      setFormData({
        vehicleId: vehicle.vehicleId,
        name: vehicle.name,
        make: vehicle.make || '',
        model: vehicle.model || '',
        year: vehicle.year?.toString() || '',
        vin: vehicle.vin || '',
        licensePlate: vehicle.licensePlate || ''
      });
    } else {
      setEditingVehicle(null);
      setFormData({
        vehicleId: '',
        name: '',
        make: '',
        model: '',
        year: '',
        vin: '',
        licensePlate: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingVehicle(null);
  };

  const handleSubmit = async () => {
    try {
      const vehicleData = {
        ...formData,
        year: formData.year ? parseInt(formData.year) : undefined
      };
      
      if (editingVehicle && editingVehicle._id) {
        // Actualizar vehículo existente
        await vehicleService.updateVehicle(editingVehicle._id, vehicleData);
      } else {
        // Crear nuevo vehículo
        await vehicleService.createVehicle(vehicleData);
      }
      await loadVehicles();
      handleCloseDialog();
    } catch (error) {
      console.error('Error guardando vehículo:', error);
    }
  };

  const handleDelete = async (vehicleId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este vehículo?')) {
      try {
        await vehicleService.deleteVehicle(vehicleId);
        await loadVehicles();
      } catch (error) {
        console.error('Error eliminando vehículo:', error);
      }
    }
  };

  const handleOpenGeofenceDialog = (vehicle: Vehicle) => {
    setSelectedVehicleForGeofence(vehicle);
    setGeofenceDialogOpen(true);
  };

  const handleCloseGeofenceDialog = () => {
    setGeofenceDialogOpen(false);
    setSelectedVehicleForGeofence(null);
  };

  const handleSaveGeofences = async (geofences: any[]) => {
    if (selectedVehicleForGeofence) {
      try {
        // Aquí se haría la llamada al backend para guardar las geocercas
        console.log('Guardando geocercas para vehículo:', selectedVehicleForGeofence.name, geofences);
        // await vehicleService.updateVehicleGeofences(selectedVehicleForGeofence._id, geofences);
      } catch (error) {
        console.error('Error guardando geocercas:', error);
      }
    }
  };

  const handleOpenHistoryDialog = (vehicle: Vehicle) => {
    setSelectedVehicleForHistory(vehicle);
    setHistoryDialogOpen(true);
  };

  const handleCloseHistoryDialog = () => {
    setHistoryDialogOpen(false);
    setSelectedVehicleForHistory(null);
  };

  const handleOpenDriverDialog = (vehicle: Vehicle) => {
    setSelectedVehicleForDriver(vehicle);
    setDriverDialogOpen(true);
  };

  const handleCloseDriverDialog = () => {
    setDriverDialogOpen(false);
    setSelectedVehicleForDriver(null);
  };

  const handleDriverAssign = async (driverId: string) => {
    if (selectedVehicleForDriver) {
      try {
        // Asignar o desasignar chofer
        if (driverId && driverId !== 'unassign') {
          await driverService.assignDriverToVehicle(driverId, selectedVehicleForDriver._id!);
        } else {
          // Desasignar chofer actual
          const currentDriver = drivers.find(d => d.assignedVehicle === selectedVehicleForDriver._id);
          if (currentDriver) {
            await driverService.unassignDriverFromVehicle(currentDriver._id!);
          }
        }
        loadVehicles(); // Recargar la lista de vehículos
      } catch (error) {
        console.error('Error asignando chofer:', error);
      }
    }
  };

  const getStatusColor = (vehicle: Vehicle) => {
    if (!vehicle.lastUpdate) return 'default';
    const now = new Date();
    const lastUpdate = new Date(vehicle.lastUpdate);
    const diffMinutes = (now.getTime() - lastUpdate.getTime()) / (1000 * 60);
    
    if (diffMinutes < 5) return 'success';
    if (diffMinutes < 30) return 'warning';
    return 'error';
  };

  const getStatusText = (vehicle: Vehicle) => {
    if (!vehicle.lastUpdate) return 'Sin datos';
    const now = new Date();
    const lastUpdate = new Date(vehicle.lastUpdate);
    const diffMinutes = (now.getTime() - lastUpdate.getTime()) / (1000 * 60);
    
    if (diffMinutes < 5) return 'En línea';
    if (diffMinutes < 30) return 'Reciente';
    return 'Desconectado';
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">Cargando vehículos...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          Mis Vehículos ({filteredVehicles.length} de {vehicles.length})
        </Typography>
        <Box>
          <IconButton onClick={loadVehicles} color="primary">
            <Refresh />
          </IconButton>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Agregar Vehículo
          </Button>
        </Box>
      </Box>

      {/* Filtro de búsqueda */}
      <Box sx={{ mb: 3 }}>
        <VehicleSearchFilter
          vehicles={vehicles}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          placeholder="Buscar vehículos por nombre, placa, marca..."
          width="100%"
          size="small"
          showAllOption={false}
          searchFields={['name', 'licensePlate', 'vehicleId', 'make', 'model', 'vin']}
        />
      </Box>

      <Grid container spacing={3}>
        {filteredVehicles.map((vehicle) => (
          <Grid item xs={12} sm={6} md={4} key={vehicle._id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    {vehicle.name}
                  </Typography>
                  <Chip
                    label={getStatusText(vehicle)}
                    color={getStatusColor(vehicle)}
                    size="small"
                  />
                </Box>

                {/* Información del Chofer */}
                <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Person sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Chofer Asignado
                    </Typography>
                  </Box>
                  {vehicle.assignedDriver ? (
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {vehicle.assignedDriver.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ID: {vehicle.assignedDriver.driverId} | Licencia: {vehicle.assignedDriver.licenseNumber}
                      </Typography>
                      {vehicle.assignedDriver.phone && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          📞 {vehicle.assignedDriver.phone}
                        </Typography>
                      )}
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Sin chofer asignado
                      </Typography>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Person />}
                        onClick={() => handleOpenDriverDialog(vehicle)}
                        sx={{ ml: 1 }}
                      >
                        Asignar
                      </Button>
                    </Box>
                  )}
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    {vehicle.make} {vehicle.model} {vehicle.year}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Placa: {vehicle.licensePlate}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Speed sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      Velocidad
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocalGasStation sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      Combustible
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Thermostat sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      Temperatura
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Battery6Bar sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      Batería
                    </Typography>
                  </Box>
                </Box>

                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Última actualización: {vehicle.lastUpdate ? new Date(vehicle.lastUpdate).toLocaleString() : 'Sin datos'}
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDriverDialog(vehicle)}
                    color="warning"
                    title="Gestionar Chofer"
                  >
                    <Person />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenHistoryDialog(vehicle)}
                    color="secondary"
                    title="Ver Historial de Rutas"
                  >
                    <History />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenGeofenceDialog(vehicle)}
                    color="info"
                    title="Configurar Geocercas"
                  >
                    <LocationOn />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(vehicle)}
                    color="primary"
                    title="Editar Vehículo"
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => vehicle._id && handleDelete(vehicle._id)}
                    color="error"
                    title="Eliminar Vehículo"
                  >
                    <Delete />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Dialog para agregar/editar vehículo */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingVehicle ? 'Editar Vehículo' : 'Agregar Nuevo Vehículo'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="ID del Vehículo"
              value={formData.vehicleId}
              onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Nombre"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Marca"
              value={formData.make}
              onChange={(e) => setFormData({ ...formData, make: e.target.value })}
              fullWidth
            />
            <TextField
              label="Modelo"
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              fullWidth
            />
            <TextField
              label="Año"
              type="number"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              fullWidth
            />
            <TextField
              label="VIN"
              value={formData.vin}
              onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
              fullWidth
            />
            <TextField
              label="Placa"
              value={formData.licensePlate}
              onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingVehicle ? 'Actualizar' : 'Agregar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para configurar geocercas */}
      {selectedVehicleForGeofence && (
        <VehicleGeofenceConfig
          vehicle={selectedVehicleForGeofence}
          open={geofenceDialogOpen}
          onClose={handleCloseGeofenceDialog}
          onSave={handleSaveGeofences}
        />
      )}

      {/* Dialog para historial de rutas */}
      {selectedVehicleForHistory && (
        <Dialog open={historyDialogOpen} onClose={handleCloseHistoryDialog} maxWidth="xl" fullWidth>
          <RouteHistory
            selectedVehicle={selectedVehicleForHistory}
            onClose={handleCloseHistoryDialog}
          />
        </Dialog>
      )}

      {/* Dialog para gestión de choferes */}
      {selectedVehicleForDriver && (
        <Dialog open={driverDialogOpen} onClose={handleCloseDriverDialog} maxWidth="lg" fullWidth>
          <DriverManagement
            vehicle={selectedVehicleForDriver}
            onClose={handleCloseDriverDialog}
            onDriverAssign={handleDriverAssign}
          />
        </Dialog>
      )}
    </Box>
  );
};

export default VehicleList;
