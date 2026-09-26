import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import {
  RocketLaunch,
  RestartAlt,
  ExitToApp,
  CheckCircle,
  Info
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';

const ROLE_DISPLAY_NAMES = {
  ADMIN_RRHH: 'Administrador de RRHH',
  DIRECTIVO: 'Directivo',
  DOCENTE: 'Docente / Profesor',
  PERSONAL_APOYO: 'Personal de Apoyo'
};

const DemoBanner = () => {
  const { isDemo, user, logout, resetDemoData } = useAuth();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [resetting, setResetting] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  if (!isDemo) return null;

  const roleName = user?.rol ? (ROLE_DISPLAY_NAMES[user.rol] || user.rol) : 'Reclutador';

  const handleManualReset = async () => {
    setResetting(true);
    try {
      const res = await resetDemoData();
      if (res && res.success) {
        enqueueSnackbar('¡Base de datos restaurada a su estado inicial limpio!', { variant: 'success' });
        // Recargar la página actual para reflejar los datos limpios
        setTimeout(() => {
          window.location.reload();
        }, 600);
      } else {
        enqueueSnackbar(res?.error || 'Error al restablecer datos', { variant: 'error' });
      }
    } catch (error) {
      enqueueSnackbar('Error de comunicación al restablecer', { variant: 'error' });
    } finally {
      setResetting(false);
      setConfirmDialogOpen(false);
    }
  };

  const handleExitDemo = async () => {
    setExiting(true);
    try {
      await logout({ autoResetDemo: true });
      enqueueSnackbar('Sesión demo finalizada. Datos restaurados.', { variant: 'info' });
      navigate('/login');
    } catch (error) {
      navigate('/login');
    } finally {
      setExiting(false);
    }
  };

  return (
    <>
      <Box
        sx={{
          background: 'linear-gradient(90deg, #00293D 0%, #003B5A 50%, #0A3D62 100%)',
          color: 'white',
          px: { xs: 1.5, sm: 3 },
          py: 0.8,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,
          borderBottom: '2px solid #FFD700',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          position: 'sticky',
          top: 0,
          zIndex: 1300
        }}
      >
        {/* Lado izquierdo: Indicador de Modo Demo y Rol */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, flexWrap: 'wrap' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.8,
              bgcolor: 'rgba(255, 215, 0, 0.15)',
              px: 1.2,
              py: 0.3,
              borderRadius: 2,
              border: '1px solid rgba(255, 215, 0, 0.4)'
            }}
          >
            <RocketLaunch sx={{ color: '#FFD700', fontSize: 18 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#FFD700', fontSize: '0.82rem', letterSpacing: 0.5 }}>
              MODO DEMO RECLUTADOR
            </Typography>
          </Box>

          <Typography variant="body2" sx={{ fontSize: '0.85rem', color: '#e2e8f0', display: { xs: 'none', md: 'inline' } }}>
            Evaluando como:
          </Typography>

          <Chip
            label={roleName}
            size="small"
            sx={{
              bgcolor: 'rgba(255,255,255,0.2)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.78rem',
              backdropFilter: 'blur(4px)'
            }}
          />

          <Typography variant="caption" sx={{ color: '#94a3b8', display: { xs: 'none', lg: 'inline' } }}>
            (Los datos se restaurarán automáticamente al salir)
          </Typography>
        </Box>

        {/* Lado derecho: Acciones de Demo */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={() => setConfirmDialogOpen(true)}
            disabled={resetting || exiting}
            startIcon={resetting ? <CircularProgress size={14} sx={{ color: '#FFD700' }} /> : <RestartAlt />}
            sx={{
              color: '#FFD700',
              borderColor: 'rgba(255, 215, 0, 0.5)',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.78rem',
              py: 0.3,
              px: 1.2,
              borderRadius: 2,
              '&:hover': {
                borderColor: '#FFD700',
                bgcolor: 'rgba(255, 215, 0, 0.1)'
              }
            }}
          >
            {resetting ? 'Restaurando...' : 'Restaurar Datos'}
          </Button>

          <Button
            size="small"
            variant="contained"
            onClick={handleExitDemo}
            disabled={resetting || exiting}
            startIcon={exiting ? <CircularProgress size={14} sx={{ color: 'white' }} /> : <ExitToApp />}
            sx={{
              bgcolor: '#e11d48',
              color: 'white',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.78rem',
              py: 0.3,
              px: 1.4,
              borderRadius: 2,
              '&:hover': {
                bgcolor: '#be123c'
              }
            }}
          >
            {exiting ? 'Saliendo...' : 'Salir del Demo'}
          </Button>
        </Box>
      </Box>

      {/* Diálogo de Confirmación para Restauración Manual */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => !resetting && setConfirmDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}>
          <RestartAlt sx={{ color: '#003B5A' }} />
          ¿Restablecer estado inicial de datos?
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: '#475569', fontSize: '0.95rem' }}>
            Esto limpiará todas las modificaciones, asistencias, nóminas o permisos creados durante esta prueba y dejará la base de datos como nueva.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setConfirmDialogOpen(false)}
            disabled={resetting}
            sx={{ color: '#64748b', textTransform: 'none' }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleManualReset}
            disabled={resetting}
            variant="contained"
            sx={{
              bgcolor: '#003B5A',
              fontWeight: 700,
              textTransform: 'none',
              '&:hover': { bgcolor: '#00293D' }
            }}
          >
            {resetting ? 'Restaurando...' : 'Sí, Restaurar Datos'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DemoBanner;
