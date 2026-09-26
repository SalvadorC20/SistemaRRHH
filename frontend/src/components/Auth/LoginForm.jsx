import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
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
  useMediaQuery
} from '@mui/material';
import {
  Login as LoginIcon,
  Email,
  Lock,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useSnackbar } from 'notistack';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const isMobile = useMediaQuery('(max-width:600px)');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.email || !formData.password) {
      setError('Email y contraseña son requeridos');
      setLoading(false);
      return;
    }

    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        enqueueSnackbar('¡Bienvenido!', { variant: 'success' });
        navigate('/dashboard');
      } else {
        // CORRECCIÓN: Usar el status code para determinar el mensaje
        if (result.status === 401) {
          setError('Credenciales inválidas. Verifique su email y contraseña.');
        } else if (result.status === 400) {
          // Para errores 400, mostrar el mensaje específico del backend
          setError(result.error || 'Datos de entrada inválidos');
        } else if (result.statusCode === 401) {
          // También verificar statusCode por si acaso
          setError('Credenciales inválidas. Verifique su email y contraseña.');
        } else {
          setError(result.error || 'Error al iniciar sesión');
        }
      }
    } catch (err) {
      console.error('Error inesperado en login:', err);
      setError('Error inesperado al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleClickShowPassword = () => setShowPassword(!showPassword);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(145deg, #003B5A, #0A3D62, #3C6382)',
        p: 2,
      }}
    >
      {/* Contenedor Animado */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          width: '100%',
          maxWidth: isMobile ? '95vw' : 450,
        }}
      >
        <Paper
          elevation={10}
          sx={{
            p: isMobile ? 3 : 5,
            borderRadius: 5,
            backdropFilter: 'blur(12px)',
            background: 'rgba(255,255,255,0.95)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
          }}
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: 20,
            }}
          >
            <img
              src="/logoInstituto.jpeg"
              alt="Logo Instituto"
              style={{
                width: isMobile ? '180px' : '260px',
                height: 'auto',
                objectFit: 'contain',
              }}
            />
          </motion.div>

          {/* Titulos */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography
              variant={isMobile ? "h5" : "h4"}
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(90deg, #003B5A, #0A3D62)',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
              }}
            >
              Sistema RRHH
            </Typography>

            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, opacity: 0.8 }}
            >
              Instituto Dr. Carlos Vega Bolaños
            </Typography>
          </Box>

          {/* Error */}
          {error && (
            <Alert
              severity="error"
              sx={{ mb: 3, borderRadius: 2 }}
            >
              {error}
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Correo Electrónico"
              type="text"  
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              margin="normal"
              required
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: '#003B5A' }} />
                  </InputAdornment>
                ),
              }}
            />


            <TextField
              fullWidth
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              margin="normal"
              required
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: '#003B5A' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end" onClick={handleClickShowPassword} sx={{ cursor: 'pointer' }}>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                mt: 4,
                py: 1.5,
                borderRadius: 30,
                fontSize: '1.1rem',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #003B5A, #0A3D62)',
                boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #00293D, #0A3D62)',
                },
              }}
            >
              {loading ? (
                <CircularProgress size={24} sx={{ color: 'white' }} />
              ) : (
                <>
                  <LoginIcon sx={{ mr: 1 }} />
                  Iniciar Sesión
                </>
              )}
            </Button>


          </form>

          {/* Footer */}
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              textAlign: 'center',
              mt: 4,
              opacity: 0.7,
            }}
          >
            © 2025 Instituto Dr. Carlos Vega Bolaños — Todos los derechos reservados
          </Typography>
        </Paper>
      </motion.div>
    </Box>
  );
};

export default Login;
