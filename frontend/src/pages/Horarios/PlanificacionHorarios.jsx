import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  Grid,
  TextField,
  Button,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { horariosService, empleadosService } from '../../services/Api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const DIAS_SEMANA = [
  { value: 'LUNES', label: 'Lunes' },
  { value: 'MARTES', label: 'Martes' },
  { value: 'MIERCOLES', label: 'Miércoles' },
  { value: 'JUEVES', label: 'Jueves' },
  { value: 'VIERNES', label: 'Viernes' },
  { value: 'SABADO', label: 'Sábado' },
  { value: 'DOMINGO', label: 'Domingo' }
];

const PlanificacionHorarios = () => {
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();
  const [empleados, setEmpleados] = useState([]);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState('');
  const [horarios, setHorarios] = useState([]);
  const [horariosExistentes, setHorariosExistentes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingEmpleados, setLoadingEmpleados] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dialogoValidacion, setDialogoValidacion] = useState({
    open: false,
    conflictos: []
  });

  useEffect(() => {
    if (hasRole(['ADMIN_RRHH', 'DIRECTIVO'])) {
      loadEmpleados();
    }
  }, []);

  useEffect(() => {
    if (empleadoSeleccionado) {
      loadHorariosEmpleado();
    } else {
      setHorariosExistentes([]);
      inicializarHorarios();
    }
  }, [empleadoSeleccionado]);

  const loadEmpleados = async () => {
    try {
      const response = await empleadosService.getAll();
      if (response.success) {
        setEmpleados(response.data);
      }
    } catch (error) {
      console.error('Error cargando empleados:', error);
    } finally {
      setLoadingEmpleados(false);
    }
  };

  const loadHorariosEmpleado = async () => {
    try {
      const response = await horariosService.getByEmpleado(empleadoSeleccionado);
      if (response.success) {
        setHorariosExistentes(response.data);
        // Convertir horarios existentes al formato del formulario
        const horariosForm = DIAS_SEMANA.map(dia => {
          const horarioExistente = response.data.find(h => h.dia_semana === dia.value);
          return {
            dia_semana: dia.value,
            hora_entrada: horarioExistente?.hora_entrada || '',
            hora_salida: horarioExistente?.hora_salida || ''
          };
        });
        setHorarios(horariosForm);
      }
    } catch (error) {
      console.error('Error cargando horarios:', error);
      inicializarHorarios();
    }
  };

  const inicializarHorarios = () => {
    const horariosIniciales = DIAS_SEMANA.map(dia => ({
      dia_semana: dia.value,
      hora_entrada: '',
      hora_salida: ''
    }));
    setHorarios(horariosIniciales);
  };

  const handleHorarioChange = (index, campo, valor) => {
    const nuevosHorarios = [...horarios];
    nuevosHorarios[index][campo] = valor;
    setHorarios(nuevosHorarios);
  };

  const validarDisponibilidad = async () => {
    if (!empleadoSeleccionado) {
      setError('Debe seleccionar un empleado');
      return;
    }

    setLoading(true);
    try {
      const horariosFiltrados = horarios.filter(h => h.hora_entrada && h.hora_salida);
      
      const response = await horariosService.validarDisponibilidad(
        empleadoSeleccionado,
        horariosFiltrados
      );

      if (response.success) {
        if (response.data.disponible) {
          setSuccess('Horarios disponibles. Puede proceder a guardar.');
          setDialogoValidacion({ open: false, conflictos: [] });
        } else {
          setDialogoValidacion({
            open: true,
            conflictos: response.data.conflictos
          });
        }
      }
    } catch (error) {
      setError('Error validando disponibilidad');
    } finally {
      setLoading(false);
    }
  };

  const guardarHorarios = async () => {
    if (!empleadoSeleccionado) {
      setError('Debe seleccionar un empleado');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const horariosFiltrados = horarios.filter(h => h.hora_entrada && h.hora_salida);
      
      const response = await horariosService.guardarHorarios(
        empleadoSeleccionado,
        horariosFiltrados
      );

      if (response.success) {
        setSuccess('Horarios guardados exitosamente');
        loadHorariosEmpleado(); // Recargar horarios
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Error guardando horarios');
    } finally {
      setLoading(false);
    }
  };

  const cancelarCambios = () => {
    if (empleadoSeleccionado) {
      loadHorariosEmpleado();
    } else {
      inicializarHorarios();
    }
    setError('');
    setSuccess('');
  };

  if (loadingEmpleados && hasRole(['ADMIN_RRHH', 'DIRECTIVO'])) {
    return <LoadingSpinner />;
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Planificación de Horarios
      </Typography>

      <Card sx={{ p: 3, mb: 3 }}>
        {/* Seleccionar empleado (solo para admin/directivos) */}
        {hasRole(['ADMIN_RRHH', 'DIRECTIVO']) && (
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Seleccionar Empleado</InputLabel>
            <Select
              value={empleadoSeleccionado}
              label="Seleccionar Empleado"
              onChange={(e) => setEmpleadoSeleccionado(e.target.value)}
            >
              {empleados.map((empleado) => (
                <MenuItem key={empleado.id} value={empleado.id}>
                  {empleado.nombre} {empleado.apellido} - {empleado.codigo_empleado}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {/* Formulario de horarios */}
        <Typography variant="h6" gutterBottom>
          Definir Horarios y Turnos
        </Typography>
        
        <TableContainer component={Paper} sx={{ mb: 3 }}>
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
              {horarios.map((horario, index) => (
                <TableRow key={horario.dia_semana}>
                  <TableCell>
                    <Typography fontWeight="medium">
                      {DIAS_SEMANA.find(d => d.value === horario.dia_semana)?.label}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <TextField
                      type="time"
                      value={horario.hora_entrada}
                      onChange={(e) => handleHorarioChange(index, 'hora_entrada', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      type="time"
                      value={horario.hora_salida}
                      onChange={(e) => handleHorarioChange(index, 'hora_salida', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </TableCell>
                  <TableCell>
                    {horario.hora_entrada && horario.hora_salida ? (
                      <Chip 
                        label="Programado" 
                        color="success" 
                        size="small" 
                        variant="outlined"
                      />
                    ) : (
                      <Chip 
                        label="No programado" 
                        color="default" 
                        size="small" 
                        variant="outlined"
                      />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Botones de acción */}
        <Grid container spacing={2} justifyContent="flex-end">
          <Grid item>
            <Button
              variant="outlined"
              onClick={validarDisponibilidad}
              disabled={loading || !empleadoSeleccionado}
            >
              Validar Disponibilidad
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              onClick={cancelarCambios}
              disabled={loading}
            >
              Cancelar Cambios
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              onClick={guardarHorarios}
              disabled={loading || !empleadoSeleccionado}
            >
              {loading ? <CircularProgress size={24} /> : 'Guardar Planificación'}
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* Diálogo de validación de conflictos */}
      <Dialog 
        open={dialogoValidacion.open} 
        onClose={() => setDialogoValidacion({ open: false, conflictos: [] })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Conflictos de Horarios</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Se encontraron conflictos en los siguientes horarios:
          </Alert>
          {dialogoValidacion.conflictos.map((conflicto, index) => (
            <Box key={index} sx={{ mb: 2, p: 1, border: '1px solid #ff9800', borderRadius: 1 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                {DIAS_SEMANA.find(d => d.value === conflicto.dia)?.label}: {conflicto.horario}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Conflicto con horarios existentes
              </Typography>
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogoValidacion({ open: false, conflictos: [] })}>
            Entendido
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PlanificacionHorarios;