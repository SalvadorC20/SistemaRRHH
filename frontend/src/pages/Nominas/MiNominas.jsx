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
} from '@mui/material';
import { Receipt as ReceiptIcon, Warning as WarningIcon } from '@mui/icons-material';
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

  const calcularTotalDeducciones = (nomina) => {
    if (!nomina.deducciones) return 0;
    
    try {
      const deducciones = typeof nomina.deducciones === 'string' 
        ? JSON.parse(nomina.deducciones) 
        : nomina.deducciones;
      
      return (parseFloat(deducciones.inss) || 0) + (parseFloat(deducciones.ir) || 0) + (parseFloat(deducciones.otros) || 0);
    } catch (error) {
      return 0;
    }
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

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Mis Nóminas
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Consulta el historial de tus nóminas y detalles de pagos.
      </Typography>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Período de Pago</TableCell>
                <TableCell>Fecha de Pago</TableCell>
                <TableCell>Salario Bruto</TableCell>
                <TableCell>Salario Neto</TableCell>
                <TableCell>Estado</TableCell>
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
                        {nomina.periodo_pago}
                      </Typography>
                      {!nomina.cumplimiento_legal && (
                        <Typography variant="caption" color="error" display="block">
                          <WarningIcon sx={{ fontSize: 14, mr: 0.5 }} />
                          Revisar cumplimiento
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(nomina.fecha_pago)}</TableCell>
                    <TableCell>{formatCurrency(nomina.salario_bruto)}</TableCell>
                    <TableCell>
                      <Typography variant="body1" fontWeight="bold" color="primary">
                        {formatCurrency(nomina.salario_neto)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        INSS: -{formatCurrency(deducciones.inss || 0)}
                      </Typography>
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
          </Box>
        )}
      </Card>

      {/* Dialog de detalle de nómina MEJORADO */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Detalle de Nómina - {nominaDetalle?.periodo_pago}
          {nominaDetalle && !nominaDetalle.cumplimiento_legal && (
            <Alert severity="warning" sx={{ mt: 1 }}>
              Esta nómina requiere revisión de cumplimiento legal
            </Alert>
          )}
        </DialogTitle>
        <DialogContent>
          {nominaDetalle && (() => {
            const deducciones = getDeduccionesObject(nominaDetalle);
            const totalDeducciones = calcularTotalDeducciones(nominaDetalle);
            
            return (
              <Box>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body1" gutterBottom>
                    <strong>Fecha de Pago:</strong> {formatDate(nominaDetalle.fecha_pago)}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Estado:</strong> 
                    <Chip 
                      label={nominaDetalle.estado} 
                      color={getStatusColor(nominaDetalle.estado)}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                  {nominaDetalle.codigo_empleado && (
                    <Typography variant="body1" gutterBottom>
                      <strong>Código Empleado:</strong> {nominaDetalle.codigo_empleado}
                    </Typography>
                  )}
                </Box>

                <Box sx={{ mt: 3 }}>
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
                        
                        {/* Deducciones del empleado */}
                        <TableRow>
                          <TableCell colSpan={2} sx={{ backgroundColor: 'grey.100', py: 1 }}>
                            <Typography variant="subtitle2">
                              Deducciones del Empleado
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
                          <TableCell><strong>Salario Neto a Recibir:</strong></TableCell>
                          <TableCell align="right">
                            <strong>{formatCurrency(nominaDetalle.salario_neto)}</strong>
                          </TableCell>
                        </TableRow>

                        {/* Información de aportes patronales */}
                        {(deducciones.inss_patronal > 0 || deducciones.inatec > 0) && (
                          <>
                            <TableRow>
                              <TableCell colSpan={2} sx={{ backgroundColor: 'info.50', py: 1, mt: 2 }}>
                                <Typography variant="subtitle2" color="text.secondary">
                                  Información de Aportes Patronales
                                </Typography>
                              </TableCell>
                            </TableRow>
                            {deducciones.inss_patronal > 0 && (
                              <TableRow>
                                <TableCell sx={{ pl: 2, fontStyle: 'italic' }}>INSS Patronal (15.5%):</TableCell>
                                <TableCell align="right" sx={{ fontStyle: 'italic' }}>
                                  {formatCurrency(deducciones.inss_patronal)}
                                </TableCell>
                              </TableRow>
                            )}
                            {deducciones.inatec > 0 && (
                              <TableRow>
                                <TableCell sx={{ pl: 2, fontStyle: 'italic' }}>INATEC (1.5%):</TableCell>
                                <TableCell align="right" sx={{ fontStyle: 'italic' }}>
                                  {formatCurrency(deducciones.inatec)}
                                </TableCell>
                              </TableRow>
                            )}
                            <TableRow>
                              <TableCell sx={{ fontStyle: 'italic' }}><strong>Costo Total para la Institución:</strong></TableCell>
                              <TableCell align="right" sx={{ fontStyle: 'italic' }}>
                                <strong>
                                  {formatCurrency(
                                    (parseFloat(nominaDetalle.salario_bruto) || 0) + 
                                    (parseFloat(deducciones.inss_patronal) || 0) + 
                                    (parseFloat(deducciones.inatec) || 0)
                                  )}
                                </strong>
                              </TableCell>
                            </TableRow>
                          </>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>

                {/* Información adicional */}
                <Box sx={{ mt: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Nota:</strong> Los cálculos están basados en la legislación laboral de Nicaragua. 
                    INSS 6.25% empleado, 15.5% patronal. INATEC 1.5% sobre la base imponible.
                  </Typography>
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