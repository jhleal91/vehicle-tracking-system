import React from 'react';
import { Card, CardContent, Box, Typography, BoxProps } from '@mui/material';

interface ModernCardProps {
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  gradient?: string;
  children: React.ReactNode;
  hover?: boolean;
  sx?: any;
}

const ModernCard: React.FC<ModernCardProps> = ({
  title,
  subtitle,
  icon,
  gradient,
  children,
  hover = true,
  sx,
}) => {
  return (
    <Card
      sx={{
        height: '100%',
        background: gradient || 'white',
        color: gradient ? 'white' : 'inherit',
        borderRadius: 3,
        border: gradient ? 'none' : '1px solid',
        borderColor: 'divider',
        boxShadow: gradient 
          ? '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
          : '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        '&:hover': hover ? {
          transform: 'translateY(-4px)',
          boxShadow: gradient
            ? '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'
            : '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        } : {},
        transition: 'all 0.2s ease-in-out',
        ...sx,
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {(title || subtitle || icon) && (
          <Box sx={{ mb: 2 }}>
            {icon && (
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  background: gradient 
                    ? 'rgba(255, 255, 255, 0.2)' 
                    : 'rgba(37, 99, 235, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                }}
              >
                {icon}
              </Box>
            )}
            {title && (
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 600, 
                  mb: subtitle ? 0.5 : 0,
                  color: gradient ? 'white' : 'text.primary',
                }}
              >
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography 
                variant="body2" 
                sx={{ 
                  opacity: gradient ? 0.9 : 0.7,
                  color: gradient ? 'white' : 'text.secondary',
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
        )}
        {children}
      </CardContent>
    </Card>
  );
};

export default ModernCard;
