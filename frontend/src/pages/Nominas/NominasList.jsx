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
  IconButton,
  Tooltip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { 
  Add as AddIcon, 
  Visibility as VisibilityIcon,
  Warning as WarningIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { nominasService } from '../../services/Api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate, formatCurrency, getStatusColor } from '../../utils/formatters';

const NominasList = () => {
  const [nominas, setNominas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [estadisticas, setEstadisticas] = useState(null);
  const [nominaDetalle, setNominaDetalle] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false); // NUEVO: estado para diálogo
  const navigate = useNavigate();

  useEffect(() => {
    loadNominas();
    loadEstadisticas();
  }, []);

  const loadNominas = async () => {
    try {
      const response = await nominasService.getAll();
      if (response.success) {
        setNominas(response.data);
      }
    } catch (error) {
      console.error('Error cargando nóminas:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEstadisticas = async () => {
    try {
      const response = await nominasService.getEstadisticas();
      if (response.success) {
        setEstadisticas(response.data);
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
      // Si falla, crear estadísticas básicas desde los datos locales
      const estadisticasBasicas = {
        total_nominas: nominas.length,
        total_empleados: new Set(nominas.map(n => n.empleado_id)).size,
        nominas_cumplen_ley: nominas.filter(n => n.cumplimiento_legal).length,
        nominas_no_cumplen_ley: nominas.filter(n => !n.cumplimiento_legal).length
      };
      setEstadisticas(estadisticasBasicas);
    }
  };

  // NUEVO: Función para ver detalle en diálogo
  const verDetalle = (nomina) => {
    setNominaDetalle(nomina);
    setDialogOpen(true);
  };

  const getDeduccionesObject = (nomina) => {
    if (!nomina.deducciones) return {};
    try {
      return typeof nomina.deducciones === 'string' 
        ? JSON.parse(nomina.deducciones) 
        : nomina.deducciones;
    } catch (error) {
      return {};
    }
  };

  const calcularTotalDeducciones = (nomina) => {
    const deducciones = getDeduccionesObject(nomina);
    return (deducciones.inss || 0) + (deducciones.ir || 0) + (deducciones.otros || 0);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const nominasConProblemas = nominas.filter(n => !n.cumplimiento_legal).length;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Gestión de Nóminas
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Administra y revisa todas las nóminas del sistema
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/nominas/generar')}
        >
          Generar Nómina
        </Button>
      </Box>

      {/* Estadísticas rápidas */}
      {estadisticas && (
        <Box sx={{ mb: 3 }}>
          <Card sx={{ p: 2, backgroundColor: 'primary.50' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h6" gutterBottom>
                  Resumen General
                </Typography>
                <Typography variant="body2">
                  Total nóminas: <strong>{estadisticas.total_nominas}</strong> | 
                  Empleados: <strong>{estadisticas.total_empleados}</strong> | 
                  Cumplen ley: <strong>{estadisticas.nominas_cumplen_ley}</strong>
                </Typography>
              </Box>
              {nominasConProblemas > 0 && (
                <Alert severity="warning" sx={{ maxWidth: 400 }}>
                  {nominasConProblemas} nómina(s) requieren revisión de cumplimiento legal
                </Alert>
              )}
            </Box>
          </Card>
        </Box>
      )}

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Empleado</TableCell>
                <TableCell>Período</TableCell>
                <TableCell>Fecha Pago</TableCell>
                <TableCell>Salario Bruto</TableCell>
                <TableCell>Salario Neto</TableCell>
                <TableCell>Deducciones</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Cumplimiento</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {nominas.map((nomina) => {
                const deducciones = getDeduccionesObject(nomina);
                return (
                  <TableRow key={nomina.id} hover>
                    <TableCell>
                      <Typography variant="body1" fontWeight="bold">
                        {nomina.nombre} {nomina.apellido}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {nomina.codigo_empleado}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {nomina.departamento} - {nomina.puesto}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1" fontWeight="medium">
                        {nomina.periodo_pago}
                      </Typography>
                    </TableCell>
                    <TableCell>{formatDate(nomina.fecha_pago)}</TableCell>
                    <TableCell>
                      {formatCurrency(nomina.salario_bruto)}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1" fontWeight="bold" color="primary">
                        {formatCurrency(nomina.salario_neto)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="caption" display="block">
                          INSS: {formatCurrency(deducciones.inss || 0)}
                        </Typography>
                        <Typography variant="caption" display="block">
                          IR: {formatCurrency(deducciones.ir || 0)}
                        </Typography>
                        {deducciones.otros > 0 && (
                          <Typography variant="caption" display="block">
                            Otros: {formatCurrency(deducciones.otros)}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={nomina.estado}
                        color={getStatusColor(nomina.estado)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {nomina.cumplimiento_legal ? (
                        <Chip
                          label="Cumple"
                          color="success"
                          size="small"
                          variant="outlined"
                        />
                      ) : (
                        <Tooltip title="Revisar cumplimiento legal">
                          <Chip
                            icon={<WarningIcon />}
                            label="Revisar"
                            color="error"
                            size="small"
                          />
                        </Tooltip>
                      )}
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Ver detalle">
                        <IconButton
                          onClick={() => verDetalle(nomina)} // CORREGIDO: usa la función verDetalle
                          size="small"
                          color="primary"
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {nominas.length === 0 && (
          <Box p={3} textAlign="center">
            <Typography variant="body1" color="text.secondary">
              No hay nóminas registradas.
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={() => navigate('/nominas/generar')}
              sx={{ mt: 2 }}
            >
              Generar Primera Nómina
            </Button>
          </Box>
        )}
      </Card>

      {/* NUEVO: Diálogo de detalle */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <ReceiptIcon color="primary" />
            Detalle de Nómina - {nominaDetalle?.periodo_pago}
          </Box>
        </DialogTitle>
        <DialogContent>
          {nominaDetalle && (() => {
            const deducciones = getDeduccionesObject(nominaDetalle);
            const totalDeducciones = calcularTotalDeducciones(nominaDetalle);
            
            return (
              <Box>
                {/* Información general */}
                <Box sx={{ mb: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Información del Empleado
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={3}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Empleado
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {nominaDetalle.nombre} {nominaDetalle.apellido}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Código
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {nominaDetalle.codigo_empleado}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Departamento
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {nominaDetalle.departamento}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Fecha de Pago
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {formatDate(nominaDetalle.fecha_pago)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Desglose de pago */}
                <Typography variant="h6" gutterBottom>
                  Desglose de Pago
                </Typography>
                
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell><strong>Salario Bruto:</strong></TableCell>
                        <TableCell align="right">{formatCurrency(nominaDetalle.salario_bruto)}</TableCell>
                      </TableRow>
                      
                      {/* Deducciones */}
                      <TableRow>
                        <TableCell colSpan={2} sx={{ backgroundColor: 'grey.100', py: 1 }}>
                          <Typography variant="subtitle2">
                            Deducciones
                          </Typography>
                        </TableCell>
                      </TableRow>
                      
                      {deducciones.inss > 0 && (
                        <TableRow>
                          <TableCell sx={{ pl: 2 }}>INSS (6.25%):</TableCell>
                          <TableCell align="right">-{formatCurrency(deducciones.inss)}</TableCell>
                        </TableRow>
                      )}
                      
                      {deducciones.ir > 0 && (
                        <TableRow>
                          <TableCell sx={{ pl: 2 }}>Impuesto sobre la Renta:</TableCell>
                          <TableCell align="right">-{formatCurrency(deducciones.ir)}</TableCell>
                        </TableRow>
                      )}
                      
                      {deducciones.otros > 0 && (
                        <TableRow>
                          <TableCell sx={{ pl: 2 }}>Otras Deducciones:</TableCell>
                          <TableCell align="right">-{formatCurrency(deducciones.otros)}</TableCell>
                        </TableRow>
                      )}
                      
                      <TableRow>
                        <TableCell><strong>Total Deducciones:</strong></TableCell>
                        <TableCell align="right">
                          -{formatCurrency(totalDeducciones)}
                        </TableCell>
                      </TableRow>
                      
                      {/* Salario Neto */}
                      <TableRow sx={{ backgroundColor: 'primary.50' }}>
                        <TableCell><strong>Salario Neto:</strong></TableCell>
                        <TableCell align="right">
                          <Typography variant="h6" color="primary">
                            {formatCurrency(nominaDetalle.salario_neto)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Estado y cumplimiento */}
                <Box sx={{ mt: 3, p: 2, backgroundColor: 'info.50', borderRadius: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Estado y Cumplimiento
                  </Typography>
                  <Box display="flex" gap={2} alignItems="center">
                    <Chip
                      label={nominaDetalle.estado}
                      color={getStatusColor(nominaDetalle.estado)}
                    />
                    {nominaDetalle.cumplimiento_legal ? (
                      <Chip
                        label="Cumple normativa legal"
                        color="success"
                        variant="outlined"
                      />
                    ) : (
                      <Chip
                        icon={<WarningIcon />}
                        label="Revisar cumplimiento legal"
                        color="warning"
                      />
                    )}
                  </Box>
                </Box>
              </Box>
            );
          })()}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} variant="contained">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NominasList;