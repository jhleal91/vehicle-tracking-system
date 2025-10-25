import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Divider,
  useTheme,
  useMediaQuery,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Dashboard,
  Map,
  DirectionsCar,
  Notifications,
  Settings,
  Logout,
  Close as CloseIcon,
  ChevronLeft,
  ChevronRight,
  History,
  Person,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  currentView: string;
  onViewChange: (view: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  open, 
  onClose, 
  currentView, 
  onViewChange, 
  collapsed, 
  onToggleCollapse 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { logout } = useAuth();

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Centro de Control',
      icon: <Dashboard />,
      description: 'Métricas y estadísticas'
    },
    {
      id: 'map',
      label: 'Mapa',
      icon: <Map />,
      description: 'Ubicación en tiempo real'
    },
    {
      id: 'vehicles',
      label: 'Vehículos',
      icon: <DirectionsCar />,
      description: 'Gestión de flota'
    },
    {
      id: 'drivers',
      label: 'Choferes',
      icon: <Person />,
      description: 'Gestión de conductores'
    },
    {
      id: 'history',
      label: 'Historial',
      icon: <History />,
      description: 'Rutas y desplazamientos'
    },
    {
      id: 'alerts',
      label: 'Alertas',
      icon: <Notifications />,
      description: 'Notificaciones del sistema'
    },
    {
      id: 'settings',
      label: 'Configuración',
      icon: <Settings />,
      description: 'Ajustes del sistema'
    },
  ];

  const handleLogout = () => {
    logout();
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box
        sx={{
          p: collapsed ? 1.5 : 2,
          background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          minHeight: collapsed ? 64 : 'auto',
        }}
      >
        {!collapsed && (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
              FleetTrack Pro
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              Monitoreo Inteligente
            </Typography>
          </Box>
        )}
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {!isMobile && (
            <Tooltip title={collapsed ? "Expandir sidebar" : "Colapsar sidebar"}>
              <IconButton 
                onClick={onToggleCollapse} 
                sx={{ 
                  color: 'white',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                {collapsed ? <ChevronRight /> : <ChevronLeft />}
              </IconButton>
            </Tooltip>
          )}
          
          {isMobile && (
            <IconButton onClick={onClose} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          )}
        </Box>
      </Box>

      <Divider />

      {/* Navigation Menu */}
      <List sx={{ flexGrow: 1, pt: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.id} disablePadding>
            <Tooltip 
              title={collapsed ? item.label : item.description} 
              placement="right"
              disableHoverListener={!collapsed}
            >
              <ListItemButton
                onClick={() => {
                  onViewChange(item.id);
                  if (isMobile) onClose();
                }}
                selected={currentView === item.id}
                sx={{
                  mx: collapsed ? 0.5 : 1,
                  mb: 0.5,
                  borderRadius: 2,
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  minHeight: 48,
                  '&.Mui-selected': {
                    background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
                    color: 'white',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'white',
                    },
                  },
                  '&:hover': {
                    background: 'rgba(30, 64, 175, 0.08)',
                    transform: collapsed ? 'scale(1.05)' : 'translateX(4px)',
                    transition: 'all 0.2s ease-in-out',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: collapsed ? 'auto' : 40,
                    color: currentView === item.id ? 'white' : 'primary.main',
                    justifyContent: 'center',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {!collapsed && (
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: '0.9rem',
                      fontWeight: currentView === item.id ? 600 : 400,
                    }}
                  />
                )}
              </ListItemButton>
            </Tooltip>
          </ListItem>
        ))}
      </List>

      <Divider />

      {/* Logout Button */}
      <List>
        <ListItem disablePadding>
          <Tooltip 
            title={collapsed ? "Cerrar Sesión" : ""} 
            placement="right"
            disableHoverListener={!collapsed}
          >
            <ListItemButton
              onClick={handleLogout}
              sx={{
                mx: collapsed ? 0.5 : 1,
                mb: 1,
                borderRadius: 2,
                color: 'error.main',
                justifyContent: collapsed ? 'center' : 'flex-start',
                minHeight: 48,
                '&:hover': {
                  background: 'rgba(220, 38, 38, 0.08)',
                  transform: collapsed ? 'scale(1.05)' : 'translateX(4px)',
                  transition: 'all 0.2s ease-in-out',
                },
              }}
            >
              <ListItemIcon 
                sx={{ 
                  minWidth: collapsed ? 'auto' : 40, 
                  color: 'error.main',
                  justifyContent: 'center',
                }}
              >
                <Logout />
              </ListItemIcon>
              {!collapsed && (
                <ListItemText
                  primary="Cerrar Sesión"
                  primaryTypographyProps={{
                    fontSize: '0.9rem',
                    fontWeight: 500,
                  }}
                />
              )}
            </ListItemButton>
          </Tooltip>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            width: collapsed ? 64 : 280,
            boxSizing: 'border-box',
            borderRight: '1px solid rgba(0, 0, 0, 0.12)',
            background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
            transition: 'width 0.3s ease-in-out',
            overflowX: 'hidden',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Mobile Sidebar */}
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: 280,
            boxSizing: 'border-box',
            background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default Sidebar;
