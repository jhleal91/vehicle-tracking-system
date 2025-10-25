import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  GridLegacy as Grid,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Divider,
  Paper
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Person,
  Phone,
  Email,
  Badge,
  CalendarToday,
  DirectionsCar,
  Search
} from '@mui/icons-material';
import { Driver, Vehicle } from '../types';
import { vehicleService } from '../services/vehicleService';
import { driverService } from '../services/driverService';

const DriversView: React.FC = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredDrivers, setFilteredDrivers] = useState<Driver[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [formData, setFormData] = useState({
    driverId: '',
    name: '',
    email: '',
    phone: '',
    licenseNumber: '',
    licenseExpiry: '',
    isActive: 'true',
    assignedVehicle: ''
  });

  const loadDrivers = useCallback(async () => {
    try {
      const driversData = await driverService.getDrivers();
      setDrivers(driversData);
    } catch (error) {
      console.error('Error cargando choferes:', error);
    }
  }, []);

  const loadVehicles = useCallback(async () => {
    try {
      const vehiclesData = await vehicleService.getVehicles();
      setVehicles(vehiclesData);
    } catch (error) {
      console.error('Error cargando vehículos:', error);
    }
  }, []);

  useEffect(() => {
    loadDrivers();
    loadVehicles();
  }, [loadDrivers, loadVehicles]);

  // Filtrar choferes basado en la búsqueda
  useEffect(() => {
    const filtered = drivers.filter(driver => 
      driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.driverId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.licenseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (driver.email && driver.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredDrivers(filtered);
  }, [drivers, searchQuery]);

  const handleOpenDialog = (driver?: Driver) => {
    if (driver) {
      setEditingDriver(driver);
      setFormData({
        driverId: driver.driverId,
        name: driver.name,
        email: driver.email || '',
        phone: driver.phone || '',
        licenseNumber: driver.licenseNumber,
        licenseExpiry: driver.licenseExpiry.toISOString().split('T')[0],
        isActive: driver.isActive.toString(),
        assignedVehicle: driver.assignedVehicle || ''
      });
    } else {
      setEditingDriver(null);
      setFormData({
        driverId: '',
        name: '',
        email: '',
        phone: '',
        licenseNumber: '',
        licenseExpiry: '',
        isActive: 'true',
        assignedVehicle: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingDriver(null);
  };

  const handleSave = async () => {
    try {
      const driverData = {
        driverId: formData.driverId,
        name: formData.name,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        licenseNumber: formData.licenseNumber,
        licenseExpiry: new Date(formData.licenseExpiry),
        isActive: formData.isActive === 'true',
        assignedVehicle: formData.assignedVehicle || undefined
      };

      if (editingDriver) {
        // Actualizar chofer existente
        await driverService.updateDriver(editingDriver._id!, driverData);
      } else {
        // Crear nuevo chofer
        await driverService.createDriver(driverData);
      }

      loadDrivers();
      handleCloseDialog();
    } catch (error) {
      console.error('Error guardando chofer:', error);
    }
  };

  const handleDelete = async (driverId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este chofer?')) {
      try {
        await driverService.deleteDriver(driverId);
        loadDrivers();
      } catch (error) {
        console.error('Error eliminando chofer:', error);
      }
    }
  };

  const getInitials = (name: string): string => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const isLicenseExpired = (expiryDate: Date): boolean => {
    return new Date() > expiryDate;
  };

  const isLicenseExpiringSoon = (expiryDate: Date): boolean => {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return expiryDate <= thirtyDaysFromNow && expiryDate > new Date();
  };

  const getLicenseStatus = (expiryDate: Date) => {
    if (isLicenseExpired(expiryDate)) {
      return { status: 'expired', color: 'error', text: 'Vencida' };
    } else if (isLicenseExpiringSoon(expiryDate)) {
      return { status: 'expiring', color: 'warning', text: 'Por vencer' };
    } else {
      return { status: 'valid', color: 'success', text: 'Válida' };
    }
  };

  const getAssignedVehicle = (vehicleId?: string) => {
    if (!vehicleId) return null;
    return vehicles.find(v => v._id === vehicleId);
  };

  // Obtener vehículos disponibles (no asignados a otros choferes)
  const getAvailableVehicles = () => {
    const assignedVehicleIds = drivers
      .filter(driver => driver.assignedVehicle && driver._id !== editingDriver?._id)
      .map(driver => driver.assignedVehicle);
    
    return vehicles.filter(vehicle => !assignedVehicleIds.includes(vehicle._id));
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Person color="primary" sx={{ fontSize: 32 }} />
          <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
              Gestión de Choferes
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Administrar conductores y asignaciones de vehículos
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Nuevo Chofer
        </Button>
      </Box>

      {/* Filtro de búsqueda */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Search sx={{ color: 'text.secondary' }} />
          <TextField
            fullWidth
            placeholder="Buscar choferes por nombre, ID, licencia o email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            variant="outlined"
            size="small"
          />
        </Box>
      </Paper>

      {/* Estadísticas rápidas */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>
                {drivers.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Choferes
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main" sx={{ fontWeight: 700 }}>
                {drivers.filter(d => d.isActive).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Activos
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main" sx={{ fontWeight: 700 }}>
                {drivers.filter(d => d.assignedVehicle).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Asignados
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main" sx={{ fontWeight: 700 }}>
                {drivers.filter(d => isLicenseExpiringSoon(d.licenseExpiry)).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Licencias por Vencer
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Lista de Choferes */}
      <Grid container spacing={3}>
        {filteredDrivers.map((driver) => {
          const licenseStatus = getLicenseStatus(driver.licenseExpiry);
          const assignedVehicle = getAssignedVehicle(driver.assignedVehicle);

          return (
            <Grid item xs={12} sm={6} md={4} key={driver._id}>
              <Card 
                sx={{ 
                  height: '100%',
                  border: assignedVehicle ? '2px solid' : '1px solid',
                  borderColor: assignedVehicle ? 'primary.main' : 'divider',
                  position: 'relative'
                }}
              >
                {assignedVehicle && (
                  <Chip
                    label="Asignado"
                    color="primary"
                    size="small"
                    sx={{ position: 'absolute', top: 8, right: 8 }}
                  />
                )}
                
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      {getInitials(driver.name)}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {driver.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ID: {driver.driverId}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Email sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
                      <Typography variant="body2">
                        {driver.email || 'Sin email'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Phone sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
                      <Typography variant="body2">
                        {driver.phone || 'Sin teléfono'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Badge sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
                      <Typography variant="body2">
                        Licencia: {driver.licenseNumber}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CalendarToday sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
                      <Typography variant="body2">
                        Vence: {driver.licenseExpiry.toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Chip
                      label={licenseStatus.text}
                      color={licenseStatus.color as any}
                      size="small"
                    />
                    <Chip
                      label={driver.isActive ? 'Activo' : 'Inactivo'}
                      color={driver.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>

                  {assignedVehicle && (
                    <Box sx={{ mb: 2, p: 1.5, bgcolor: 'primary.50', borderRadius: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <DirectionsCar sx={{ fontSize: 16, color: 'primary.main' }} />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {assignedVehicle.name}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {assignedVehicle.licensePlate}
                      </Typography>
                    </Box>
                  )}

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(driver)}
                      color="primary"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => driver._id && handleDelete(driver._id)}
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Dialog para crear/editar chofer */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingDriver ? 'Editar Chofer' : 'Nuevo Chofer'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="ID del Chofer"
                value={formData.driverId}
                onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nombre Completo"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Teléfono"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Número de Licencia"
                value={formData.licenseNumber}
                onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Fecha de Vencimiento"
                type="date"
                value={formData.licenseExpiry}
                onChange={(e) => setFormData({ ...formData, licenseExpiry: e.target.value })}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.value })}
                  label="Estado"
                >
                  <MenuItem value="true">Activo</MenuItem>
                  <MenuItem value="false">Inactivo</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Vehículo Asignado</InputLabel>
                <Select
                  value={formData.assignedVehicle}
                  onChange={(e) => setFormData({ ...formData, assignedVehicle: e.target.value })}
                  label="Vehículo Asignado"
                >
                  <MenuItem value="">
                    <em>Sin asignar</em>
                  </MenuItem>
                  {getAvailableVehicles().map((vehicle) => (
                    <MenuItem key={vehicle._id} value={vehicle._id}>
                      {vehicle.name} - {vehicle.licensePlate}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            Cancelar
          </Button>
          <Button onClick={handleSave} variant="contained">
            {editingDriver ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DriversView;
