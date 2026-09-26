import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Box,
  Chip,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  School as SchoolIcon,
  FiberManualRecord as DotIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';

const RecentActivity = ({ title, activities, type }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'evaluaciones':
        return <AssessmentIcon color="primary" />;
      case 'capacitaciones':
        return <SchoolIcon color="secondary" />;
      default:
        return <DotIcon />;
    }
  };

  const formatActivity = (activity, type) => {
    switch (type) {
      case 'evaluaciones':
        if (activity.evaluador_nombre) {
          return `Evaluador: ${activity.evaluador_nombre} ${activity.evaluador_apellido || ''}`.trim();
        }
        if (activity.nombre) {
          return `${activity.nombre} ${activity.apellido || ''}`.trim();
        }
        return activity.periodo_evaluacion || activity.periodo || 'Evaluación';
      case 'capacitaciones':
        return activity.nombre || activity.titulo || 'Capacitación';
      default:
        return activity.nombre || activity.titulo || 'Actividad';
    }
  };

  const getSecondaryText = (activity, type) => {
    switch (type) {
      case 'evaluaciones': {
        const periodo = activity.periodo_evaluacion || activity.periodo || '';
        const calificacion = activity.puntuacion_total != null ? parseFloat(activity.puntuacion_total).toFixed(2) : 'N/A';
        return `Calificación: ${calificacion}${periodo ? ` - ${periodo}` : ''}`;
      }
      case 'capacitaciones':
        return activity.fecha_inicio ? `Inicia: ${new Date(activity.fecha_inicio).toLocaleDateString('es-ES')}` : '';
      default:
        return '';
    }
  };

  const getChip = (activity, type) => {
    switch (type) {
      case 'evaluaciones':
        return (
          <Chip 
            label={activity.puntuacion_total != null ? parseFloat(activity.puntuacion_total).toFixed(2) : 'N/A'} 
            size="small" 
            color="primary" 
            variant="outlined"
          />
        );
      case 'capacitaciones':
        return (
          <Chip 
            label={activity.estado || (activity.progreso !== undefined ? `${activity.progreso}%` : 'PENDIENTE')} 
            size="small" 
            color={
              activity.estado === 'COMPLETADA' ? 'success' : 
              activity.estado === 'EN_CURSO' ? 'warning' : 'default'
            } 
          />
        );
      default:
        return null;
    }
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom fontWeight="500">
          {title}
        </Typography>
        
        {activities.length === 0 ? (
          <Box textAlign="center" py={3}>
            <CalendarIcon color="disabled" sx={{ fontSize: 48, mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              No hay {type === 'evaluaciones' ? 'evaluaciones' : 'capacitaciones'} {type === 'evaluaciones' ? 'recientes' : 'programadas'}
            </Typography>
          </Box>
        ) : (
          <List dense>
            {activities.slice(0, 5).map((activity, index) => (
              <ListItem key={index} sx={{ borderBottom: index < activities.slice(0, 5).length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {getIcon(type)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" fontWeight="500">
                        {formatActivity(activity, type)}
                      </Typography>
                      {getChip(activity, type)}
                    </Box>
                  }
                  secondary={getSecondaryText(activity, type)}
                  sx={{ mr: 1 }}
                />
              </ListItem>
            ))}
          </List>
        )}
        
        {activities.length > 5 && (
          <Box sx={{ mt: 1, textAlign: 'center' }}>
            <Typography variant="body2" color="primary" sx={{ fontStyle: 'italic' }}>
              +{activities.length - 5} más...
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivity;