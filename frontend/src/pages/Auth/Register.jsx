import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  MenuItem,
  Grid,
  FormControl,
  InputLabel,
  Select,
  IconButton,
} from '@mui/material';
import {
  Person,
  Email,
  Lock,
  Phone,
  AssignmentInd,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useSnackbar } from 'notistack';
import { authService } from '../../services/Api';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nombre: '',
    apellido: '',
    telefono: '',
    rol_id: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      setLoadingRoles(true);
      const response = await authService.getRoles();
      if (response.success) {
        setRoles(response.data);
      } else {
        setError('Error al cargar los roles: ' + response.error);
      }
    } catch (error) {
      console.error('Error cargando roles:', error);
      setError('Error de conexión al cargar roles');
    } finally {
      setLoadingRoles(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validaciones frontend
    if (!formData.email || !formData.password || !formData.nombre || !formData.apellido || !formData.rol_id) {
      setError('Todos los campos marcados con * son requeridos');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }

    // Validación de email institucional (opcional)
    if (!formData.email.endsWith('@instituto.edu')) {
      setError('Solo se permiten emails institucionales (@instituto.edu)');
      setLoading(false);
      return;
    }

    try {
      const { confirmPassword, ...userData } = formData;
      
      console.log('Enviando datos de registro:', userData);
      
      const response = await authService.register(userData);
      
      if (response.success) {
        enqueueSnackbar('Usuario registrado exitosamente', { variant: 'success' });
        setFormData({
          email: '',
          password: '',
          confirmPassword: '',
          nombre: '',
          apellido: '',
          telefono: '',
          rol_id: ''
        });
        // Opcional: redirigir a lista de usuarios después de 2 segundos
        setTimeout(() => {
          navigate('/empleados');
        }, 2000);
      } else {
        setError(response.error || 'Error al registrar usuario');
      }
    } catch (err) {
      console.error('Error completo en registro:', err);
      setError(err.response?.data?.error || 'Error de conexión con el servidor');
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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, margin: '0 auto' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center" color="primary">
            Registrar Nuevo Usuario
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }} align="center">
            Complete la información para registrar un nuevo usuario en el sistema
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Información Personal */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nombre *"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Apellido *"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email Institucional *"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  helperText="Debe terminar con @instituto.edu"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Teléfono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Rol y Contraseñas */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth disabled={loading || loadingRoles} required>
                  <InputLabel>Rol *</InputLabel>
                  <Select
                    name="rol_id"
                    value={formData.rol_id}
                    onChange={handleChange}
                    label="Rol *"
                    startAdornment={
                      <InputAdornment position="start">
                        <AssignmentInd color="action" />
                      </InputAdornment>
                    }
                  >
                    {loadingRoles ? (
                      <MenuItem disabled>Cargando roles...</MenuItem>
                    ) : (
                      roles.map((rol) => (
                        <MenuItem key={rol.id} value={rol.id}>
                          {rol.nombre} - {rol.descripcion}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Contraseña *"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  helperText="Mínimo 6 caracteres, con mayúsculas, minúsculas y números"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={togglePasswordVisibility}
                          edge="end"
                          disabled={loading}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Confirmar Contraseña *"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={toggleConfirmPasswordVisibility}
                          edge="end"
                          disabled={loading}
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                onClick={() => navigate('/empleados')}
                disabled={loading}
                variant="outlined"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                size="large"
                sx={{ minWidth: 120 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Registrar'}
              </Button>
            </Box>
          </form>
        </Paper>
      </motion.div>
    </Box>
  );
};

export default Register;