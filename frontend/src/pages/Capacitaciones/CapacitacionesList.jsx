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
  Button,
  IconButton,
} from '@mui/material';
import { Add as AddIcon, Visibility as ViewIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { capacitacionesService } from '../../services/Api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate, getStatusColor } from '../../utils/formatters';

const CapacitacionesList = () => {
  const [capacitaciones, setCapacitaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadCapacitaciones();
  }, []);

  const loadCapacitaciones = async () => {
    try {
      const response = await capacitacionesService.getAll();
      if (response.success) {
        setCapacitaciones(response.data);
      }
    } catch (error) {
      console.error('Error cargando capacitaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Gestión de Capacitaciones
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/capacitaciones/nueva')}
        >
          Nueva Capacitación
        </Button>
      </Box>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell>Fechas</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Participantes</TableCell>
                <TableCell>Acciones</TableCell>
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
                  <TableCell>
                    <Chip
                      label={`${capacitacion.participantes_count || 0} participantes`}
                      variant="outlined"
                      size="small"
                      onClick={() => navigate(`/capacitaciones/${capacitacion.id}`)}
                      style={{ cursor: 'pointer' }}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => navigate(`/capacitaciones/${capacitacion.id}`)}
                      title="Ver detalles"
                    >
                      <ViewIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {capacitaciones.length === 0 && (
          <Box p={3} textAlign="center">
            <Typography variant="body1" color="text.secondary">
              No hay capacitaciones registradas.
            </Typography>
          </Box>
        )}
      </Card>
    </Box>
  );
};

export default CapacitacionesList;