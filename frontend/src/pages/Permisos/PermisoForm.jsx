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
  Stepper,
  Step,
  StepLabel,
  Paper,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { permisosService } from '../../services/Api';
import { TIPOS_PERMISO } from '../../utils/constants';
import { validateDates } from '../../services/Api';

const steps = ['Información básica', 'Fechas', 'Motivo'];

const PermisoForm = () => {
  const [formData, setFormData] = useState({
    tipo_permiso: '',
    fecha_inicio: '',
    fecha_fin: '',
    motivo: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();

  // Validar fechas cuando cambien
  useEffect(() => {
    if (formData.fecha_inicio && formData.fecha_fin) {
      const dateError = validateDates(formData.fecha_inicio, formData.fecha_fin);
      if (dateError) {
        setFieldErrors(prev => ({ ...prev, fecha_fin: dateError }));
      } else {
        setFieldErrors(prev => ({ ...prev, fecha_fin: '' }));
      }
    }
  }, [formData.fecha_inicio, formData.fecha_fin]);

  const validateStep = (step) => {
    const errors = {};
    
    switch (step) {
      case 0:
        if (!formData.tipo_permiso) {
          errors.tipo_permiso = 'El tipo de permiso es requerido';
        }
        break;
      case 1:
        if (!formData.fecha_inicio) {
          errors.fecha_inicio = 'La fecha de inicio es requerida';
        }
        if (!formData.fecha_fin) {
          errors.fecha_fin = 'La fecha fin es requerida';
        }
        if (fieldErrors.fecha_fin) {
          errors.fecha_fin = fieldErrors.fecha_fin;
        }
        break;
      case 2:
        if (!formData.motivo || formData.motivo.trim().length < 10) {
          errors.motivo = 'El motivo debe tener al menos 10 caracteres';
        }
        break;
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!validateStep(activeStep)) {
      setLoading(false);
      return;
    }

    try {
      const response = await permisosService.solicitar(formData);
      if (response.success) {
        navigate('/permisos', { 
          state: { 
            message: 'Permiso solicitado exitosamente',
            severity: 'success'
          }
        });
      } else {
        throw new Error(response.error || 'Error al solicitar permiso');
      }
    } catch (error) {
      console.error('Error solicitando permiso:', error);
      setError(error.message || 'Error al solicitar permiso');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo cuando se modifica
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <TextField
            fullWidth
            select
            label="Tipo de Permiso"
            name="tipo_permiso"
            value={formData.tipo_permiso}
            onChange={handleChange}
            error={!!fieldErrors.tipo_permiso}
            helperText={fieldErrors.tipo_permiso}
            required
          >
            {TIPOS_PERMISO.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        );
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Fecha Inicio"
                name="fecha_inicio"
                type="date"
                value={formData.fecha_inicio}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                error={!!fieldErrors.fecha_inicio}
                helperText={fieldErrors.fecha_inicio}
                required
                inputProps={{ 
                  min: new Date().toISOString().split('T')[0] 
                }}
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
                error={!!fieldErrors.fecha_fin}
                helperText={fieldErrors.fecha_fin}
                required
                inputProps={{ 
                  min: formData.fecha_inicio || new Date().toISOString().split('T')[0]
                }}
              />
            </Grid>
            {formData.fecha_inicio && formData.fecha_fin && !fieldErrors.fecha_fin && (
              <Grid item xs={12}>
                <Alert severity="info">
                  Duración: {Math.ceil((new Date(formData.fecha_fin) - new Date(formData.fecha_inicio)) / (1000 * 3600 * 24)) + 1} días
                </Alert>
              </Grid>
            )}
          </Grid>
        );
      case 2:
        return (
          <TextField
            fullWidth
            label="Motivo"
            name="motivo"
            value={formData.motivo}
            onChange={handleChange}
            multiline
            rows={4}
            error={!!fieldErrors.motivo}
            helperText={fieldErrors.motivo || `Mínimo 10 caracteres (${formData.motivo.length}/10)`}
            required
            placeholder="Describe detalladamente el motivo de tu solicitud de permiso..."
          />
        );
      default:
        return 'Paso desconocido';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Solicitar Permiso
      </Typography>

      <Card sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <form onSubmit={handleSubmit}>
          <Box sx={{ mb: 3 }}>
            {getStepContent(activeStep)}
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              Anterior
            </Button>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/permisos')}
              >
                Cancelar
              </Button>
              
              {activeStep === steps.length - 1 ? (
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Solicitar Permiso'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                >
                  Siguiente
                </Button>
              )}
            </Box>
          </Box>
        </form>
      </Card>
    </Box>
  );
};

export default PermisoForm;