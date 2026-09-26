import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Button,
  Divider,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { reportesService } from '../../services/Api';
import StatsCard from '../../components/Dashboard/StatsCard';
import RecentActivity from '../../components/Dashboard/RecentActivity';
import {
  People as PeopleIcon,
  RequestQuote as PermisosIcon,
  Assessment as EvaluacionesIcon,
  School as SchoolIcon,
  Schedule as AsistenciaIcon,
  TrendingUp as DesempenoIcon,
  Assignment as TareasIcon,
  NotificationsActive as AlertasIcon,
} from '@mui/icons-material';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await reportesService.getDashboard();
      if (response.success) {
        setDashboardData(response.data);
      } else {
        setError(response.error || 'Error al cargar datos del dashboard');
      }
    } catch (err) {
      setError('Error de conexión al cargar datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Función para determinar el título del dashboard según el rol
  const getDashboardTitle = () => {
    switch(user?.rol) {
      case 'ADMIN_RRHH':
        return 'Panel de Administración - Recursos Humanos';
      case 'DIRECTIVO':
        return 'Panel Directivo';
      case 'DOCENTE':
        return 'Mi Panel Docente';
      case 'PERSONAL_APOYO':
        return 'Mi Panel de Trabajo';
      default:
        return 'Panel General';
    }
  };

  // Función para obtener estadísticas según el rol (MANTENIENDO DATOS REALES)
  const getRoleSpecificStats = (statsData) => {
    const formatNumber = (value) => (value ? Number(value).toFixed(1) : '0');
    
    // Estadísticas base que todos pueden ver
    const baseStats = [
      {
        title: 'Asistencias Hoy',
        value: statsData.asistencias_hoy || 0,
        icon: <AsistenciaIcon />,
        color: '#2E7D32',
        gradient: 'linear-gradient(135deg, #2E7D32, #66BB6A)',
        description: 'Registros del día de hoy',
      }
    ];

    switch(user?.rol) {
      case 'ADMIN_RRHH':
        return [
          {
            title: 'Total Empleados',
            value: statsData.total_empleados || 0,
            icon: <PeopleIcon />,
            color: '#1565C0',
            gradient: 'linear-gradient(135deg, #1565C0, #5E92F3)',
            description: 'Empleados activos en el sistema',
          },
          {
            title: 'Permisos Pendientes',
            value: statsData.permisos_pendientes || 0,
            icon: <PermisosIcon />,
            color: '#F57C00',
            gradient: 'linear-gradient(135deg, #F57C00, #FFB74D)',
            description: 'Solicitudes por revisar',
          },
          ...baseStats,
          {
            title: 'Promedio Desempeño',
            value: formatNumber(statsData.promedio_desempeno),
            icon: <DesempenoIcon />,
            color: '#8E24AA',
            gradient: 'linear-gradient(135deg, #8E24AA, #BA68C8)',
            description: 'Calificación promedio del personal',
          },
          {
            title: 'Total Docentes',
            value: statsData.total_docentes || 0,
            icon: <SchoolIcon />,
            color: '#C62828',
            gradient: 'linear-gradient(135deg, #C62828, #E57373)',
            description: 'Personal académico registrado',
          },
          {
            title: 'Total Administrativos',
            value: statsData.total_administrativos || 0,
            icon: <PeopleIcon />,
            color: '#00796B',
            gradient: 'linear-gradient(135deg, #00796B, #4DB6AC)',
            description: 'Personal administrativo activo',
          },
        ];

      case 'DIRECTIVO':
        return [
          {
            title: 'Total Empleados',
            value: statsData.total_empleados || 0,
            icon: <PeopleIcon />,
            color: '#1565C0',
            gradient: 'linear-gradient(135deg, #1565C0, #5E92F3)',
            description: 'Empleados en la institución',
          },
          {
            title: 'Permisos Pendientes',
            value: statsData.permisos_pendientes || 0,
            icon: <PermisosIcon />,
            color: '#F57C00',
            gradient: 'linear-gradient(135deg, #F57C00, #FFB74D)',
            description: 'Solicitudes por revisar',
          },
          ...baseStats,
          {
            title: 'Promedio Desempeño',
            value: formatNumber(statsData.promedio_desempeno),
            icon: <DesempenoIcon />,
            color: '#8E24AA',
            gradient: 'linear-gradient(135deg, #8E24AA, #BA68C8)',
            description: 'Calificación promedio general',
          },
          {
            title: 'Evaluaciones Pendientes',
            value: statsData.evaluaciones_pendientes || 0,
            icon: <EvaluacionesIcon />,
            color: '#C62828',
            gradient: 'linear-gradient(135deg, #C62828, #E57373)',
            description: 'Evaluaciones por completar',
          },
        ];

      case 'DOCENTE':
        // Para docentes, mostramos estadísticas personales basadas en datos reales
        return [
          {
            title: 'Mis Asistencias',
            value: statsData.asistencias_hoy || 0,
            icon: <AsistenciaIcon />,
            color: '#2E7D32',
            gradient: 'linear-gradient(135deg, #2E7D32, #66BB6A)',
            description: 'Mi registro de hoy',
          },
          {
            title: 'Permisos Pendientes',
            value: statsData.mis_permisos_pendientes || 0,
            icon: <PermisosIcon />,
            color: '#F57C00',
            gradient: 'linear-gradient(135deg, #F57C00, #FFB74D)',
            description: 'Mis solicitudes por aprobar',
          },
          {
            title: 'Próximas Clases',
            value: statsData.proximas_clases || 0,
            icon: <SchoolIcon />,
            color: '#1565C0',
            gradient: 'linear-gradient(135deg, #1565C0, #5E92F3)',
            description: 'Clases programadas hoy',
          },
          {
            title: 'Evaluaciones',
            value: statsData.mis_evaluaciones || 0,
            icon: <EvaluacionesIcon />,
            color: '#8E24AA',
            gradient: 'linear-gradient(135deg, #8E24AA, #BA68C8)',
            description: 'Mis evaluaciones pendientes',
          },
          {
            title: 'Mi Calificación',
            value: formatNumber(statsData.mi_calificacion) || 'N/A',
            icon: <DesempenoIcon />,
            color: '#2E7D32',
            gradient: 'linear-gradient(135deg, #2E7D32, #66BB6A)',
            description: 'Mi desempeño actual',
          },
        ];

      case 'PERSONAL_APOYO':
        // Para personal de apoyo
        return [
          {
            title: 'Mis Asistencias',
            value: statsData.asistencias_hoy || 0,
            icon: <AsistenciaIcon />,
            color: '#2E7D32',
            gradient: 'linear-gradient(135deg, #2E7D32, #66BB6A)',
            description: 'Mi registro de hoy',
          },
          {
            title: 'Permisos Pendientes',
            value: statsData.mis_permisos_pendientes || 0,
            icon: <PermisosIcon />,
            color: '#F57C00',
            gradient: 'linear-gradient(135deg, #F57C00, #FFB74D)',
            description: 'Mis solicitudes por aprobar',
          },
          {
            title: 'Tareas Pendientes',
            value: statsData.tareas_pendientes || 0,
            icon: <TareasIcon />,
            color: '#8E24AA',
            gradient: 'linear-gradient(135deg, #8E24AA, #BA68C8)',
            description: 'Tareas asignadas',
            onClick: () => navigate('/tareas'),
          },
          {
            title: 'Mi Calificación',
            value: formatNumber(statsData.mi_calificacion) || 'N/A',
            icon: <DesempenoIcon />,
            color: '#2E7D32',
            gradient: 'linear-gradient(135deg, #2E7D32, #66BB6A)',
            description: 'Mi evaluación de desempeño',
          },
          {
            title: 'Alertas',
            value: statsData.alertas || 0,
            icon: <AlertasIcon />,
            color: '#C62828',
            gradient: 'linear-gradient(135deg, #C62828, #E57373)',
            description: 'Notificaciones importantes',
            onClick: () => navigate('/alertas'),
          },
        ];

      default:
        return baseStats;
    }
  };

  // Función para obtener actividades recientes según el rol
  const getRoleSpecificActivities = () => {
    const actividades = dashboardData || {};

    switch(user?.rol) {
      case 'DOCENTE':
      case 'PERSONAL_APOYO':
        // Para usuarios regulares, mostramos actividades personales
        return {
          left: {
            title: 'Mis Evaluaciones Recientes',
            activities: actividades.mis_evaluaciones || actividades.ultimas_evaluaciones || [],
            type: 'evaluaciones'
          },
          right: {
            title: 'Mis Próximas Capacitaciones',
            activities: actividades.mis_capacitaciones || actividades.proximas_capacitaciones || [],
            type: 'capacitaciones'
          }
        };

      default:
        // Para admin y directivos, mostramos vista global
        return {
          left: {
            title: 'Últimas Evaluaciones',
            activities: actividades.ultimas_evaluaciones || [],
            type: 'evaluaciones'
          },
          right: {
            title: 'Próximas Capacitaciones',
            activities: actividades.proximas_capacitaciones || [],
            type: 'capacitaciones'
          }
        };
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={loadDashboardData}>
          Reintentar
        </Button>
      </Box>
    );
  }

  const statsData = dashboardData?.estadisticas || {};
  const stats = getRoleSpecificStats(statsData);
  const activities = getRoleSpecificActivities();

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 2, md: 3 },
        backgroundColor: '#f4f6f8',
        minHeight: '100vh',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Encabezado personalizado por rol */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            component="h1"
            fontWeight="600"
            sx={{ color: 'primary.main', mb: 1 }}
          >
            {getDashboardTitle()}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Bienvenido, <strong>{user?.nombre} {user?.apellido}</strong>
            {user?.rol === 'DOCENTE' && ' - Docente'}
            {user?.rol === 'PERSONAL_APOYO' && ' - Personal de Apoyo'}
            {user?.rol === 'ADMIN_RRHH' && ' - Administrador de RRHH'}
            {user?.rol === 'DIRECTIVO' && ' - Directivo'}
          </Typography>
        </Box>

        {/* Tarjetas de estadísticas según rol */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={4} lg={2.4} key={index}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
              >
                <StatsCard
                  title={stat.title}
                  value={stat.value}
                  icon={stat.icon}
                  color={stat.color}
                  gradient={stat.gradient}
                  description={stat.description}
                  onClick={stat.onClick}
                />
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* Actividades Recientes según rol */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <RecentActivity
              title={activities.left.title}
              activities={activities.left.activities}
              type={activities.left.type}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <RecentActivity
              title={activities.right.title}
              activities={activities.right.activities}
              type={activities.right.type}
              color="secondary"
            />
          </Grid>
        </Grid>

        {/* Información del Usuario - Solo para roles no administrativos */}
        {(user?.rol === 'DOCENTE' || user?.rol === 'PERSONAL_APOYO') && (
          <Card
            elevation={3}
            sx={{
              mt: 5,
              borderRadius: 3,
              p: 2,
              background: 'white',
              boxShadow: '0 3px 10px rgba(0,0,0,0.05)',
              transition: '0.3s',
              '&:hover': { boxShadow: '0 6px 20px rgba(0,0,0,0.1)' },
            }}
          >
            <CardContent>
              <Typography variant="h6" fontWeight="600" sx={{ mb: 2, color: 'primary.main' }}>
                Mi Información
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Nombre:</strong> {user?.nombre} {user?.apellido}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Email:</strong> {user?.email}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Rol:</strong> {user?.rol}
                  </Typography>
                </Grid>

                {user?.empleado && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Departamento:</strong> {user.empleado.departamento}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Puesto:</strong> {user.empleado.puesto}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Código:</strong> {user.empleado.codigo_empleado}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Información resumida para administradores y directivos */}
        {(user?.rol === 'ADMIN_RRHH' || user?.rol === 'DIRECTIVO') && (
          <Card
            elevation={3}
            sx={{
              mt: 5,
              borderRadius: 3,
              p: 2,
              background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            }}
          >
            <CardContent>
              <Typography variant="h6" fontWeight="600" sx={{ mb: 2, color: 'primary.main' }}>
                Resumen del Sistema
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                <strong>Usuario:</strong> {user?.nombre} {user?.apellido} | 
                <strong> Rol:</strong> {user?.rol} | 
                <strong> Último acceso:</strong> {new Date().toLocaleDateString()}
              </Typography>
              
              <Typography variant="caption" color="text.secondary">
                Tienes acceso completo a las funcionalidades del sistema de gestión de recursos humanos.
              </Typography>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </Box>
  );
};

export default Dashboard;