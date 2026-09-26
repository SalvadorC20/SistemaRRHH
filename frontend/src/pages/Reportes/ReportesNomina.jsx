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

const ReportesNomina = () => {
  const [reporte, setReporte] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtros, setFiltros] = useState({
    periodo: '',
    departamento: ''
  });
  const [metadata, setMetadata] = useState({});

  useEffect(() => {
    const today = new Date();
    const periodo = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    setFiltros({
      periodo,
      departamento: ''
    });
  }, []);

  const generarReporte = async () => {
    if (!filtros.periodo) {
      alert('Seleccione el período');
      return;
    }

    setLoading(true);
    try {
      const response = await reportesService.getReporteNomina(filtros);
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
    exportService.exportNominaToPDF(reporte, metadata, filtros);
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'PAGADO': return 'success';
      case 'PENDIENTE': return 'warning';
      case 'CANCELADO': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Reporte de Nómina
      </Typography>

      {/* Filtros */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="end">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Período (YYYY-MM)"
              name="periodo"
              value={filtros.periodo}
              onChange={handleFiltrosChange}
              placeholder="2024-03"
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
          Total nómina: C$ {metadata.total_nomina?.toFixed(2)} |
          Registros: {metadata.total_registros}
        </Alert>
      )}

      {reporte.length > 0 ? (
        <Card>
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
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
                <TableRow>
                  <TableCell>Empleado</TableCell>
                  <TableCell>Departamento</TableCell>
                  <TableCell>Puesto</TableCell>
                  <TableCell align="right">Salario Base</TableCell>
                  <TableCell align="right">Salario Bruto</TableCell>
                  <TableCell align="right">Deducciones</TableCell>
                  <TableCell align="right">Salario Neto</TableCell>
                  <TableCell align="center">Estado</TableCell>
                  <TableCell>Fecha Pago</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reporte.map((fila, index) => (
                  <TableRow key={index}>
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
                    <TableCell align="right">
                      C$ {parseFloat(fila.salario_base || 0).toFixed(2)}
                    </TableCell>
                    <TableCell align="right">
                      C$ {parseFloat(fila.salario_bruto || 0).toFixed(2)}
                    </TableCell>
                    <TableCell align="right">
                      C$ {(() => {
                        if (!fila.deducciones) return '0.00';
                        if (Array.isArray(fila.deducciones)) {
                          return fila.deducciones.reduce((sum, ded) => sum + parseFloat(ded.monto || 0), 0).toFixed(2);
                        }
                        let dedObj = fila.deducciones;
                        if (typeof dedObj === 'string') {
                          try { dedObj = JSON.parse(dedObj); } catch(e) { return '0.00'; }
                        }
                        if (typeof dedObj === 'object' && dedObj !== null) {
                          return Object.values(dedObj).reduce((sum, val) => sum + (parseFloat(val) || 0), 0).toFixed(2);
                        }
                        return '0.00';
                      })()}
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body1" fontWeight="bold">
                        C$ {parseFloat(fila.salario_neto || 0).toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={fila.estado_nomina || 'SIN REGISTRO'}
                        color={getEstadoColor(fila.estado_nomina)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {fila.fecha_pago || 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      ) : (
        <Card sx={{ p: 3 }}>
          <Alert severity="info">
            {metadata.total_registros === 0 ?
              'No hay datos de nómina para el período seleccionado' :
              'Utilice los filtros para generar un reporte de nómina'
            }
          </Alert>
        </Card>
      )}
    </Box>
  );
};

export default ReportesNomina;