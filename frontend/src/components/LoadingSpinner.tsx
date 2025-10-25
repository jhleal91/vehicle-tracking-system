import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

interface LoadingSpinnerProps {
  message?: string;
  size?: number;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Cargando...', 
  size = 40 
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 200,
        gap: 2,
      }}
    >
      <Box
        sx={{
          position: 'relative',
          display: 'inline-flex',
        }}
      >
        <CircularProgress
          size={size}
          thickness={4}
          sx={{
            color: 'primary.main',
            '& .MuiCircularProgress-circle': {
              strokeLinecap: 'round',
            },
          }}
        />
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography
            variant="caption"
            component="div"
            color="primary.main"
            sx={{ fontWeight: 600 }}
          >
            {Math.round((size * 0.3) / 2)}
          </Typography>
        </Box>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
        {message}
      </Typography>
    </Box>
  );
};

export default LoadingSpinner;
