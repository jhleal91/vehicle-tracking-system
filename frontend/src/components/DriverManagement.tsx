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
  Divider
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
  CheckCircle,
  Cancel
} from '@mui/icons-material';
import { Driver, Vehicle } from '../types';
import { driverService } from '../services/driverService';

interface DriverManagementProps {
  vehicle?: Vehicle | null;
  onClose?: () => void;
  onDriverAssign?: (driverId: string) => void;
}

const DriverManagement: React.FC<DriverManagementProps> = ({ 
  vehicle, 
  onClose, 
  onDriverAssign 
}) => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [formData, setFormData] = useState({
    driverId: '',
    name: '',
    email: '',
    phone: '',
    licenseNumber: '',
    licenseExpiry: '',
    isActive: 'true'
  });

  const loadDrivers = useCallback(async () => {
    try {
      const driversData = await driverService.getDrivers();
      setDrivers(driversData);
    } catch (error) {
      console.error('Error cargando choferes:', error);
    }
  }, []);

  useEffect(() => {
    loadDrivers();
  }, [loadDrivers]);

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
        isActive: driver.isActive.toString()
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
        isActive: 'true'
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
        assignedVehicle: vehicle?._id
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

  const handleAssignDriver = async (driver: Driver) => {
    try {
      if (vehicle?._id) {
        if (driver.assignedVehicle === vehicle._id) {
          // Desasignar chofer
          await driverService.unassignDriverFromVehicle(driver._id!);
          if (onDriverAssign) {
            onDriverAssign('unassign'); // Pasar 'unassign' para indicar desasignación
          }
        } else {
          // Asignar chofer
          await driverService.assignDriverToVehicle(driver._id!, vehicle._id);
          if (onDriverAssign) {
            onDriverAssign(driver._id || '');
          }
        }
        loadDrivers();
        if (onClose) {
          onClose();
        }
      }
    } catch (error) {
      console.error('Error asignando/desasignando chofer:', error);
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
              {vehicle ? `Asignar chofer a: ${vehicle.name}` : 'Administrar choferes de la flota'}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Nuevo Chofer
          </Button>
          {onClose && (
            <Button variant="outlined" onClick={onClose}>
              Cerrar
            </Button>
          )}
        </Box>
      </Box>

      {/* Lista de Choferes */}
      <Grid container spacing={3}>
        {drivers.map((driver) => {
          const licenseStatus = getLicenseStatus(driver.licenseExpiry);
          const isAssigned = driver.assignedVehicle === vehicle?._id;
          const isAssignedToOther = driver.assignedVehicle && driver.assignedVehicle !== vehicle?._id;

          return (
            <Grid item xs={12} sm={6} md={4} key={driver._id}>
              <Card 
                sx={{ 
                  height: '100%',
                  border: isAssigned ? '2px solid' : '1px solid',
                  borderColor: isAssigned ? 'primary.main' : 'divider',
                  position: 'relative'
                }}
              >
                {isAssigned && (
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

                  {isAssignedToOther && (
                    <Box sx={{ mb: 2 }}>
                      <Chip
                        label="Asignado a otro vehículo"
                        color="warning"
                        size="small"
                        icon={<DirectionsCar />}
                      />
                    </Box>
                  )}

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                    {vehicle && !isAssigned && !isAssignedToOther && (
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<CheckCircle />}
                        onClick={() => handleAssignDriver(driver)}
                        fullWidth
                      >
                        Asignar
                      </Button>
                    )}
                    
                    {vehicle && isAssigned && (
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Cancel />}
                        onClick={() => handleAssignDriver(driver)}
                        fullWidth
                        color="error"
                      >
                        Desasignar
                      </Button>
                    )}

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
            <Grid item xs={12}>
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

export default DriverManagement;
