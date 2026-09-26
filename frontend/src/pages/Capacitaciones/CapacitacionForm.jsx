import React, { useState } from 'react';
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
import { useNavigate } from 'react-router-dom';
import { capacitacionesService } from '../../services/Api';
import { ESTADOS_CAPACITACION } from '../../utils/constants';

const CapacitacionForm = () => {
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await capacitacionesService.create(formData);
      if (response.success) {
        navigate('/capacitaciones/gestion');
      }
    } catch (error) {
      setError(error.message || 'Error al crear capacitación');
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

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Nueva Capacitación
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
                value={formData.nombre}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descripción"
                name="descripcion"
                value={formData.descripcion}
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
                value={formData.fecha_inicio}
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
                value={formData.fecha_fin}
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
                value={formData.estado}
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
                value={formData.duracion_horas}
                onChange={handleChange}
                inputProps={{ min: 1 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Instructor"
                name="instructor"
                value={formData.instructor}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Ubicación"
                name="ubicacion"
                value={formData.ubicacion}
                onChange={handleChange}
              />
            </Grid>
            {/* AÑADIDO: Campo para material_url */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="URL de Materiales"
                name="material_url"
                value={formData.material_url}
                onChange={handleChange}
                helperText="Enlace a documentos, presentaciones o recursos de la capacitación"
                placeholder="https://ejemplo.com/materiales"
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Crear Capacitación'}
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/capacitaciones/gestion')}
            >
              Cancelar
            </Button>
          </Box>
        </form>
      </Card>
    </Box>
  );
};

export default CapacitacionForm;