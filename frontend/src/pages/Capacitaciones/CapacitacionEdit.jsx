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
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { capacitacionesService } from '../../services/Api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDateForInput } from '../../utils/formatters'; // Asegúrate de tener esta función

const ESTADOS_CAPACITACION = {
  PLANIFICADA: 'Planificada',
  EN_CURSO: 'En Curso',
  COMPLETADA: 'Completada',
  CANCELADA: 'Cancelada'
};

const CapacitacionEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    fecha_inicio: '',
    fecha_fin: '',
    estado: 'PLANIFICADA',
    instructor: '',
    ubicacion: '',
    duracion_horas: '',
    material_url: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCapacitacion();
  }, [id]);

  const loadCapacitacion = async () => {
    try {
      const response = await capacitacionesService.getById(id);
      if (response.success) {
        // Filtrar solo los campos que se pueden actualizar
        const {
          id: capacitacionId, // Excluir el id
          created_at,
          updated_at,
          participantes_count,
          asistentes_count,
          empleados_asignados,
          empleados_no_asignados,
          ...datosParaForm
        } = response.data;

        // Formatear fechas para input type="date"
        const datosFormateados = {
          ...datosParaForm,
          fecha_inicio: formatDateForInput(datosParaForm.fecha_inicio),
          fecha_fin: formatDateForInput(datosParaForm.fecha_fin)
        };

        setFormData(datosFormateados);
      }
    } catch (error) {
      console.error('Error cargando capacitación:', error);
      setError('Error cargando capacitación: ' + (error.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      // Crear un objeto con SOLO los campos permitidos
      const camposPermitidos = [
        'nombre', 'descripcion', 'fecha_inicio', 'fecha_fin',
        'estado', 'instructor', 'ubicacion', 'duracion_horas'
      ];

      const datosParaEnviar = {};
      camposPermitidos.forEach(campo => {
        if (formData[campo] !== undefined) {
          datosParaEnviar[campo] = formData[campo];
        }
      });


      if (datosParaEnviar.duracion_horas) {
        datosParaEnviar.duracion_horas = parseInt(datosParaEnviar.duracion_horas);
      }

      await capacitacionesService.update(id, datosParaEnviar);
      navigate(`/capacitaciones/${id}`);
    } catch (error) {
      console.error('Error actualizando capacitación:', error);
      setError(error.message || 'Error al actualizar la capacitación');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Editar Capacitación
      </Typography>

      <Card sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nombre de la Capacitación"
                name="nombre"
                value={formData.nombre || ''}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descripción"
                name="descripcion"
                value={formData.descripcion || ''}
                onChange={handleChange}
                multiline
                rows={3}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Fecha Inicio"
                name="fecha_inicio"
                type="date"
                value={formData.fecha_inicio || ''}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Fecha Fin"
                name="fecha_fin"
                type="date"
                value={formData.fecha_fin || ''}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Estado"
                name="estado"
                value={formData.estado || 'PLANIFICADA'}
                onChange={handleChange}
                required
              >
                {Object.entries(ESTADOS_CAPACITACION).map(([key, value]) => (
                  <MenuItem key={key} value={key}>
                    {value}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Duración (horas)"
                name="duracion_horas"
                type="number"
                value={formData.duracion_horas || ''}
                onChange={handleChange}
                inputProps={{ min: 1 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Instructor"
                name="instructor"
                value={formData.instructor || ''}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Ubicación"
                name="ubicacion"
                value={formData.ubicacion || ''}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="URL de Materiales"
                name="material_url"
                value={formData.material_url || ''}
                onChange={handleChange}
                helperText="Enlace a documentos, presentaciones o recursos de la capacitación"
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={saving}
            >
              {saving ? <CircularProgress size={24} /> : 'Guardar Cambios'}
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate(`/capacitaciones/${id}`)}
            >
              Cancelar
            </Button>
          </Box>
        </form>
      </Card>
    </Box>
  );
};

export default CapacitacionEdit;