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
  CircularProgress
} from '@mui/material';
import { PictureAsPdf as PdfIcon } from '@mui/icons-material';
import { reportesService } from '../../services/Api';
import { exportService } from '../../services/exportService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ReportesAsistencia = () => {
  const [reporte, setReporte] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtros, setFiltros] = useState({
    fecha_inicio: '',
    fecha_fin: '',
    departamento: ''
  });
  const [metadata, setMetadata] = useState({});

  useEffect(() => {
    // Establecer fechas por defecto (mes actual)
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    setFiltros({
      fecha_inicio: firstDay.toISOString().split('T')[0],
      fecha_fin: lastDay.toISOString().split('T')[0],
      departamento: ''
    });
  }, []);

  const generarReporte = async () => {
    if (!filtros.fecha_inicio || !filtros.fecha_fin) {
      alert('Seleccione las fechas de inicio y fin');
      return;
    }

    setLoading(true);
    try {
      console.log('Enviando parámetros:', filtros);
      
      const response = await reportesService.getReporteAsistencia(filtros);
      
      if (response.success) {
        setReporte(response.data);
        setMetadata(response.metadata);
      } else {
        alert('Error en la respuesta del servidor: ' + (response.error || 'Error desconocido'));
      }
    } catch (error) {
      console.error('Error detallado generando reporte:', error);
      
      let errorMessage = 'Error al generar el reporte';
      
      if (error.response) {
        errorMessage = `Error ${error.response.status}: ${error.response.data?.error || 'Error del servidor'}`;
      } else if (error.request) {
        errorMessage = 'No se pudo conectar con el servidor';
      } else {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
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
    exportService.exportAsistenciaToPDF(reporte, metadata, filtros);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  // Calcular estadísticas generales
  const estadisticas = reporte.length > 0 ? {
    totalDiasNormales: reporte.reduce((sum, item) => sum + (Number(item.dias_normales) || 0), 0),
    totalDiasJustificados: reporte.reduce((sum, item) => sum + (Number(item.dias_justificados) || 0), 0),
    totalInasistencias: reporte.reduce((sum, item) => sum + (Number(item.inasistencias) || 0), 0),
    totalEmpleados: reporte.length,
    promedioHoras: reporte.reduce((sum, item) => sum + (parseFloat(item.promedio_horas_diarias) || 0), 0) / reporte.length
  } : null;

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Reporte de Asistencia
      </Typography>

      {/* Filtros */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="end">
          <Grid item xs={12} sm={3}>
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
          <Grid item xs={12} sm={3}>
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
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Departamento"
              name="departamento"
              value={filtros.departamento}
              onChange={handleFiltrosChange}
              placeholder="Todos los departamentos"
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button
              variant="contained"
              onClick={generarReporte}
              fullWidth
              disabled={loading}
              sx={{ height: '56px' }}
            >
              {loading ? <CircularProgress size={24} /> : 'Generar Reporte'}
            </Button>
          </Grid>
        </Grid>
      </Card>

      {metadata.total_registros !== undefined && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Período: {metadata.fecha_inicio} a {metadata.fecha_fin} | 
          Departamento: {metadata.departamento} | 
          Total de registros: {metadata.total_registros}
        </Alert>
      )}

      {reporte.length > 0 ? (
        <Card>
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" component="h2">
              Control de Asistencia ({reporte.length} empleados)
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
                <TableRow sx={{ backgroundColor: 'warning.light' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Empleado</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Departamento</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Puesto</TableCell>
                  <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Días Registrados</TableCell>
                  <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Días Normales</TableCell>
                  <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Días Justificados</TableCell>
                  <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Inasistencias</TableCell>
                  <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Promedio Horas/Día</TableCell>
                  <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>% Asistencia</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reporte.map((fila, index) => {
                  const totalDias = Number(fila.dias_registrados) || 0;
                  const diasAsistidos = (Number(fila.dias_normales) || 0) + (Number(fila.dias_justificados) || 0);
                  const porcentajeAsistencia = totalDias > 0 ? (diasAsistidos / totalDias) * 100 : 0;
                  
                  return (
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
                        <Typography variant="body1" fontWeight="medium">
                          {fila.dias_registrados || 0}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={fila.dias_normales || 0} 
                          color="success" 
                          size="small" 
                          variant="filled"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={fila.dias_justificados || 0} 
                          color="warning" 
                          size="small" 
                          variant="filled"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={fila.inasistencias || 0} 
                          color="error" 
                          size="small" 
                          variant="filled"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Typography 
                          variant="body1" 
                          fontWeight="bold"
                          color={fila.promedio_horas_diarias >= 8 ? 'success.main' : 'warning.main'}
                        >
                          {fila.promedio_horas_diarias ? 
                            `${parseFloat(fila.promedio_horas_diarias).toFixed(2)}h` : 'N/A'
                          }
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={`${porcentajeAsistencia.toFixed(1)}%`}
                          color={
                            porcentajeAsistencia >= 95 ? 'success' :
                            porcentajeAsistencia >= 85 ? 'warning' : 'error'
                          }
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Resumen estadístico */}
          {estadisticas && (
            <Box sx={{ p: 3, backgroundColor: 'grey.50', borderTop: 1, borderColor: 'divider' }}>
              <Typography variant="h6" gutterBottom>
                Resumen General del Período
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={6} sm={3}>
                  <Card sx={{ p: 2, textAlign: 'center', backgroundColor: 'success.light', color: 'white' }}>
                    <Typography variant="h4" fontWeight="bold">
                      {estadisticas.totalDiasNormales}
                    </Typography>
                    <Typography variant="body2">
                      Días Normales
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Card sx={{ p: 2, textAlign: 'center', backgroundColor: 'warning.light', color: 'white' }}>
                    <Typography variant="h4" fontWeight="bold">
                      {estadisticas.totalDiasJustificados}
                    </Typography>
                    <Typography variant="body2">
                      Días Justificados
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Card sx={{ p: 2, textAlign: 'center', backgroundColor: 'error.light', color: 'white' }}>
                    <Typography variant="h4" fontWeight="bold">
                      {estadisticas.totalInasistencias}
                    </Typography>
                    <Typography variant="body2">
                      Inasistencias
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Card sx={{ p: 2, textAlign: 'center', backgroundColor: 'info.light', color: 'white' }}>
                    <Typography variant="h4" fontWeight="bold">
                      {estadisticas.promedioHoras.toFixed(2)}h
                    </Typography>
                    <Typography variant="body2">
                      Promedio Horas/Día
                    </Typography>
                  </Card>
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Total de empleados reportados:</strong> {estadisticas.totalEmpleados} | 
                  <strong> Tasa de asistencia general:</strong> {(
                    (estadisticas.totalDiasNormales + estadisticas.totalDiasJustificados + estadisticas.totalInasistencias) > 0 ?
                    (((estadisticas.totalDiasNormales + estadisticas.totalDiasJustificados) / 
                    (estadisticas.totalDiasNormales + estadisticas.totalDiasJustificados + estadisticas.totalInasistencias)) * 100).toFixed(1) : '0.0'
                  )}%
                </Typography>
              </Box>
            </Box>
          )}
        </Card>
      ) : (
        <Card sx={{ p: 3 }}>
          <Alert severity="info">
            {metadata.total_registros === 0 ? 
              'No hay datos de asistencia para los filtros seleccionados' : 
              'Utilice los filtros para generar un reporte de asistencia'
            }
          </Alert>
        </Card>
      )}
    </Box>
  );
};

export default ReportesAsistencia;