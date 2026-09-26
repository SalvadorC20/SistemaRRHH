import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  Grid,
  Chip,
  Button,
  Divider,
  Alert,
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Person as PersonIcon,
  Work as WorkIcon 
} from '@mui/icons-material';
import { empleadosService } from '../../services/Api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate, formatCurrency, getStatusColor } from '../../utils/formatters';

const EmpleadoDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [empleado, setEmpleado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadEmpleado();
  }, [id]);

  const loadEmpleado = async () => {
    try {
      const response = await empleadosService.getById(id);
      if (response.success) {
        setEmpleado(response.data);
      } else {
        setError('No se pudo cargar la información del empleado');
      }
    } catch (error) {
      console.error('Error cargando empleado:', error);
      setError('Error al cargar la información del empleado');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/empleados/editar/${id}`);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!empleado) {
    return (
      <Box>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/empleados')}
          >
            Volver
          </Button>
          <Typography variant="h4" component="h1">
            Empleado no encontrado
          </Typography>
        </Box>
        <Alert severity="error">
          El empleado solicitado no existe o no se pudo cargar.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/empleados')}
        >
          Volver
        </Button>
        <Typography variant="h4" component="h1">
          Detalle del Empleado
        </Typography>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={handleEdit}
          sx={{ ml: 'auto' }}
        >
          Editar
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Información Personal */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <PersonIcon color="primary" />
              <Typography variant="h6">
                Información Personal
              </Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Código de Empleado
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  {empleado.codigo_empleado}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Nombre
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {empleado.nombre}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Apellido
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {empleado.apellido}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Email
                </Typography>
                <Typography variant="body1">
                  {empleado.email}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Teléfono
                </Typography>
                <Typography variant="body1">
                  {empleado.telefono || 'No especificado'}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Rol en el Sistema
                </Typography>
                <Chip
                  label={empleado.rol_nombre}
                  color="primary"
                  variant="outlined"
                />
              </Grid>
            </Grid>
          </Card>
        </Grid>

        {/* Información Laboral */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <WorkIcon color="primary" />
              <Typography variant="h6">
                Información Laboral
              </Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Departamento
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {empleado.departamento}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Puesto
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {empleado.puesto}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Tipo de Contrato
                </Typography>
                <Chip
                  label={empleado.tipo_contrato}
                  color={getStatusColor(empleado.tipo_contrato)}
                  size="small"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Fecha de Contratación
                </Typography>
                <Typography variant="body1">
                  {formatDate(empleado.fecha_contratacion)}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Salario Base
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="success.main">
                  {formatCurrency(empleado.salario_base)}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Estado del Empleado
                </Typography>
                <Chip
                  label={empleado.estado_empleado || 'ACTIVO'}
                  color={getStatusColor(empleado.estado_empleado)}
                  size="medium"
                  variant="filled"
                />
                {empleado.estado_empleado === 'INACTIVO' && (
                  <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                    Este empleado está actualmente inactivo en el sistema.
                  </Typography>
                )}
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid>

      {/* Información Adicional */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Información del Sistema
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  ID del Empleado
                </Typography>
                <Typography variant="body1" fontFamily="monospace">
                  {empleado.id}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  ID del Usuario
                </Typography>
                <Typography variant="body1" fontFamily="monospace">
                  {empleado.usuario_id}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  Fecha de Creación
                </Typography>
                <Typography variant="body1">
                  {formatDate(empleado.created_at)}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  Última Actualización
                </Typography>
                <Typography variant="body1">
                  {empleado.updated_at ? formatDate(empleado.updated_at) : 'No actualizado'}
                </Typography>
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EmpleadoDetail;