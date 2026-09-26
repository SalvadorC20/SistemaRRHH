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
  Divider,
  Chip,
  useMediaQuery
} from '@mui/material';
import {
  Login as LoginIcon,
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  RocketLaunch,
  AutoMode
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useSnackbar } from 'notistack';
import DemoSelectorModal from '../../components/Auth/DemoSelectorModal';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [loadingDemoRole, setLoadingDemoRole] = useState(null);

  const { login, loginAsDemo } = useAuth();
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
        if (result.status === 401 || result.statusCode === 401) {
          setError('Credenciales inválidas. Verifique su email y contraseña.');
        } else if (result.status === 400) {
          setError(result.error || 'Datos de entrada inválidos');
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

  const handleSelectDemoRole = async (account) => {
    setLoadingDemoRole(account.roleKey);
    try {
      const result = await loginAsDemo(account.user.email, 'password123');
      if (result.success) {
        enqueueSnackbar(`¡Bienvenido al Modo Demo como ${account.roleName}!`, { variant: 'success' });
        setDemoModalOpen(false);
        navigate('/dashboard');
      } else {
        enqueueSnackbar(result.error || 'No se pudo iniciar sesión demo', { variant: 'error' });
      }
    } catch (err) {
      console.error('Error al ingresar como demo:', err);
      enqueueSnackbar('Error de conexión al iniciar demo', { variant: 'error' });
    } finally {
      setLoadingDemoRole(null);
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
          maxWidth: isMobile ? '95vw' : 480,
        }}
      >
        <Paper
          elevation={10}
          sx={{
            p: isMobile ? 3 : 5,
            borderRadius: 5,
            backdropFilter: 'blur(12px)',
            background: 'rgba(255,255,255,0.96)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
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
                width: isMobile ? '180px' : '250px',
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
                fontWeight: 800,
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

          {/* Botón Destacado de Modo Demo */}
          <Box sx={{ mb: 3 }}>
            <Button
              fullWidth
              variant="outlined"
              size="large"
              onClick={() => setDemoModalOpen(true)}
              disabled={loading || Boolean(loadingDemoRole)}
              startIcon={<RocketLaunch sx={{ color: '#0A3D62' }} />}
              sx={{
                py: 1.3,
                borderRadius: 30,
                fontSize: '0.98rem',
                fontWeight: 800,
                color: '#003B5A',
                borderColor: '#0A3D62',
                borderWidth: 2,
                background: 'linear-gradient(135deg, rgba(0,59,90,0.06), rgba(10,61,98,0.12))',
                boxShadow: '0 4px 14px rgba(0,59,90,0.12)',
                transition: 'all 0.3s ease',
                textTransform: 'none',
                '&:hover': {
                  borderWidth: 2,
                  borderColor: '#003B5A',
                  background: 'linear-gradient(135deg, rgba(0,59,90,0.12), rgba(10,61,98,0.2))',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(0,59,90,0.2)',
                },
              }}
            >
              🚀 Acceso Modo Demo (Reclutadores)
            </Button>
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                textAlign: 'center',
                color: '#64748b',
                mt: 0.8,
                fontSize: '0.78rem'
              }}
            >
              Prueba roles con 1 clic (se restablece limpio al salir)
            </Typography>
          </Box>

          <Divider sx={{ my: 2.5 }}>
            <Chip label="O ingresa con tus credenciales" size="small" sx={{ fontSize: '0.75rem', color: '#64748b' }} />
          </Divider>

          {/* Error */}
          {error && (
            <Alert
              severity="error"
              sx={{ mb: 3, borderRadius: 2 }}
            >
              {error}
            </Alert>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Correo Electrónico"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              margin="normal"
              required
              disabled={loading || Boolean(loadingDemoRole)}
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
              disabled={loading || Boolean(loadingDemoRole)}
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
              disabled={loading || Boolean(loadingDemoRole)}
              sx={{
                mt: 3.5,
                py: 1.4,
                borderRadius: 30,
                fontSize: '1.05rem',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #003B5A, #0A3D62)',
                boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
                textTransform: 'none',
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
              mt: 3.5,
              opacity: 0.7,
            }}
          >
            © 2025 Instituto Dr. Carlos Vega Bolaños — Todos los derechos reservados
          </Typography>
        </Paper>
      </motion.div>

      {/* Modal Interactivo de Selección de Rol Demo */}
      <DemoSelectorModal
        open={demoModalOpen}
        onClose={() => setDemoModalOpen(false)}
        onSelectRole={handleSelectDemoRole}
        loadingRole={loadingDemoRole}
      />
    </Box>
  );
};

export default Login;
