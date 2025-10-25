import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications,
  AccountCircle,
} from '@mui/icons-material';

interface TopBarProps {
  onMenuClick: () => void;
  currentView: string;
}

const TopBar: React.FC<TopBarProps> = ({ onMenuClick, currentView }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const getViewTitle = (view: string) => {
    switch (view) {
      case 'dashboard':
        return 'Centro de Control';
      case 'map':
        return 'Mapa de Flota';
      case 'vehicles':
        return 'Gestión de Vehículos';
      case 'alerts':
        return 'Alertas del Sistema';
      case 'settings':
        return 'Configuración';
      default:
        return 'FleetTrack Pro';
    }
  };

  if (!isMobile) {
    return null; // No mostrar TopBar en desktop
  }

  return (
    <AppBar
      position="fixed"
      sx={{
        background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        zIndex: theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={onMenuClick}
          edge="start"
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600 }}>
            {getViewTitle(currentView)}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton color="inherit" size="small">
            <Notifications />
          </IconButton>
          <IconButton color="inherit" size="small">
            <AccountCircle />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
