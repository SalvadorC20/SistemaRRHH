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
  Paper,
  Chip,
  Alert,
} from '@mui/material';
import { horariosService } from '../../services/Api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const DIAS_SEMANA = {
  LUNES: 'Lunes',
  MARTES: 'Martes',
  MIERCOLES: 'Miércoles',
  JUEVES: 'Jueves',
  VIERNES: 'Viernes',
  SABADO: 'Sábado',
  DOMINGO: 'Domingo'
};

const MisHorarios = () => {
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMisHorarios();
  }, []);

  const loadMisHorarios = async () => {
    try {
      const response = await horariosService.getMisHorarios();
      if (response.success) {
        setHorarios(response.data);
      }
    } catch (error) {
      setError('Error cargando horarios');
      console.error('Error cargando horarios:', error);
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
        Mis Horarios
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Día</strong></TableCell>
                <TableCell><strong>Hora de Entrada</strong></TableCell>
                <TableCell><strong>Hora de Salida</strong></TableCell>
                <TableCell><strong>Estado</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {horarios.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Typography variant="body1" color="text.secondary">
                      No hay horarios asignados
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                horarios.map((horario) => (
                  <TableRow key={horario.id}>
                    <TableCell>
                      <Typography fontWeight="medium">
                        {DIAS_SEMANA[horario.dia_semana]}
                      </Typography>
                    </TableCell>
                    <TableCell>{horario.hora_entrada}</TableCell>
                    <TableCell>{horario.hora_salida}</TableCell>
                    <TableCell>
                      <Chip 
                        label="Activo" 
                        color="success" 
                        size="small" 
                        variant="outlined"
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
};

export default MisHorarios;