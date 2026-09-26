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
  LinearProgress,
} from '@mui/material';
import {
  Assignment as TareasIcon,
  CheckCircle as DoneIcon,
  HourglassEmpty as PendingIcon,
  Warning as UrgentIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const PRIORIDAD_COLOR = {
  ALTA: 'error',
  MEDIA: 'warning',
  BAJA: 'success',
};

const ESTADO_COLOR = {
  PENDIENTE: 'warning',
  EN_PROCESO: 'info',
  COMPLETADA: 'success',
};

const MisTareas = () => {
  const { user } = useAuth();
  const [tareas, setTareas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // TODO: reemplazar con llamada real a tareasService.getMisTareas()
    setTimeout(() => {
      setTareas([
        {
          id: 1,
          titulo: 'Actualizar expediente de empleados',
          descripcion: 'Revisar y actualizar los datos personales de los empleados del departamento.',
          prioridad: 'ALTA',
          estado: 'PENDIENTE',
          fecha_vencimiento: '2026-10-05',
          progreso: 0,
        },
        {
          id: 2,
          titulo: 'Preparar informe mensual de asistencia',
          descripcion: 'Generar el reporte de asistencia del mes de septiembre.',
          prioridad: 'MEDIA',
          estado: 'EN_PROCESO',
          fecha_vencimiento: '2026-09-30',
          progreso: 60,
        },
        {
          id: 3,
          titulo: 'Revisar solicitudes de permiso',
          descripcion: 'Procesar las solicitudes de permiso pendientes de aprobacion.',
          prioridad: 'ALTA',
          estado: 'PENDIENTE',
          fecha_vencimiento: '2026-09-28',
          progreso: 0,
        },
        {
          id: 4,
          titulo: 'Organizar archivos de nomina',
          descripcion: 'Archivar los documentos de nomina del trimestre anterior.',
          prioridad: 'BAJA',
          estado: 'COMPLETADA',
          fecha_vencimiento: '2026-09-20',
          progreso: 100,
        },
        {
          id: 5,
          titulo: 'Coordinar capacitacion de induccion',
          descripcion: 'Coordinar la sesion de induccion para los nuevos empleados.',
          prioridad: 'MEDIA',
          estado: 'PENDIENTE',
          fecha_vencimiento: '2026-10-10',
          progreso: 20,
        },
      ]);
      setLoading(false);
    }, 800);
  }, []);

  const pendientes = tareas.filter((t) => t.estado === 'PENDIENTE').length;
  const enProceso = tareas.filter((t) => t.estado === 'EN_PROCESO').length;
  const completadas = tareas.filter((t) => t.estado === 'COMPLETADA').length;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress color="secondary" />
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
              backgroundColor: '#8E24AA',
              borderRadius: '12px',
              p: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <TareasIcon sx={{ color: 'white', fontSize: 32 }} />
          </Box>
          <Box>
            <Typography variant="h4" component="h1" fontWeight="700" color="primary.main">
              Mis Tareas
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Bienvenido, <strong>{user?.nombre} {user?.apellido}</strong> - gestiona tus tareas asignadas
            </Typography>
          </Box>
        </Box>

        {/* Resumen */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            { label: 'Pendientes', value: pendientes, icon: <PendingIcon />, color: '#F57C00', bg: '#FFF3E0' },
            { label: 'En Proceso', value: enProceso, icon: <UrgentIcon />, color: '#1565C0', bg: '#E3F2FD' },
            { label: 'Completadas', value: completadas, icon: <DoneIcon />, color: '#2E7D32', bg: '#E8F5E9' },
          ].map((item, i) => (
            <Grid item xs={12} sm={4} key={i}>
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}>
                <Card
                  sx={{
                    borderRadius: 3,
                    background: item.bg,
                    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                    border: `1px solid ${item.color}30`,
                  }}
                >
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ color: item.color }}>{item.icon}</Box>
                    <Box>
                      <Typography variant="h5" fontWeight="700" sx={{ color: item.color }}>
                        {item.value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.label}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* Lista de tareas */}
        <Grid container spacing={2}>
          {tareas.map((tarea, i) => (
            <Grid item xs={12} key={tarea.id}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Card
                  sx={{
                    borderRadius: 3,
                    boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
                    borderLeft: `5px solid ${
                      tarea.prioridad === 'ALTA'
                        ? '#C62828'
                        : tarea.prioridad === 'MEDIA'
                        ? '#F57C00'
                        : '#2E7D32'
                    }`,
                    transition: 'all 0.2s',
                    '&:hover': { boxShadow: '0 6px 20px rgba(0,0,0,0.1)', transform: 'translateY(-2px)' },
                    opacity: tarea.estado === 'COMPLETADA' ? 0.75 : 1,
                  }}
                >
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={1}>
                      <Box flex={1}>
                        <Typography
                          variant="h6"
                          fontWeight="600"
                          sx={{
                            textDecoration: tarea.estado === 'COMPLETADA' ? 'line-through' : 'none',
                            color: tarea.estado === 'COMPLETADA' ? 'text.secondary' : 'text.primary',
                          }}
                        >
                          {tarea.titulo}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {tarea.descripcion}
                        </Typography>
                      </Box>
                      <Box display="flex" gap={1} flexWrap="wrap">
                        <Chip
                          label={tarea.prioridad}
                          color={PRIORIDAD_COLOR[tarea.prioridad] || 'default'}
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          label={tarea.estado.replace('_', ' ')}
                          color={ESTADO_COLOR[tarea.estado] || 'default'}
                          size="small"
                        />
                      </Box>
                    </Box>

                    <Divider sx={{ my: 1.5 }} />

                    <Box display="flex" justifyContent="space-between" alignItems="center" gap={2} flexWrap="wrap">
                      <Typography variant="caption" color="text.secondary">
                        Vence: <strong>{new Date(tarea.fecha_vencimiento).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>
                      </Typography>
                      <Box sx={{ flex: 1, minWidth: 120 }}>
                        <Typography variant="caption" color="text.secondary">
                          Progreso: {tarea.progreso}%
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={tarea.progreso}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            mt: 0.5,
                            backgroundColor: '#e0e0e0',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 3,
                              backgroundColor:
                                tarea.progreso === 100 ? '#2E7D32' : tarea.progreso > 50 ? '#1565C0' : '#F57C00',
                            },
                          }}
                        />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </motion.div>
    </Box>
  );
};

export default MisTareas;
