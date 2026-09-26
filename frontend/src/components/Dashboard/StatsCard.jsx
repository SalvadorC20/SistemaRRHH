import React from 'react';
import { Card, CardContent, Typography, Box, Tooltip } from '@mui/material';

const StatsCard = ({ title, value, icon, color, description, onClick }) => {
  // Asegurarse de que el valor sea siempre válido
  const displayValue = value !== null && value !== undefined ? value : '0';
  
  return (
    <Tooltip title={description || title} arrow>
      <Card
        onClick={onClick}
        sx={{ 
          height: '100%',
          transition: 'all 0.3s ease',
          cursor: onClick ? 'pointer' : 'default',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: onClick ? 6 : 4,
          }
        }}
      >
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box flex={1}>
              <Typography color="textSecondary" gutterBottom variant="body2" noWrap>
                {title}
              </Typography>
              <Typography variant="h4" component="div" fontWeight="600">
                {displayValue}
              </Typography>
              {description && (
                <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                  {description}
                </Typography>
              )}
            </Box>
            <Box
              sx={{
                color: color,
                backgroundColor: `${color}15`,
                borderRadius: '12px',
                p: 1.5,
                ml: 1
              }}
            >
              {React.cloneElement(icon, { 
                fontSize: 'medium',
                sx: { fontSize: '28px' }
              })}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Tooltip>
  );
};

export default StatsCard;