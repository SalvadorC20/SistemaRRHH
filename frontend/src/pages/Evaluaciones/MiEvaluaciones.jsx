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
} from '@mui/material';
import { evaluacionesService } from '../../services/Api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate } from '../../utils/formatters';

const MiEvaluaciones = () => {
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvaluaciones();
  }, []);

  const loadEvaluaciones = async () => {
    try {
      const response = await evaluacionesService.getMisEvaluaciones();
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
      <Typography variant="h4" component="h1" gutterBottom>
        Mis Evaluaciones de Desempeño
      </Typography>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Período</TableCell>
                <TableCell>Fecha Evaluación</TableCell>
                <TableCell>Evaluador</TableCell>
                <TableCell>Puntuación</TableCell>
                <TableCell>Comentarios</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {evaluaciones.map((evaluacion) => (
                <TableRow key={evaluacion.id} hover>
                  <TableCell>
                    <Typography variant="body1" fontWeight="bold">
                      {evaluacion.periodo_evaluacion}
                    </Typography>
                  </TableCell>
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
                    <Typography variant="body2" sx={{ maxWidth: 300 }}>
                      {evaluacion.comentarios || 'Sin comentarios'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {evaluaciones.length === 0 && (
          <Box p={3} textAlign="center">
            <Typography variant="body1" color="text.secondary">
              No tienes evaluaciones de desempeño registradas.
            </Typography>
          </Box>
        )}
      </Card>
    </Box>
  );
};

export default MiEvaluaciones;