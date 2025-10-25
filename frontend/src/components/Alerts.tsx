import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert as MuiAlert,
  AlertTitle
} from '@mui/material';
import {
  Warning,
  Error,
  Info,
  CheckCircle,
  Refresh,
  MarkAsUnread,
  Done
} from '@mui/icons-material';
import { Socket } from 'socket.io-client';

interface Alert {
  _id: string;
  vehicleId: string;
  type: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  data: any;
  timestamp: Date;
  isRead: boolean;
  isResolved: boolean;
}

interface AlertsProps {
  socket: Socket | null;
}

const Alerts: React.FC<AlertsProps> = ({ socket }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'critical'>('all');

  useEffect(() => {
    loadAlerts();
    
    if (socket) {
      socket.on('alert', handleNewAlert);
    }

    return () => {
      if (socket) {
        socket.off('alert', handleNewAlert);
      }
    };
  }, [socket]);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      // Simular datos de alertas para demo
      const mockAlerts: Alert[] = [
        {
          _id: '1',
          vehicleId: 'VEH001',
          type: 'speed_exceeded',
          message: 'Velocidad excedida: 120 km/h (límite: 100 km/h)',
          severity: 'high',
          data: { speed: 120, limit: 100 },
          timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutos atrás
          isRead: false,
          isResolved: false
        },
        {
          _id: '2',
          vehicleId: 'VEH002',
          type: 'low_fuel',
          message: 'Combustible bajo: 15%',
          severity: 'medium',
          data: { fuelLevel: 15 },
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutos atrás
          isRead: true,
          isResolved: false
        },
        {
          _id: '3',
          vehicleId: 'VEH001',
          type: 'engine_on_no_movement',
          message: 'Motor encendido sin movimiento por más de 10 minutos',
          severity: 'low',
          data: { duration: 10 },
          timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hora atrás
          isRead: true,
          isResolved: true
        }
      ];
      setAlerts(mockAlerts);
    } catch (error) {
      console.error('Error cargando alertas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewAlert = (alert: Alert) => {
    setAlerts(prev => [alert, ...prev]);
  };

  const handleMarkAsRead = async (alertId: string) => {
    try {
      // Aquí harías la llamada a la API para marcar como leída
      setAlerts(prev => prev.map(alert => 
        alert._id === alertId ? { ...alert, isRead: true } : alert
      ));
    } catch (error) {
      console.error('Error marcando alerta como leída:', error);
    }
  };

  const handleMarkAsUnread = async (alertId: string) => {
    try {
      setAlerts(prev => prev.map(alert => 
        alert._id === alertId ? { ...alert, isRead: false } : alert
      ));
    } catch (error) {
      console.error('Error marcando alerta como no leída:', error);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Error color="error" />;
      case 'high':
        return <Warning color="warning" />;
      case 'medium':
        return <Info color="info" />;
      case 'low':
        return <CheckCircle color="success" />;
      default:
        return <Info />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'speed_exceeded':
        return 'Velocidad Excedida';
      case 'low_fuel':
        return 'Combustible Bajo';
      case 'engine_on_no_movement':
        return 'Motor Sin Movimiento';
      case 'geofence_exit':
        return 'Salida de Geocerca';
      case 'maintenance_due':
        return 'Mantenimiento';
      default:
        return type;
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    switch (filter) {
      case 'unread':
        return !alert.isRead;
      case 'critical':
        return alert.severity === 'critical' || alert.severity === 'high';
      default:
        return true;
    }
  });

  const unreadCount = alerts.filter(alert => !alert.isRead).length;
  const criticalCount = alerts.filter(alert => 
    alert.severity === 'critical' || alert.severity === 'high'
  ).length;

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">Cargando alertas...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          Alertas ({alerts.length})
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip
            label={`No leídas: ${unreadCount}`}
            color="warning"
            size="small"
          />
          <Chip
            label={`Críticas: ${criticalCount}`}
            color="error"
            size="small"
          />
          <IconButton onClick={loadAlerts} color="primary">
            <Refresh />
          </IconButton>
        </Box>
      </Box>

      {/* Filtros */}
      <Box sx={{ mb: 3, display: 'flex', gap: 1 }}>
        <Chip
          label="Todas"
          color={filter === 'all' ? 'primary' : 'default'}
          onClick={() => setFilter('all')}
        />
        <Chip
          label="No leídas"
          color={filter === 'unread' ? 'primary' : 'default'}
          onClick={() => setFilter('unread')}
        />
        <Chip
          label="Críticas"
          color={filter === 'critical' ? 'primary' : 'default'}
          onClick={() => setFilter('critical')}
        />
      </Box>

      {/* Lista de alertas */}
      <Paper>
        <List>
          {filteredAlerts.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="textSecondary">
                No hay alertas para mostrar
              </Typography>
            </Box>
          ) : (
            filteredAlerts.map((alert, index) => (
              <React.Fragment key={alert._id}>
                <ListItem>
                  <ListItemIcon>
                    {getSeverityIcon(alert.severity)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1">
                          {getTypeText(alert.type)}
                        </Typography>
                        <Chip
                          label={alert.severity}
                          color={getSeverityColor(alert.severity)}
                          size="small"
                        />
                        {!alert.isRead && (
                          <Chip
                            label="Nueva"
                            color="primary"
                            size="small"
                          />
                        )}
                        {alert.isResolved && (
                          <Chip
                            label="Resuelta"
                            color="success"
                            size="small"
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          {alert.message}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Vehículo: {alert.vehicleId} • {alert.timestamp.toLocaleString()}
                        </Typography>
                      </Box>
                    }
                  />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {alert.isRead ? (
                      <IconButton
                        size="small"
                        onClick={() => handleMarkAsUnread(alert._id)}
                        title="Marcar como no leída"
                      >
                        <MarkAsUnread />
                      </IconButton>
                    ) : (
                      <IconButton
                        size="small"
                        onClick={() => handleMarkAsRead(alert._id)}
                        title="Marcar como leída"
                      >
                        <Done />
                      </IconButton>
                    )}
                  </Box>
                </ListItem>
                {index < filteredAlerts.length - 1 && <Divider />}
              </React.Fragment>
            ))
          )}
        </List>
      </Paper>

      {/* Resumen de alertas críticas */}
      {criticalCount > 0 && (
        <Box sx={{ mt: 3 }}>
          <MuiAlert severity="error">
            <AlertTitle>Alertas Críticas</AlertTitle>
            Tienes {criticalCount} alerta(s) crítica(s) que requieren atención inmediata.
          </MuiAlert>
        </Box>
      )}
    </Box>
  );
};

export default Alerts;
