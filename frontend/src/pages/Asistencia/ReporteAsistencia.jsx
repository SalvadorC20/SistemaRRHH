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
    TextField,
    Button,
    Grid,
    Chip,
} from '@mui/material';
import { asistenciaService } from '../../services/Api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate, getStatusColor } from '../../utils/formatters';

const ReporteAsistencia = () => {
    const [reporte, setReporte] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filtros, setFiltros] = useState({
        fecha_inicio: '',
        fecha_fin: '',
        departamento: ''
    });

    const cargarReporte = async () => {
        setLoading(true);
        try {
            const response = await asistenciaService.getReporte(filtros);
            if (response.success) {
                setReporte(response.data);
            }
        } catch (error) {
            console.error('Error cargando reporte:', error);
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

    useEffect(() => {
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        setFiltros({
            fecha_inicio: firstDay.toISOString().split('T')[0],
            fecha_fin: lastDay.toISOString().split('T')[0],
            departamento: ''
        });
    }, []);

    useEffect(() => {
        if (filtros.fecha_inicio && filtros.fecha_fin) {
            cargarReporte();
        }
    }, [filtros.fecha_inicio, filtros.fecha_fin, filtros.departamento]);

    return (
        <Box>
            <Typography variant="h4" component="h1" gutterBottom>
                Reporte de Asistencia
            </Typography>

            <Card sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="end">
                    <Grid size={{ xs: 12, sm: 3 }}>
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
                    <Grid size={{ xs: 12, sm: 3 }}>
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
                    <Grid size={{ xs: 12, sm: 3 }}>
                        <TextField
                            fullWidth
                            label="Departamento"
                            name="departamento"
                            value={filtros.departamento}
                            onChange={handleFiltrosChange}
                            placeholder="Todos los departamentos"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 3 }}>
                        <Button
                            variant="contained"
                            onClick={cargarReporte}
                            fullWidth
                        >
                            Actualizar
                        </Button>
                    </Grid>
                </Grid>
            </Card>

            {loading ? (
                <LoadingSpinner />
            ) : (
                <Card>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Empleado</TableCell>
                                    <TableCell>Departamento</TableCell>
                                    <TableCell>Fecha</TableCell>
                                    <TableCell>Hora Entrada</TableCell>
                                    <TableCell>Hora Salida</TableCell>
                                    <TableCell>Tipo</TableCell>
                                    <TableCell>Justificación</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {reporte.map((registro, index) => (
                                    <TableRow key={`${registro.id}-${registro.fecha}-${index}`} hover>
                                        <TableCell>
                                            <Typography variant="body1" fontWeight="bold">
                                                {registro.nombre} {registro.apellido}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {registro.codigo_empleado}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>{registro.departamento}</TableCell>
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

                    {reporte.length === 0 && (
                        <Box p={3} textAlign="center">
                            <Typography variant="body1" color="text.secondary">
                                No hay registros de asistencia para los filtros seleccionados.
                            </Typography>
                        </Box>
                    )}
                </Card>
            )}
        </Box>
    );
};

export default ReporteAsistencia;
