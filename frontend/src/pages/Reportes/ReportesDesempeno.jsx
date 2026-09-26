import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  Grid,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  CircularProgress,
  Rating
} from '@mui/material';
import { PictureAsPdf as PdfIcon } from '@mui/icons-material';
import { reportesService } from '../../services/Api';
import { exportService } from '../../services/exportService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ReportesDesempeno = () => {
  const [reporte, setReporte] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtros, setFiltros] = useState({
    periodo: '',
    departamento: ''
  });
  const [metadata, setMetadata] = useState({});

  useEffect(() => {
    // Establecer período por defecto (trimestre actual)
    const today = new Date();
    const quarter = Math.floor(today.getMonth() / 3) + 1;
    const periodo = `${today.getFullYear()}-Q${quarter}`;
    setFiltros({
      periodo,
      departamento: ''
    });
  }, []);

  const generarReporte = async () => {
    if (!filtros.periodo) {
      alert('Seleccione el período de evaluación');
      return;
    }

    setLoading(true);
    try {
      const response = await reportesService.getReporteDesempeno(filtros);
      if (response.success) {
        setReporte(response.data);
        setMetadata(response.metadata);
      }
    } catch (error) {
      console.error('Error generando reporte:', error);
      alert('Error al generar el reporte');
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

  const exportToPDF = () => {
    if (reporte.length === 0) {
      alert('No hay datos para exportar');
      return;
    }
    exportService.exportDesempenoToPDF(reporte, metadata, filtros);
  };

  const getColorCalificacion = (puntuacion) => {
    if (puntuacion >= 9) return 'success';
    if (puntuacion >= 7) return 'warning';
    return 'error';
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Reporte de Desempeño
      </Typography>

      {/* Filtros */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="end">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Período Evaluación"
              name="periodo"
              value={filtros.periodo}
              onChange={handleFiltrosChange}
              placeholder="2024-Q1, 2024-01, etc."
              helperText="Ej: 2024-Q1, 2024-Enero, 2024-01"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Departamento"
              name="departamento"
              value={filtros.departamento}
              onChange={handleFiltrosChange}
              placeholder="Todos los departamentos"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              variant="contained"
              onClick={generarReporte}
              fullWidth
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Generar Reporte'}
            </Button>
          </Grid>
        </Grid>
      </Card>

      {metadata.total_registros !== undefined && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Período: {metadata.periodo} | 
          Departamento: {metadata.departamento} | 
          Promedio General: {metadata.promedio_general?.toFixed(2) || '0.00'} |
          Evaluados: {metadata.total_registros}
        </Alert>
      )}

      {reporte.length > 0 ? (
        <Card>
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" component="h2">
              Resultados de Evaluación ({reporte.length} registros)
            </Typography>
            <Button
              variant="outlined"
              startIcon={<PdfIcon />}
              onClick={exportToPDF}
              sx={{ 
                backgroundColor: 'white',
                '&:hover': {
                  backgroundColor: '#f5f5f5'
                }
              }}
            >
              Exportar PDF
            </Button>
          </Box>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'primary.light' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Empleado</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Departamento</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Puesto</TableCell>
                  <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Período</TableCell>
                  <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Evaluador</TableCell>
                  <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Puntualidad</TableCell>
                  <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Calidad</TableCell>
                  <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Colaboración</TableCell>
                  <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Iniciativa</TableCell>
                  <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Puntuación Total</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Comentarios</TableCell>
                </TableRow>
              </TableHead> {/* Aquí estaba faltando esta etiqueta de cierre */}
              <TableBody>
                {reporte.map((fila, index) => (
                  <TableRow 
                    key={index}
                    sx={{ 
                      '&:hover': { backgroundColor: 'action.hover' },
                      backgroundColor: index % 2 === 0 ? 'background.default' : 'white'
                    }}
                  >
                    <TableCell>
                      <Typography variant="body1" fontWeight="bold">
                        {fila.nombre} {fila.apellido}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {fila.codigo_empleado}
                      </Typography>
                    </TableCell>
                    <TableCell>{fila.departamento}</TableCell>
                    <TableCell>{fila.puesto}</TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={fila.periodo_evaluacion} 
                        variant="outlined" 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell align="center">
                      {fila.evaluador_nombre ? 
                        <Typography variant="body2">
                          {fila.evaluador_nombre} {fila.evaluador_apellido}
                        </Typography> : 
                        <Typography variant="body2" color="text.secondary">
                          N/A
                        </Typography>
                      }
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" flexDirection="column" alignItems="center">
                        <Rating 
                          value={parseFloat(fila.puntualidad) || 0} 
                          readOnly 
                          size="small" 
                          precision={0.5}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {parseFloat(fila.puntualidad)?.toFixed(1) || '0.0'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" flexDirection="column" alignItems="center">
                        <Rating 
                          value={parseFloat(fila.calidad_trabajo) || 0} 
                          readOnly 
                          size="small" 
                          precision={0.5}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {parseFloat(fila.calidad_trabajo)?.toFixed(1) || '0.0'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" flexDirection="column" alignItems="center">
                        <Rating 
                          value={parseFloat(fila.colaboracion) || 0} 
                          readOnly 
                          size="small" 
                          precision={0.5}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {parseFloat(fila.colaboracion)?.toFixed(1) || '0.0'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" flexDirection="column" alignItems="center">
                        <Rating 
                          value={parseFloat(fila.iniciativa) || 0} 
                          readOnly 
                          size="small" 
                          precision={0.5}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {parseFloat(fila.iniciativa)?.toFixed(1) || '0.0'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={fila.puntuacion_total ? parseFloat(fila.puntuacion_total).toFixed(2) : 'N/A'} 
                        color={getColorCalificacion(fila.puntuacion_total)} 
                        size="small" 
                        variant="filled"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          maxWidth: 200,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {fila.comentarios || 'Sin comentarios'}
                      </Typography>
                      {fila.comentarios && fila.comentarios.length > 100 && (
                        <Typography variant="caption" color="primary">
                          ...ver más
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Resumen estadístico */}
          <Box sx={{ p: 2, backgroundColor: 'grey.50', borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="subtitle2" gutterBottom>
              Resumen Estadístico:
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2">
                  <strong>Promedio Puntualidad:</strong> {(reporte.reduce((sum, item) => sum + parseFloat(item.puntualidad || 0), 0) / reporte.length).toFixed(2)}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2">
                  <strong>Promedio Calidad:</strong> {(reporte.reduce((sum, item) => sum + parseFloat(item.calidad_trabajo || 0), 0) / reporte.length).toFixed(2)}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2">
                  <strong>Promedio Colaboración:</strong> {(reporte.reduce((sum, item) => sum + parseFloat(item.colaboracion || 0), 0) / reporte.length).toFixed(2)}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2">
                  <strong>Promedio Iniciativa:</strong> {(reporte.reduce((sum, item) => sum + parseFloat(item.iniciativa || 0), 0) / reporte.length).toFixed(2)}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Card>
      ) : (
        <Card sx={{ p: 3 }}>
          <Alert severity="info">
            {metadata.total_registros === 0 ? 
              'No hay evaluaciones de desempeño para el período seleccionado' : 
              'Utilice los filtros para generar un reporte de desempeño'
            }
          </Alert>
        </Card>
      )}
    </Box>
  );
};

export default ReportesDesempeno;