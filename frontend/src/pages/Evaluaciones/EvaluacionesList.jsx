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
  Rating,
  Button,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { evaluacionesService } from '../../services/Api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate } from '../../utils/formatters';

const EvaluacionesList = () => {
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadEvaluaciones();
  }, []);

  const loadEvaluaciones = async () => {
    try {
      const response = await evaluacionesService.getAll();
      if (response.success) {
        setEvaluaciones(response.data);
      }
    } catch (error) {
      console.error('Error cargando evaluaciones:', error);
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
          Gestión de Evaluaciones
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/evaluaciones/nueva')}
        >
          Nueva Evaluación
        </Button>
      </Box>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Empleado</TableCell>
                <TableCell>Departamento</TableCell>
                <TableCell>Período</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Evaluador</TableCell>
                <TableCell>Puntuación</TableCell>
                <TableCell>Estado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {evaluaciones.map((evaluacion) => (
                <TableRow key={evaluacion.id} hover>
                  <TableCell>
                    <Typography variant="body1" fontWeight="bold">
                      {evaluacion.empleado_nombre} {evaluacion.empleado_apellido}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {evaluacion.codigo_empleado}
                    </Typography>
                  </TableCell>
                  <TableCell>{evaluacion.departamento}</TableCell>
                  <TableCell>{evaluacion.periodo_evaluacion}</TableCell>
                  <TableCell>{formatDate(evaluacion.fecha_evaluacion)}</TableCell>
                  <TableCell>
                    {evaluacion.evaluador_nombre} {evaluacion.evaluador_apellido}
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Rating
                        value={evaluacion.puntuacion_total / 20}
                        precision={0.1}
                        readOnly
                        size="small"
                      />
                      <Chip
                        label={`${evaluacion.puntuacion_total}/100`}
                        color={
                          evaluacion.puntuacion_total >= 80 ? 'success' :
                          evaluacion.puntuacion_total >= 60 ? 'warning' : 'error'
                        }
                        size="small"
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label="Completada"
                      color="success"
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {evaluaciones.length === 0 && (
          <Box p={3} textAlign="center">
            <Typography variant="body1" color="text.secondary">
              No hay evaluaciones registradas.
            </Typography>
          </Box>
        )}
      </Card>
    </Box>
  );
};

export default EvaluacionesList;