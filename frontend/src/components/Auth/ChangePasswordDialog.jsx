import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Box,
  Typography,
} from '@mui/material';
import { Close, Lock, Visibility, VisibilityOff } from '@mui/icons-material';
import { authService } from '../../services/Api';

const ChangePasswordDialog = ({ open, onClose }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    // Validación frontend antes de enviar
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setError('Todos los campos son requeridos');
      setLoading(false);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Las nuevas contraseñas no coinciden');
      setLoading(false);
      return;
    }

    if (formData.newPassword.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres');
      setLoading(false);
      return;
    }

    try {
      console.log('Enviando datos:', formData); // Para debug
      
      const response = await authService.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword
      });

      console.log('Respuesta del servidor:', response); // Para debug

      if (response.success) {
        setMessage('Contraseña actualizada exitosamente');
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setTimeout(() => {
          onClose();
          setMessage('');
        }, 2000);
      } else {
        setError(response.error || 'Error al cambiar la contraseña');
      }
    } catch (err) {
      console.error('Error completo:', err); // Para debug
      setError(err.response?.data?.error || 'Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setError('');
    setMessage('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Cambiar Contraseña</Typography>
          <IconButton onClick={handleClose} disabled={loading}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {message && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {message}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Contraseña Actual"
            type={showPassword ? 'text' : 'password'}
            value={formData.currentPassword}
            onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
            margin="normal"
            required
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock color="action" />
                </InputAdornment>
              ),
            }}
            error={!!error && !formData.currentPassword}
          />

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
                  <Lock color="action" />
                </InputAdornment>
              ),
            }}
            helperText="Mínimo 8 caracteres, con mayúscula, minúscula, número y carácter especial"
            error={!!error && !formData.newPassword}
          />

          <TextField
            fullWidth
            label="Confirmar Nueva Contraseña"
            type={showPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
            margin="normal"
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
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    disabled={loading}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            error={!!error && !formData.confirmPassword}
          />
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{ minWidth: 120 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Cambiar Contraseña'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ChangePasswordDialog;