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
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { empleadosService, authService } from '../../services/Api';
import { TIPOS_CONTRATO } from '../../utils/constants';

const EmpleadoForm = () => {
  const [formData, setFormData] = useState({
    codigo_empleado: '',
    fecha_contratacion: '',
    tipo_contrato: '',
    salario_base: '',
    departamento: '',
    puesto: '',
    usuario_id: '',
    activo: true  // Valor por defecto
  });
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingUsuarios, setLoadingUsuarios] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadUsuariosDisponibles();
  }, []);

  const loadUsuariosDisponibles = async () => {
    try {
      setLoadingUsuarios(true);
      const response = await authService.getUsers();
      if (response.success) {
        // Filtrar usuarios activos que no tienen empleado asignado
        const usuariosDisponibles = response.data.filter(usuario => 
          usuario.activo && !usuario.empleado_id
        );
        setUsuarios(usuariosDisponibles);
        console.log('Usuarios disponibles:', usuariosDisponibles);
      }
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      setError('Error al cargar la lista de usuarios');
    } finally {
      setLoadingUsuarios(false);
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

    // Validar que se seleccionó un usuario
    if (!formData.usuario_id) {
      setError('Debe seleccionar un usuario para asociar al empleado');
      setLoading(false);
      return;
    }

    try {
      console.log('Enviando datos del empleado:', formData);
      
      // Convertir tipos de datos
      const datosParaEnviar = {
        ...formData,
        salario_base: parseFloat(formData.salario_base),
        usuario_id: parseInt(formData.usuario_id),
        activo: Boolean(formData.activo) // Asegurar que sea booleano
      };

      console.log('Datos convertidos:', datosParaEnviar);
      
      const response = await empleadosService.create(datosParaEnviar);
      
      if (response.success) {
        alert('Empleado creado exitosamente!');
        navigate('/empleados');
      } else {
        setError(response.error || 'Error al crear empleado');
      }
    } catch (err) {
      console.error('Error completo:', err);
      const errorMessage = err.response?.data?.error || 'Error al crear empleado';
      setError(errorMessage);
      
      // Mostrar detalles del error en consola para debug
      if (err.response?.data) {
        console.log('Respuesta del servidor:', err.response.data);
      }
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

  const generarCodigoEmpleado = () => {
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    setFormData({
      ...formData,
      codigo_empleado: `EMP-${randomNum}`
    });
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Nuevo Empleado
      </Typography>

      <Card sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Código de Empleado */}
            <Grid item xs={12} sm={6}>
              <Box display="flex" gap={1}>
                <TextField
                  fullWidth
                  label="Código de Empleado *"
                  name="codigo_empleado"
                  value={formData.codigo_empleado}
                  onChange={handleChange}
                  required
                  helperText="Ejemplo: EMP-001"
                />
                <Button 
                  variant="outlined" 
                  onClick={generarCodigoEmpleado}
                  sx={{ minWidth: 'auto', whiteSpace: 'nowrap' }}
                >
                  Generar
                </Button>
              </Box>
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
                  startAdornment: <span style={{ marginRight: 8 }}>C$</span>,
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
                helperText="Ejemplo: Recursos Humanos, Académico, etc."
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
                helperText="Ejemplo: Profesor de Matemáticas, Asistente Administrativo"
              />
            </Grid>

            {/* Estado del Empleado - OPCIONAL, puedes comentar esta sección si no es necesaria */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Estado del Empleado</InputLabel>
                <Select
                  name="activo"
                  value={formData.activo}
                  onChange={handleChange}
                  label="Estado del Empleado"
                >
                  <MenuItem value={true}>ACTIVO</MenuItem>
                  <MenuItem value={false}>INACTIVO</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Selección de Usuario */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required disabled={loadingUsuarios}>
                <InputLabel>Usuario Asociado *</InputLabel>
                <Select
                  name="usuario_id"
                  value={formData.usuario_id}
                  onChange={handleChange}
                  label="Usuario Asociado *"
                >
                  {loadingUsuarios ? (
                    <MenuItem disabled>
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      Cargando usuarios...
                    </MenuItem>
                  ) : usuarios.length === 0 ? (
                    <MenuItem disabled>
                      No hay usuarios disponibles. Primero registre un usuario.
                    </MenuItem>
                  ) : (
                    usuarios.map((usuario) => (
                      <MenuItem key={usuario.id} value={usuario.id}>
                        {usuario.nombre} {usuario.apellido} - {usuario.email} ({usuario.rol_nombre})
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                {usuarios.length === 0 
                  ? "Registre usuarios primero en 'Registrar Usuario'" 
                  : `${usuarios.length} usuario(s) disponible(s)`}
              </Typography>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={loading || loadingUsuarios || usuarios.length === 0}
              size="large"
            >
              {loading ? <CircularProgress size={24} /> : 'Crear Empleado'}
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
              onClick={() => navigate('/empleados/registrar')}
              size="large"
              sx={{ ml: 'auto' }}
            >
              Registrar Nuevo Usuario
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

export default EmpleadoForm;