
import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    MenuItem,
    Grid,
    Alert,
    CircularProgress,
    IconButton,
    Box,
    Typography
} from '@mui/material';
import { Close as CloseIcon, PersonAdd as PersonAddIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/Api';

const RegisterForm = ({ open, onClose }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        nombre: '',
        apellido: '',
        telefono: '',
        rol_id: ''
    });
    const [roles, setRoles] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        if (open && user?.rol === 'ADMIN_RRHH') {
            cargarRoles();
        }
    }, [open, user]);

    const cargarRoles = async () => {
        try {
            // Roles disponibles para que ADMIN_RRHH pueda crear
            setRoles([
                { id: 2, nombre: 'DIRECTIVO', descripcion: 'Directivo del Instituto' },
                { id: 3, nombre: 'DOCENTE', descripcion: 'Personal Docente' },
                { id: 4, nombre: 'PERSONAL_APOYO', descripcion: 'Personal de Apoyo' }
            ]);
        } catch (error) {
            console.error('Error cargando roles:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Validaciones
        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            setLoading(false);
            return;
        }

        if (formData.password.length < 8) {
            setError('La contraseña debe tener al menos 8 caracteres');
            setLoading(false);
            return;
        }

        try {
            const { confirmPassword, ...datosRegistro } = formData;
            await authService.register(datosRegistro);
            
            // Limpiar y cerrar
            setFormData({
                email: '',
                password: '',
                confirmPassword: '',
                nombre: '',
                apellido: '',
                telefono: '',
                rol_id: ''
            });
            onClose();
            
        } catch (err) {
            setError(err.response?.data?.error || 'Error al crear usuario');
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

    // Solo ADMIN_RRHH puede ver este componente
    if (user?.rol !== 'ADMIN_RRHH') {
        return null;
    }

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="md"
            fullWidth
        >
            <DialogTitle>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box display="flex" alignItems="center">
                        <PersonAddIcon sx={{ mr: 1 }} />
                        <Typography variant="h6">Registrar Nuevo Usuario</Typography>
                    </Box>
                    <IconButton onClick={onClose}>
                        <CloseIcon />
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

                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Nombre"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                required
                                margin="normal"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Apellido"
                                name="apellido"
                                value={formData.apellido}
                                onChange={handleChange}
                                required
                                margin="normal"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                margin="normal"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Contraseña"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                margin="normal"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Confirmar Contraseña"
                                name="confirmPassword"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                margin="normal"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Teléfono"
                                name="telefono"
                                value={formData.telefono}
                                onChange={handleChange}
                                margin="normal"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                select
                                label="Rol"
                                name="rol_id"
                                value={formData.rol_id}
                                onChange={handleChange}
                                required
                                margin="normal"
                            >
                                {roles.map((rol) => (
                                    <MenuItem key={rol.id} value={rol.id}>
                                        {rol.descripcion}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                    </Grid>
                </DialogContent>

                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={onClose} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button 
                        type="submit" 
                        variant="contained" 
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Registrar Usuario'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default RegisterForm;