import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Button,
    TextField,
    Grid,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { asistenciaService } from '../../services/Api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate, getStatusColor } from '../../utils/formatters';

const MiAsistencia = () => {
    const [asistencia, setAsistencia] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtros, setFiltros] = useState({
        fecha_inicio: '',
        fecha_fin: ''
    });
    const navigate = useNavigate();

    useEffect(() => {
        loadAsistencia();
    }, []);

    const loadAsistencia = async () => {
        try {
            const response = await asistenciaService.getMiAsistencia(filtros);
            if (response.success) {
                setAsistencia(response.data);
            }
        } catch (error) {
            console.error('Error cargando asistencia:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFiltrosChange = (e) => {
        setFiltros({
            ...filtros,
            [e.target.name]: e.target.value
        });
    };

    const aplicarFiltros = () => {
        setLoading(true);
        loadAsistencia();
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" component="h1">
                    Mi Asistencia
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/asistencia/registrar')}
                >
                    Registrar Asistencia
                </Button>
            </Box>

            <Card sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="end">
                    <Grid item xs={12} sm={4}>
                        <TextField
                            fullWidth
                            label="Fecha Inicio"
                            name="fecha_inicio"
                            type="date"
                            value={filtros.fecha_inicio}
                            onChange={handleFiltrosChange}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            fullWidth
                            label="Fecha Fin"
                            name="fecha_fin"
                            type="date"
                            value={filtros.fecha_fin}
                            onChange={handleFiltrosChange}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Button
                            variant="contained"
                            onClick={aplicarFiltros}
                            fullWidth
                        >
                            Aplicar Filtros
                        </Button>
                    </Grid>
                </Grid>
            </Card>

            <Card>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Fecha</TableCell>
                                <TableCell>Hora Entrada</TableCell>
                                <TableCell>Hora Salida</TableCell>
                                <TableCell>Tipo de Registro</TableCell>
                                <TableCell>Justificación</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {asistencia.map((registro) => (
                                <TableRow key={registro.id} hover>
                                    <TableCell>{formatDate(registro.fecha)}</TableCell>
                                    <TableCell>{registro.hora_entrada || '-'}</TableCell>
                                    <TableCell>{registro.hora_salida || '-'}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={registro.tipo_registro}
                                            color={getStatusColor(registro.tipo_registro)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {registro.justificacion || '-'}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                {asistencia.length === 0 && (
                    <Box p={3} textAlign="center">
                        <Typography variant="body1" color="text.secondary">
                            No hay registros de asistencia para el período seleccionado.
                        </Typography>
                    </Box>
                )}
            </Card>
        </Box>
    );
};

export default MiAsistencia;
