import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  GridLegacy as Grid,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Alert,
  Slider,
  Chip
} from '@mui/material';
import {
  Save,
  Notifications,
  Speed,
  LocationOn,
  Security,
  AccountCircle
} from '@mui/icons-material';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      sms: false
    },
    alerts: {
      speedExceeded: true,
      engineOnWithoutMovement: true,
      geofenceExit: false,
      lowFuel: true,
      maintenanceDue: true
    },
    speedLimit: 100,
    geofence: {
      enabled: false,
      radius: 1000
    },
    privacy: {
      shareLocation: false,
      shareData: false
    }
  });

  const [user, setUser] = useState({
    name: 'Usuario Demo',
    email: 'demo@example.com',
    subscription: 'basic'
  });

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // Simular carga de configuraciones
      // En una app real, esto vendría de la API
    } catch (error) {
      console.error('Error cargando configuraciones:', error);
    }
  };

  const handleSave = async () => {
    try {
      // Simular guardado de configuraciones
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error guardando configuraciones:', error);
    }
  };

  const handleSettingChange = (category: string, setting: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...(prev[category as keyof typeof prev] as any),
        [setting]: value
      }
    }));
  };

  const getSubscriptionColor = (subscription: string) => {
    switch (subscription) {
      case 'basic':
        return 'default';
      case 'premium':
        return 'primary';
      case 'enterprise':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Configuración
      </Typography>

      {saved && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Configuraciones guardadas exitosamente
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Perfil de Usuario */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccountCircle sx={{ mr: 1 }} />
                <Typography variant="h6">Perfil de Usuario</Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <TextField
                  label="Nombre"
                  value={user.name}
                  onChange={(e) => setUser({ ...user, name: e.target.value })}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Email"
                  value={user.email}
                  onChange={(e) => setUser({ ...user, email: e.target.value })}
                  fullWidth
                  margin="normal"
                />
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Plan de Suscripción
                  </Typography>
                  <Chip
                    label={user.subscription.toUpperCase()}
                    color={getSubscriptionColor(user.subscription)}
                    size="small"
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Notificaciones */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Notifications sx={{ mr: 1 }} />
                <Typography variant="h6">Notificaciones</Typography>
              </Box>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications.email}
                    onChange={(e) => handleSettingChange('notifications', 'email', e.target.checked)}
                  />
                }
                label="Notificaciones por Email"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications.push}
                    onChange={(e) => handleSettingChange('notifications', 'push', e.target.checked)}
                  />
                }
                label="Notificaciones Push"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications.sms}
                    onChange={(e) => handleSettingChange('notifications', 'sms', e.target.checked)}
                  />
                }
                label="Notificaciones SMS"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Alertas */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Security sx={{ mr: 1 }} />
                <Typography variant="h6">Alertas</Typography>
              </Box>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.alerts.speedExceeded}
                    onChange={(e) => handleSettingChange('alerts', 'speedExceeded', e.target.checked)}
                  />
                }
                label="Velocidad Excedida"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.alerts.engineOnWithoutMovement}
                    onChange={(e) => handleSettingChange('alerts', 'engineOnWithoutMovement', e.target.checked)}
                  />
                }
                label="Motor Sin Movimiento"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.alerts.geofenceExit}
                    onChange={(e) => handleSettingChange('alerts', 'geofenceExit', e.target.checked)}
                  />
                }
                label="Salida de Geocerca"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.alerts.lowFuel}
                    onChange={(e) => handleSettingChange('alerts', 'lowFuel', e.target.checked)}
                  />
                }
                label="Combustible Bajo"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.alerts.maintenanceDue}
                    onChange={(e) => handleSettingChange('alerts', 'maintenanceDue', e.target.checked)}
                  />
                }
                label="Mantenimiento Pendiente"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Configuración de Velocidad */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Speed sx={{ mr: 1 }} />
                <Typography variant="h6">Límite de Velocidad</Typography>
              </Box>
              
              <Typography gutterBottom>
                Límite de velocidad: {settings.speedLimit} km/h
              </Typography>
              <Slider
                value={settings.speedLimit}
                onChange={(e, value) => setSettings(prev => ({ ...prev, speedLimit: value as number }))}
                min={30}
                max={200}
                step={10}
                marks={[
                  { value: 30, label: '30' },
                  { value: 60, label: '60' },
                  { value: 100, label: '100' },
                  { value: 150, label: '150' },
                  { value: 200, label: '200' }
                ]}
                valueLabelDisplay="auto"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Geocerca */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocationOn sx={{ mr: 1 }} />
                <Typography variant="h6">Geocerca</Typography>
              </Box>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.geofence.enabled}
                    onChange={(e) => handleSettingChange('geofence', 'enabled', e.target.checked)}
                  />
                }
                label="Activar Geocerca"
              />
              
              {settings.geofence.enabled && (
                <Box sx={{ mt: 2 }}>
                  <Typography gutterBottom>
                    Radio: {settings.geofence.radius} metros
                  </Typography>
                  <Slider
                    value={settings.geofence.radius}
                    onChange={(e, value) => setSettings(prev => ({ 
                      ...prev, 
                      geofence: { ...prev.geofence, radius: value as number }
                    }))}
                    min={100}
                    max={5000}
                    step={100}
                    marks={[
                      { value: 100, label: '100m' },
                      { value: 1000, label: '1km' },
                      { value: 5000, label: '5km' }
                    ]}
                    valueLabelDisplay="auto"
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Privacidad */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Security sx={{ mr: 1 }} />
                <Typography variant="h6">Privacidad</Typography>
              </Box>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.privacy.shareLocation}
                    onChange={(e) => handleSettingChange('privacy', 'shareLocation', e.target.checked)}
                  />
                }
                label="Compartir Ubicación"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.privacy.shareData}
                    onChange={(e) => handleSettingChange('privacy', 'shareData', e.target.checked)}
                  />
                }
                label="Compartir Datos de Uso"
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={<Save />}
          onClick={handleSave}
          size="large"
        >
          Guardar Configuraciones
        </Button>
      </Box>
    </Box>
  );
};

export default Settings;
