import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  TextField,
  Button,
  Grid,
  MenuItem,
  Alert,
  CircularProgress,
  Slider,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { evaluacionesService, empleadosService } from '../../services/Api';

const EvaluacionForm = () => {
  const [formData, setFormData] = useState({
    empleado_id: '',
    periodo_evaluacion: '',
    fecha_evaluacion: new Date().toISOString().split('T')[0],
    criterios: {
      puntualidad: 0,
      responsabilidad: 0,
      trabajo_equipo: 0,
      calidad_trabajo: 0,
      iniciativa: 0,
      comunicacion: 0,
    },
    comentarios: ''
  });
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadEmpleados();
  }, []);

  const loadEmpleados = async () => {
    try {
      const response = await empleadosService.getAll();
      if (response.success) {
        setEmpleados(response.data);
      }
    } catch (error) {
      console.error('Error cargando empleados:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Calcular puntuación total
      const criterios = Object.values(formData.criterios);
      const puntuacionTotal = criterios.reduce((sum, value) => sum + value, 0) / criterios.length;

      const datosEnvio = {
        ...formData,
        puntuacion_total: puntuacionTotal,
        criterios: JSON.stringify(formData.criterios)
      };

      const response = await evaluacionesService.crear(datosEnvio);
      if (response.success) {
        navigate('/evaluaciones/gestion');
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Error al crear evaluación');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCriterioChange = (criterio, value) => {
    setFormData({
      ...formData,
      criterios: {
        ...formData.criterios,
        [criterio]: value
      }
    });
  };

  const criterios = [
    { key: 'puntualidad', label: 'Puntualidad y Asistencia' },
    { key: 'responsabilidad', label: 'Responsabilidad' },
    { key: 'trabajo_equipo', label: 'Trabajo en Equipo' },
    { key: 'calidad_trabajo', label: 'Calidad del Trabajo' },
    { key: 'iniciativa', label: 'Iniciativa y Proactividad' },
    { key: 'comunicacion', label: 'Comunicación' },
  ];

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Nueva Evaluación de Desempeño
      </Typography>

      <Card sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Empleado"
                name="empleado_id"
                value={formData.empleado_id}
                onChange={handleChange}
                required
              >
                {empleados.map((empleado) => (
                  <MenuItem key={empleado.id} value={empleado.id}>
                    {empleado.nombre} {empleado.apellido} - {empleado.departamento}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Período de Evaluación"
                name="periodo_evaluacion"
                value={formData.periodo_evaluacion}
                onChange={handleChange}
                placeholder="Ej: Q1 2024, Enero 2024"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Fecha de Evaluación"
                name="fecha_evaluacion"
                type="date"
                value={formData.fecha_evaluacion}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
          </Grid>

          {/* Criterios de Evaluación */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Criterios de Evaluación
            </Typography>
            
            <Grid container spacing={3}>
              {criterios.map((criterio) => (
                <Grid item xs={12} key={criterio.key}>
                  <FormControl fullWidth>
                    <FormLabel>{criterio.label}</FormLabel>
                    <Box sx={{ px: 2 }}>
                      <Slider
                        value={formData.criterios[criterio.key]}
                        onChange={(e, newValue) => handleCriterioChange(criterio.key, newValue)}
                        valueLabelDisplay="auto"
                        step={10}
                        marks={[
                          { value: 0, label: '0' },
                          { value: 50, label: '50' },
                          { value: 100, label: '100' }
                        ]}
                        min={0}
                        max={100}
                      />
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="caption" color="text.secondary">
                        Necesita mejorar
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Excelente
                      </Typography>
                    </Box>
                  </FormControl>
                </Grid>
              ))}
            </Grid>
          </Box>

          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Comentarios Adicionales"
                name="comentarios"
                value={formData.comentarios}
                onChange={handleChange}
                multiline
                rows={4}
                placeholder="Comentarios generales sobre el desempeño del empleado..."
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Guardar Evaluación'}
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/evaluaciones/gestion')}
            >
              Cancelar
            </Button>
          </Box>
        </form>
      </Card>
    </Box>
  );
};

export default EvaluacionForm;