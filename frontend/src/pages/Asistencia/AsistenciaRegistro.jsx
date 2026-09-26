import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    TextField,
    Button,
    Grid,
    Alert,
    CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { asistenciaService } from '../../services/Api';
import { empleadosService } from '../../services/Api';

const AsistenciaRegistro = () => {
    const [formData, setFormData] = useState({
        fecha: new Date().toISOString().split('T')[0],
        hora_entrada: '',
        hora_salida: '',
        tipo_registro: 'NORMAL'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [empleadoInfo, setEmpleadoInfo] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        cargarMiInformacion();
    }, []);

    const cargarMiInformacion = async () => {
        try {
            const response = await empleadosService.getMiPerfil();
            if (response.success) {
                setEmpleadoInfo(response.data);
            }
        } catch (error) {
            setError('Error cargando información del empleado');
            console.error('Error cargando información:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!empleadoInfo) {
            setError('No se pudo cargar la información del empleado. Intente nuevamente.');
            return;
        }

        if (!formData.hora_entrada) {
            setError('La hora de entrada es requerida');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const dataParaEnviar = {
                ...formData,
                empleado_id: empleadoInfo.id
            };

            const response = await asistenciaService.registrar(dataParaEnviar);
            if (response.success) {
                navigate('/asistencia');
            }
        } catch (error) {
            setError(error.response?.data?.error || 'Error al registrar asistencia');
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

    return (
        <Box>
            <Typography variant="h4" component="h1" gutterBottom>
                Registrar Asistencia
            </Typography>

            <Card sx={{ p: 3 }}>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {empleadoInfo && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                        Registrando asistencia para: <strong>{empleadoInfo.nombre} {empleadoInfo.apellido}</strong>
                        - {empleadoInfo.codigo_empleado} - {empleadoInfo.departamento}
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                label="Fecha"
                                name="fecha"
                                type="date"
                                value={formData.fecha}
                                onChange={handleChange}
                                InputLabelProps={{ shrink: true }}
                                required
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                label="Hora de Entrada"
                                name="hora_entrada"
                                type="time"
                                value={formData.hora_entrada}
                                onChange={handleChange}
                                InputLabelProps={{ shrink: true }}
                                required
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                label="Hora de Salida"
                                name="hora_salida"
                                type="time"
                                value={formData.hora_salida}
                                onChange={handleChange}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                    </Grid>

                    <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={loading || !empleadoInfo}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Registrar Asistencia'}
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={() => navigate('/asistencia')}
                        >
                            Cancelar
                        </Button>
                    </Box>
                </form>
            </Card>
        </Box>
    );
};

export default AsistenciaRegistro;
