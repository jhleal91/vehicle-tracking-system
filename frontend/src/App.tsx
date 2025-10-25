import React, { useState, useEffect } from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Box,
  Alert,
  Snackbar
} from '@mui/material';
import { io, Socket } from 'socket.io-client';
import Dashboard from './components/Dashboard';
import MapView from './components/MapView';
import VehicleList from './components/VehicleList';
import DriversView from './components/DriversView';
import RouteHistory from './components/RouteHistory';
import Alerts from './components/Alerts';
import Settings from './components/Settings';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { VehicleProvider } from './contexts/VehicleContext';
import './App.css';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1e40af', // Azul marino corporativo
      light: '#3b82f6',
      dark: '#1e3a8a',
    },
    secondary: {
      main: '#2563eb', // Azul corporativo
      light: '#60a5fa',
      dark: '#1d4ed8',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    success: {
      main: '#059669', // Verde empresarial
      light: '#10b981',
      dark: '#047857',
    },
    warning: {
      main: '#d97706', // Naranja profesional
      light: '#f59e0b',
      dark: '#b45309',
    },
    error: {
      main: '#dc2626', // Rojo corporativo
      light: '#ef4444',
      dark: '#b91c1c',
    },
    info: {
      main: '#0ea5e9', // Azul información
      light: '#38bdf8',
      dark: '#0284c7',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      fontSize: '2rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
          '&:hover': {
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
        },
        contained: {
          boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
          '&:hover': {
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #1d4ed8 100%)',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        },
      },
    },
  },
});

// Componente para renderizar el contenido según la vista seleccionada
const renderContent = (view: string, socket: Socket | null) => {
  switch (view) {
    case 'dashboard':
      return <Dashboard socket={socket} />;
    case 'map':
      return <MapView socket={socket} />;
    case 'vehicles':
      return <VehicleList />;
    case 'drivers':
      return <DriversView />;
    case 'history':
      return <RouteHistory />;
    case 'alerts':
      return <Alerts socket={socket} />;
    case 'settings':
      return <Settings />;
    default:
      return <Dashboard socket={socket} />;
  }
};

const MainApp: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  useEffect(() => {
    if (isAuthenticated) {
      // Conectar WebSocket
      const newSocket = io('ws://localhost:8080');
      setSocket(newSocket);

      newSocket.on('connect', () => {
        console.log('🔌 Conectado al WebSocket');
      });

      newSocket.on('vehicle_update', (data) => {
        console.log('📡 Actualización de vehículo:', data);
        setNotification({
          open: true,
          message: `Vehículo actualizado: ${data.vehicleId}`,
          severity: 'info'
        });
      });

      newSocket.on('alert', (data) => {
        console.log('🚨 Nueva alerta:', data);
        setNotification({
          open: true,
          message: `Nueva alerta: ${data.message}`,
          severity: 'warning'
        });
      });

      return () => {
        newSocket.close();
      };
    }
  }, [isAuthenticated]);

  const handleViewChange = (view: string) => {
    setCurrentView(view);
  };

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSidebarCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh' }}>
        {/* Sidebar */}
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          currentView={currentView}
          onViewChange={handleViewChange}
          collapsed={sidebarCollapsed}
          onToggleCollapse={handleSidebarCollapse}
        />

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            ml: { md: sidebarCollapsed ? '64px' : '280px' }, // Dynamic offset for desktop sidebar
            height: '100vh',
            overflow: 'hidden',
            transition: 'margin-left 0.3s ease-in-out',
          }}
        >
          {/* Top Bar (Mobile only) */}
          <TopBar
            onMenuClick={handleSidebarToggle}
            currentView={currentView}
          />

          {/* Content Area */}
          <Box
            sx={{
              flexGrow: 1,
              overflow: 'auto',
              p: { xs: 2, md: 3 },
              pt: { xs: 8, md: 3 }, // Top padding for mobile top bar
              background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
            }}
          >
            {renderContent(currentView, socket)}
          </Box>
        </Box>

        {/* Notifications */}
        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert
            onClose={handleCloseNotification}
            severity={notification.severity}
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <VehicleProvider>
        <MainApp />
      </VehicleProvider>
    </AuthProvider>
  );
};

export default App;