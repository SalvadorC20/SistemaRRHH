import React, { useState } from 'react';
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
import { Email, ArrowBack } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/Api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await authService.forgotPassword(email);
      if (response.success) {
        setMessage(response.message);
        setEmail('');
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

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
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/login')}
            sx={{ mb: 2, alignSelf: 'flex-start' }}
          >
            Volver al Login
          </Button>

          <Typography variant="h4" fontWeight="700" gutterBottom>
            Recuperar Contraseña
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Ingresa tu email para recibir un enlace de restablecimiento
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
              label="Correo Electrónico"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: '#0A3D62', opacity: 0.8 }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': { borderColor: '#0A3D62' },
                  '&.Mui-focused fieldset': { borderColor: '#0A3D62' },
                },
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
                'Enviar Enlace de Recuperación'
              )}
            </Button>
          </form>
        </Paper>
      </motion.div>
    </Box>
  );
};

export default ForgotPassword;