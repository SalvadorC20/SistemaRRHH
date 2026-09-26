import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Grid,
  CircularProgress,
  Alert,
  Divider,
  Avatar,
} from '@mui/material';
import {
  NotificationsActive as AlertasIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as SuccessIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const TIPO_CONFIG = {
  INFO: { color: '#1565C0', bg: '#E3F2FD', icon: <InfoIcon />, label: 'Informacion' },
  ADVERTENCIA: { color: '#F57C00', bg: '#FFF3E0', icon: <WarningIcon />, label: 'Advertencia' },
  URGENTE: { color: '#C62828', bg: '#FFEBEE', icon: <ErrorIcon />, label: 'Urgente' },
  EXITO: { color: '#2E7D32', bg: '#E8F5E9', icon: <SuccessIcon />, label: 'Exito' },
};

const MisAlertas = () => {
  const { user } = useAuth();
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // TODO: reemplazar con llamada real a alertasService.getMisAlertas()
    setTimeout(() => {
      setAlertas([
        {
          id: 1,
          tipo: 'URGENTE',
          titulo: 'Permiso por vencer',
          mensaje: 'Tu solicitud de permiso #234 vence en 2 dias. Asegurate de tener la documentacion completa.',
          fecha: '2026-09-26T09:00:00',
          leida: false,
        },
        {
          id: 2,
          tipo: 'ADVERTENCIA',
          titulo: 'Registro de asistencia pendiente',
          mensaje: 'No se ha registrado tu asistencia de hoy. Por favor ingresa al modulo de asistencia.',
          fecha: '2026-09-26T08:30:00',
          leida: false,
        },
        {
          id: 3,
          tipo: 'INFO',
          titulo: 'Nueva capacitacion disponible',
          mensaje: 'Se ha programado una capacitacion de Seguridad Informatica para el 5 de octubre.',
          fecha: '2026-09-25T15:00:00',
          leida: true,
        },
        {
          id: 4,
          tipo: 'EXITO',
          titulo: 'Nomina procesada',
          mensaje: 'Tu nomina del mes de septiembre ha sido procesada correctamente.',
          fecha: '2026-09-24T10:00:00',
          leida: true,
        },
      ]);
      setLoading(false);
    }, 700);
  }, []);

  const noLeidas = alertas.filter((a) => !a.leida).length;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress color="error" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, backgroundColor: '#f4f6f8', minHeight: '100vh' }}>
      <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              backgroundColor: '#C62828',
              borderRadius: '12px',
              p: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AlertasIcon sx={{ color: 'white', fontSize: 32 }} />
          </Box>
          <Box>
            <Typography variant="h4" component="h1" fontWeight="700" color="primary.main">
              Mis Alertas
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tienes <strong style={{ color: '#C62828' }}>{noLeidas} notificaciones sin leer</strong>
            </Typography>
          </Box>
        </Box>

        {/* Resumen por tipo */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {Object.entries(TIPO_CONFIG).map(([tipo, cfg], i) => {
            const count = alertas.filter((a) => a.tipo === tipo).length;
            return (
              <Grid item xs={6} sm={3} key={tipo}>
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.08 }}>
                  <Card sx={{ borderRadius: 3, background: cfg.bg, border: `1px solid ${cfg.color}30`, boxShadow: 'none' }}>
                    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: '12px !important' }}>
                      <Box sx={{ color: cfg.color }}>{cfg.icon}</Box>
                      <Box>
                        <Typography variant="h6" fontWeight="700" sx={{ color: cfg.color, lineHeight: 1 }}>
                          {count}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {cfg.label}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            );
          })}
        </Grid>

        {/* Lista de alertas */}
        <Grid container spacing={2}>
          {alertas.map((alerta, i) => {
            const cfg = TIPO_CONFIG[alerta.tipo] || TIPO_CONFIG.INFO;
            return (
              <Grid item xs={12} key={alerta.id}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Card
                    sx={{
                      borderRadius: 3,
                      boxShadow: alerta.leida ? 'none' : '0 4px 14px rgba(0,0,0,0.1)',
                      border: `1px solid ${alerta.leida ? '#e0e0e0' : cfg.color + '50'}`,
                      borderLeft: `5px solid ${alerta.leida ? '#bdbdbd' : cfg.color}`,
                      opacity: alerta.leida ? 0.75 : 1,
                      transition: 'all 0.2s',
                      '&:hover': { boxShadow: '0 6px 20px rgba(0,0,0,0.1)', transform: 'translateY(-2px)' },
                    }}
                  >
                    <CardContent>
                      <Box display="flex" alignItems="flex-start" gap={2}>
                        <Avatar
                          sx={{
                            backgroundColor: cfg.bg,
                            color: cfg.color,
                            width: 42,
                            height: 42,
                          }}
                        >
                          {cfg.icon}
                        </Avatar>
                        <Box flex={1}>
                          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                            <Typography variant="subtitle1" fontWeight="700">
                              {alerta.titulo}
                              {!alerta.leida && (
                                <Box
                                  component="span"
                                  sx={{
                                    display: 'inline-block',
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    backgroundColor: cfg.color,
                                    ml: 1,
                                    verticalAlign: 'middle',
                                  }}
                                />
                              )}
                            </Typography>
                            <Box display="flex" gap={1} alignItems="center">
                              <Chip label={cfg.label} size="small" sx={{ backgroundColor: cfg.bg, color: cfg.color, fontWeight: 600 }} />
                              {alerta.leida && <Chip label="Leida" size="small" variant="outlined" color="default" />}
                            </Box>
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {alerta.mensaje}
                          </Typography>
                          <Divider sx={{ my: 1 }} />
                          <Typography variant="caption" color="text.secondary">
                            {new Date(alerta.fecha).toLocaleString('es-MX', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            );
          })}
        </Grid>
      </motion.div>
    </Box>
  );
};

export default MisAlertas;
