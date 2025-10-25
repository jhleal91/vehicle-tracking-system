import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Slider,
  TextField,
  GridLegacy as Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  LocationOn,
  Edit,
  Delete,
  Add,
  Save,
  Cancel
} from '@mui/icons-material';
import { Vehicle } from '../types';

interface Geofence {
  id: string;
  name: string;
  center: {
    lat: number;
    lng: number;
  };
  radius: number;
  enabled: boolean;
  type: 'inclusion' | 'exclusion'; // inclusion = debe estar dentro, exclusion = no debe estar dentro
}

interface VehicleGeofenceConfigProps {
  vehicle: Vehicle;
  open: boolean;
  onClose: () => void;
  onSave: (geofences: Geofence[]) => void;
}

const VehicleGeofenceConfig: React.FC<VehicleGeofenceConfigProps> = ({
  vehicle,
  open,
  onClose,
  onSave
}) => {
  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const [editingGeofence, setEditingGeofence] = useState<Geofence | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (open && vehicle) {
      loadVehicleGeofences();
    }
  }, [open, vehicle]);

  const loadVehicleGeofences = async () => {
    try {
      // Por ahora usamos datos mock, pero aquí se haría la llamada al backend
      const mockGeofences: Geofence[] = [
        {
          id: '1',
          name: 'Oficina Principal',
          center: { lat: 19.4326, lng: -99.1332 },
          radius: 500,
          enabled: true,
          type: 'inclusion'
        },
        {
          id: '2',
          name: 'Zona Restringida',
          center: { lat: 19.4426, lng: -99.1432 },
          radius: 200,
          enabled: true,
          type: 'exclusion'
        }
      ];
      setGeofences(mockGeofences);
    } catch (error) {
      console.error('Error cargando geocercas:', error);
    }
  };

  const handleAddGeofence = () => {
    const newGeofence: Geofence = {
      id: Date.now().toString(),
      name: 'Nueva Geocerca',
      center: { lat: 19.4326, lng: -99.1332 },
      radius: 1000,
      enabled: true,
      type: 'inclusion'
    };
    setEditingGeofence(newGeofence);
    setIsEditing(true);
  };

  const handleEditGeofence = (geofence: Geofence) => {
    setEditingGeofence({ ...geofence });
    setIsEditing(true);
  };

  const handleDeleteGeofence = (geofenceId: string) => {
    setGeofences(prev => prev.filter(g => g.id !== geofenceId));
  };

  const handleSaveGeofence = () => {
    if (editingGeofence) {
      if (geofences.find(g => g.id === editingGeofence.id)) {
        // Actualizar existente
        setGeofences(prev => prev.map(g => 
          g.id === editingGeofence.id ? editingGeofence : g
        ));
      } else {
        // Agregar nuevo
        setGeofences(prev => [...prev, editingGeofence]);
      }
      setEditingGeofence(null);
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingGeofence(null);
    setIsEditing(false);
  };

  const handleSaveAll = () => {
    onSave(geofences);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocationOn color="primary" />
          <Typography variant="h6">
            Geocercas - {vehicle.name}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Las geocercas te permiten definir zonas específicas para cada vehículo. 
            Puedes crear zonas de inclusión (el vehículo debe estar dentro) o exclusión (el vehículo no debe estar dentro).
          </Typography>
        </Box>

        {/* Lista de geocercas existentes */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Geocercas Configuradas</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAddGeofence}
              size="small"
            >
              Agregar Geocerca
            </Button>
          </Box>

          <Grid container spacing={2}>
            {geofences.map((geofence) => (
              <Grid item xs={12} sm={6} key={geofence.id}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6">{geofence.name}</Typography>
                      <Box>
                        <Tooltip title="Editar">
                          <IconButton size="small" onClick={() => handleEditGeofence(geofence)}>
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <IconButton size="small" onClick={() => handleDeleteGeofence(geofence.id)}>
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Chip
                        label={geofence.type === 'inclusion' ? 'Inclusión' : 'Exclusión'}
                        color={geofence.type === 'inclusion' ? 'success' : 'error'}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <Chip
                        label={geofence.enabled ? 'Activa' : 'Inactiva'}
                        color={geofence.enabled ? 'primary' : 'default'}
                        size="small"
                      />
                    </Box>

                    <Typography variant="body2" color="text.secondary">
                      <strong>Centro:</strong> {geofence.center.lat.toFixed(4)}, {geofence.center.lng.toFixed(4)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Radio:</strong> {geofence.radius} metros
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {geofences.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <LocationOn sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No hay geocercas configuradas
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Agrega una geocerca para comenzar a monitorear zonas específicas
              </Typography>
            </Box>
          )}
        </Box>

        {/* Formulario de edición */}
        {isEditing && editingGeofence && (
          <Card sx={{ mt: 2, border: 2, borderColor: 'primary.main' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {geofences.find(g => g.id === editingGeofence.id) ? 'Editar' : 'Nueva'} Geocerca
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nombre de la geocerca"
                    value={editingGeofence.name}
                    onChange={(e) => setEditingGeofence(prev => 
                      prev ? { ...prev, name: e.target.value } : null
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={editingGeofence.enabled}
                        onChange={(e) => setEditingGeofence(prev => 
                          prev ? { ...prev, enabled: e.target.checked } : null
                        )}
                      />
                    }
                    label="Geocerca activa"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Latitud"
                    type="number"
                    value={editingGeofence.center.lat}
                    onChange={(e) => setEditingGeofence(prev => 
                      prev ? { 
                        ...prev, 
                        center: { ...prev.center, lat: parseFloat(e.target.value) || 0 }
                      } : null
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Longitud"
                    type="number"
                    value={editingGeofence.center.lng}
                    onChange={(e) => setEditingGeofence(prev => 
                      prev ? { 
                        ...prev, 
                        center: { ...prev.center, lng: parseFloat(e.target.value) || 0 }
                      } : null
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography gutterBottom>
                    Radio: {editingGeofence.radius} metros
                  </Typography>
                  <Slider
                    value={editingGeofence.radius}
                    onChange={(e, value) => setEditingGeofence(prev => 
                      prev ? { ...prev, radius: value as number } : null
                    )}
                    min={50}
                    max={5000}
                    step={50}
                    marks={[
                      { value: 50, label: '50m' },
                      { value: 500, label: '500m' },
                      { value: 1000, label: '1km' },
                      { value: 5000, label: '5km' }
                    ]}
                    valueLabelDisplay="auto"
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      startIcon={<Save />}
                      onClick={handleSaveGeofence}
                    >
                      Guardar
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Cancel />}
                      onClick={handleCancelEdit}
                    >
                      Cancelar
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="contained" onClick={handleSaveAll}>
          Guardar Configuración
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VehicleGeofenceConfig;
