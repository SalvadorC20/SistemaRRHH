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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import { 
  Receipt as ReceiptIcon, 
  Warning as WarningIcon,
  Info as InfoIcon 
} from '@mui/icons-material';
import { nominasService } from '../../services/Api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate, formatCurrency, getStatusColor } from '../../utils/formatters';

const MiNominas = () => {
  const [nominas, setNominas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nominaDetalle, setNominaDetalle] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    loadNominas();
  }, []);

  const loadNominas = async () => {
    try {
      const response = await nominasService.getMisNominas();
      if (response.success) {
        setNominas(response.data);
      }
    } catch (error) {
      console.error('Error cargando nóminas:', error);
    } finally {
      setLoading(false);
    }
  };

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
    return (parseFloat(deducciones.inss) || 0) + (parseFloat(deducciones.ir) || 0) + (parseFloat(deducciones.otros) || 0);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const nominasConProblemas = nominas.filter(n => !n.cumplimiento_legal).length;

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Mis Nóminas
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Consulta el historial de tus nóminas y detalles de pagos.
      </Typography>

      {nominasConProblemas > 0 && (
        <Alert 
          severity="warning" 
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small">
              Más info
            </Button>
          }
        >
          Tienes {nominasConProblemas} nómina(s) que requieren revisión de cumplimiento legal
        </Alert>
      )}

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Período de Pago</TableCell>
                <TableCell>Fecha de Pago</TableCell>
                <TableCell>Salario Bruto</TableCell>
                <TableCell>Salario Neto</TableCell>
                <TableCell>Deducciones</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {nominas.map((nomina) => {
                const deducciones = getDeduccionesObject(nomina);
                const totalDeducciones = calcularTotalDeducciones(nomina);
                
                return (
                  <TableRow key={nomina.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body1" fontWeight="bold">
                          {nomina.periodo_pago}
                        </Typography>
                        {!nomina.cumplimiento_legal && (
                          <Typography variant="caption" color="error" display="flex" alignItems="center">
                            <WarningIcon sx={{ fontSize: 14, mr: 0.5 }} />
                            Revisar
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>{formatDate(nomina.fecha_pago)}</TableCell>
                    <TableCell>
                      {formatCurrency(nomina.salario_bruto)}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1" fontWeight="bold" color="primary">
                        {formatCurrency(nomina.salario_neto)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {nomina.horas_trabajadas || 160} horas
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
                        <Typography variant="caption" color="text.secondary" display="block">
                          Total: {formatCurrency(totalDeducciones)}
                        </Typography>
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
                      <Button
                        startIcon={<ReceiptIcon />}
                        onClick={() => verDetalle(nomina)}
                        size="small"
                        variant="outlined"
                      >
                        Detalle
                      </Button>
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
              No tienes nóminas registradas.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Contacta con Recursos Humanos si crees que deberías tener nóminas registradas.
            </Typography>
          </Box>
        )}
      </Card>

      {/* Dialog de detalle de nómina */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">
              Detalle de Nómina - {nominaDetalle?.periodo_pago}
            </Typography>
            {nominaDetalle && !nominaDetalle.cumplimiento_legal && (
              <Tooltip title="Esta nómina requiere revisión de cumplimiento legal">
                <Chip 
                  icon={<WarningIcon />}
                  label="Revisar Cumplimiento" 
                  color="warning" 
                  size="small"
                />
              </Tooltip>
            )}
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
                    Información General
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={3}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Fecha de Pago
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {formatDate(nominaDetalle.fecha_pago)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Estado
                      </Typography>
                      <Chip 
                        label={nominaDetalle.estado} 
                        color={getStatusColor(nominaDetalle.estado)}
                        size="small"
                      />
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Horas Trabajadas
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {nominaDetalle.horas_trabajadas || 160}
                      </Typography>
                    </Box>
                    {nominaDetalle.horas_extras > 0 && (
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Horas Extras
                        </Typography>
                        <Typography variant="body1" fontWeight="medium" color="success.main">
                          +{nominaDetalle.horas_extras}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>

                {/* Desglose de pago */}
                <Typography variant="h6" gutterBottom>
                  Desglose de Pago
                </Typography>
                
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      {/* Ingresos */}
                      <TableRow>
                        <TableCell colSpan={2} sx={{ backgroundColor: 'success.50', py: 1 }}>
                          <Typography variant="subtitle2">
                            Ingresos
                          </Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Salario Bruto:</strong></TableCell>
                        <TableCell align="right">{formatCurrency(nominaDetalle.salario_bruto)}</TableCell>
                      </TableRow>
                      {nominaDetalle.bonificaciones > 0 && (
                        <TableRow>
                          <TableCell>Bonificaciones:</TableCell>
                          <TableCell align="right">+{formatCurrency(nominaDetalle.bonificaciones)}</TableCell>
                        </TableRow>
                      )}
                      
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
                          <TableCell sx={{ pl: 2 }}>
                            <Box display="flex" alignItems="center">
                              INSS (Seguro Social)
                              <Tooltip title="6.25% sobre el salario bruto">
                                <IconButton size="small" sx={{ ml: 0.5 }}>
                                  <InfoIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                          <TableCell align="right">-{formatCurrency(deducciones.inss)}</TableCell>
                        </TableRow>
                      )}
                      
                      {deducciones.ir > 0 && (
                        <TableRow>
                          <TableCell sx={{ pl: 2 }}>
                            <Box display="flex" alignItems="center">
                              Impuesto sobre la Renta
                              <Tooltip title="Calculado según tabla progresiva anual">
                                <IconButton size="small" sx={{ ml: 0.5 }}>
                                  <InfoIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
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
                        <TableCell><strong>Salario Neto a Recibir:</strong></TableCell>
                        <TableCell align="right">
                          <Typography variant="h6" color="primary">
                            {formatCurrency(nominaDetalle.salario_neto)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Información adicional para transparencia */}
                <Box sx={{ mt: 3, p: 2, backgroundColor: 'info.50', borderRadius: 1 }}>
                  <Typography variant="subtitle2" gutterBottom color="info.main">
                    <InfoIcon sx={{ fontSize: 16, mr: 1 }} />
                    Información de Transparencia
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Esta nómina incluye los cálculos según la legislación laboral de Nicaragua. 
                    La institución realiza aportes adicionales por tu seguridad social.
                  </Typography>
                  {(deducciones.inss_patronal > 0 || deducciones.inatec > 0) && (
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      <strong>Aportes institucionales:</strong> INSS Patronal {formatCurrency(deducciones.inss_patronal)} + 
                      INATEC {formatCurrency(deducciones.inatec)} = {formatCurrency((deducciones.inss_patronal || 0) + (deducciones.inatec || 0))}
                    </Typography>
                  )}
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

export default MiNominas;