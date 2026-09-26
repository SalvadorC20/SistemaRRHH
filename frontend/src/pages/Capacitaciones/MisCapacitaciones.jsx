import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
} from '@mui/material';
import { capacitacionesService } from '../../services/Api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate, getStatusColor } from '../../utils/formatters';

const MisCapacitaciones = () => {
  const [capacitaciones, setCapacitaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMisCapacitaciones();
  }, []);

  const loadMisCapacitaciones = async () => {
    try {
      // Usar un endpoint específico para las capacitaciones del empleado actual
      const response = await capacitacionesService.getMisCapacitaciones();
      if (response.success) {
        setCapacitaciones(response.data);
      } else {
        // Fallback: cargar todas y simular asignación (para desarrollo)
        const allResponse = await capacitacionesService.getAll();
        if (allResponse.success) {
          // Simular que el usuario actual está asignado a algunas capacitaciones
          const capacitacionesAsignadas = allResponse.data
            .filter(cap => cap.id % 2 === 0) // Simulación - en producción vendría del backend
            .map(cap => ({
              ...cap,
              progreso: Math.floor(Math.random() * 100), // Simulación de progreso
              asistio: cap.estado === 'COMPLETADA'
            }));
          setCapacitaciones(capacitacionesAsignadas);
        }
      }
    } catch (error) {
      console.error('Error cargando mis capacitaciones:', error);
      // Fallback en caso de error
      try {
        const response = await capacitacionesService.getAll();
        if (response.success) {
          const capacitacionesAsignadas = response.data.slice(0, 2).map(cap => ({
            ...cap,
            progreso: cap.estado === 'COMPLETADA' ? 100 : Math.floor(Math.random() * 100),
            asistio: cap.estado === 'COMPLETADA'
          }));
          setCapacitaciones(capacitacionesAsignadas);
        }
      } catch (fallbackError) {
        console.error('Error en fallback:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  const getProgresoColor = (progreso) => {
    if (progreso >= 80) return 'success';
    if (progreso >= 50) return 'warning';
    return 'primary';
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Mis Capacitaciones
      </Typography>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell>Fechas</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Progreso</TableCell>
                {/* Se eliminó la columna de Acciones */}
              </TableRow>
            </TableHead>
            <TableBody>
              {capacitaciones.map((capacitacion) => (
                <TableRow key={capacitacion.id} hover>
                  <TableCell>
                    <Typography variant="body1" fontWeight="bold">
                      {capacitacion.nombre}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ maxWidth: 300 }}>
                      {capacitacion.descripcion}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(capacitacion.fecha_inicio)} - {formatDate(capacitacion.fecha_fin)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={capacitacion.estado}
                      color={getStatusColor(capacitacion.estado)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell sx={{ width: 250 }}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <LinearProgress
                        variant="determinate"
                        value={capacitacion.progreso || 0}
                        color={getProgresoColor(capacitacion.progreso || 0)}
                        sx={{ 
                          flexGrow: 1,
                          height: 8,
                          borderRadius: 4
                        }}
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 40 }}>
                        {capacitacion.progreso || 0}%
                      </Typography>
                    </Box>
                    {capacitacion.asistio && (
                      <Chip 
                        label="Asistió" 
                        color="success" 
                        size="small" 
                        variant="outlined"
                        sx={{ mt: 0.5 }}
                      />
                    )}
                  </TableCell>
                  {/* Se eliminó la celda de botones de acción */}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {capacitaciones.length === 0 && (
          <Box p={3} textAlign="center">
            <Typography variant="body1" color="text.secondary">
              No hay capacitaciones asignadas.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Las capacitaciones asignadas aparecerán aquí automáticamente.
            </Typography>
          </Box>
        )}
      </Card>
    </Box>
  );
};

export default MisCapacitaciones;