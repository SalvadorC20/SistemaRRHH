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
import { useNavigate, useParams } from 'react-router-dom';
import { empleadosService, authService } from '../../services/Api';
import { TIPOS_CONTRATO } from '../../utils/constants';

const EditarEmpleado = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    codigo_empleado: '',
    fecha_contratacion: '',
    tipo_contrato: '',
    salario_base: '',
    departamento: '',
    puesto: '',
    usuario_id: '',
    activo: true
  });
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadEmpleadoData();
    loadUsuarios();
  }, [id]);

  const loadEmpleadoData = async () => {
    try {
      setLoadingData(true);
      const response = await empleadosService.getById(id);
      if (response.success) {
        const empleado = response.data;
        setFormData({
          codigo_empleado: empleado.codigo_empleado || '',
          fecha_contratacion: empleado.fecha_contratacion ? empleado.fecha_contratacion.split('T')[0] : '',
          tipo_contrato: empleado.tipo_contrato || '',
          salario_base: empleado.salario_base || '',
          departamento: empleado.departamento || '',
          puesto: empleado.puesto || '',
          usuario_id: empleado.usuario_id || '',
          activo: empleado.activo !== undefined ? empleado.activo : true
        });
      } else {
        setError('No se pudo cargar la información del empleado');
      }
    } catch (error) {
      setError('Error al cargar datos del empleado');
      console.error('Error cargando empleado:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const loadUsuarios = async () => {
    try {
      const response = await authService.getUsers();
      if (response.success) {
        // Filtrar usuarios que no tienen empleado asignado o que son el usuario actual
        const usuariosFiltrados = response.data.filter(usuario => 
          !usuario.empleado_id || usuario.empleado_id === parseInt(id)
        );
        setUsuarios(usuariosFiltrados);
      }
    } catch (error) {
      console.error('Error cargando usuarios:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validar que todos los campos requeridos estén llenos
    const camposRequeridos = ['codigo_empleado', 'fecha_contratacion', 'tipo_contrato', 'salario_base', 'departamento', 'puesto', 'usuario_id'];
    const camposVacios = camposRequeridos.filter(campo => !formData[campo]);

    if (camposVacios.length > 0) {
      setError('Por favor complete todos los campos requeridos');
      setLoading(false);
      return;
    }

    try {
      const response = await empleadosService.update(id, formData);
      if (response.success) {
        navigate('/empleados');
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Error al actualizar empleado');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? e.target.checked : value
    });
  };

  if (loadingData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Editar Empleado
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
                label="Código de Empleado *"
                name="codigo_empleado"
                value={formData.codigo_empleado}
                onChange={handleChange}
                required
                disabled // El código no debería cambiarse
                helperText="El código de empleado no se puede modificar"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Fecha de Contratación *"
                name="fecha_contratacion"
                type="date"
                value={formData.fecha_contratacion}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Tipo de Contrato *"
                name="tipo_contrato"
                value={formData.tipo_contrato}
                onChange={handleChange}
                required
              >
                {TIPOS_CONTRATO.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Salario Base *"
                name="salario_base"
                type="number"
                value={formData.salario_base}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: <span>C$</span>,
                }}
                helperText="Salario mensual en córdobas"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Departamento *"
                name="departamento"
                value={formData.departamento}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Puesto *"
                name="puesto"
                value={formData.puesto}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Estado del Empleado *"
                name="activo"
                value={formData.activo}
                onChange={handleChange}
                required
              >
                <MenuItem value={true}>ACTIVO</MenuItem>
                <MenuItem value={false}>INACTIVO</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Usuario Asociado *"
                name="usuario_id"
                value={formData.usuario_id}
                onChange={handleChange}
                required
                disabled // El usuario no debería cambiarse después de creado
                helperText="El usuario asociado no se puede modificar"
              >
                {usuarios.map((usuario) => (
                  <MenuItem key={usuario.id} value={usuario.id}>
                    {usuario.nombre} {usuario.apellido} - {usuario.email}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              size="large"
            >
              {loading ? <CircularProgress size={24} /> : 'Actualizar Empleado'}
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/empleados')}
              size="large"
            >
              Cancelar
            </Button>
            <Button
              variant="text"
              onClick={() => navigate(`/empleados/${id}`)}
              size="large"
            >
              Ver Detalles
            </Button>
          </Box>

          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              * Campos obligatorios
            </Typography>
          </Box>
        </form>
      </Card>
    </Box>
  );
};

export default EditarEmpleado;