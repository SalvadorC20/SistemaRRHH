import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import { Lock, Visibility, VisibilityOff } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { authService } from '../../services/Api';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    validateToken();
  }, [token]);

  const validateToken = async () => {
    try {
      const response = await authService.validateResetToken(token);
      if (!response.success) {
        setError('El enlace de restablecimiento es inválido o ha expirado');
      }
    } catch (err) {
      setError('Error validando el enlace de restablecimiento');
    } finally {
      setValidating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await authService.resetPassword({
        token,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword
      });

      if (response.success) {
        setMessage('Contraseña restablecida exitosamente');
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error && !validating) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0A3D62 0%, #3C6382 100%)',
        }}
      >
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button onClick={() => navigate('/forgot-password')}>
            Solicitar Nuevo Enlace
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0A3D62 0%, #3C6382 100%)',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Paper
          elevation={24}
          sx={{
            p: 5,
            width: 440,
            borderRadius: 4,
            background: 'linear-gradient(145deg, #ffffff 0%, #f7f9fb 100%)',
            textAlign: 'center',
          }}
        >
          <Typography variant="h4" fontWeight="700" gutterBottom>
            Nueva Contraseña
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Ingresa y confirma tu nueva contraseña
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {message && (
            <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
              {message}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Nueva Contraseña"
              type={showPassword ? 'text' : 'password'}
              value={formData.newPassword}
              onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
              margin="normal"
              required
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: '#0A3D62', opacity: 0.8 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment 
                    position="end"
                    sx={{ cursor: 'pointer' }}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Confirmar Contraseña"
              type={showPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              margin="normal"
              required
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: '#0A3D62', opacity: 0.8 }} />
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
                mt: 3,
                py: 1.5,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #0A3D62 0%, #3C6382 100%)',
              }}
            >
              {loading ? (
                <CircularProgress size={24} sx={{ color: 'white' }} />
              ) : (
                'Restablecer Contraseña'
              )}
            </Button>
          </form>
        </Paper>
      </motion.div>
    </Box>
  );
};

export default ResetPassword;