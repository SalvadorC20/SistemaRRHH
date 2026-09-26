import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { Warning as WarningIcon, Home as HomeIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)'
      }}
    >
      <Paper
        elevation={8}
        sx={{
          p: 6,
          textAlign: 'center',
          borderRadius: 2,
          maxWidth: 400
        }}
      >
        <WarningIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
        
        <Typography variant="h4" component="h1" gutterBottom color="error">
          Acceso Denegado
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          No tienes permisos para acceder a esta página. 
          Contacta al administrador del sistema si necesitas acceso.
        </Typography>

        <Button
          variant="contained"
          startIcon={<HomeIcon />}
          onClick={() => navigate('/dashboard')}
          size="large"
        >
          Volver al Dashboard
        </Button>
      </Paper>
    </Box>
  );
};

export default Unauthorized;