import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  TextField,
  Button,
  Grid,
  MenuItem,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControlLabel,
  Switch,
  Chip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { nominasService, empleadosService } from '../../services/Api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatCurrency } from '../../utils/formatters';

const GenerarNomina = () => {
  const [formData, setFormData] = useState({
    empleado_id: '',
    periodo_pago: '',
    fecha_pago: new Date().toISOString().split('T')[0],
    salario_bruto: '',
    deducciones: {
      inss: 0,
      ir: 0,
      otros: 0,
      inss_patronal: 0,
      inatec: 0
    },
    salario_neto: '',
    calculo_automatico: true
  });
  const [empleados, setEmpleados] = useState([]);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [calculando, setCalculando] = useState(false);
  const [cargandoEmpleados, setCargandoEmpleados] = useState(true);
  const [error, setError] = useState('');
  const [advertencias, setAdvertencias] = useState([]);
  const [tasas, setTasas] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadEmpleados();
    loadTasasActuales();
  }, []);

  const loadEmpleados = async () => {
    try {
      const response = await empleadosService.getAll();
      if (response.success) {
        setEmpleados(response.data);
      }
    } catch (error) {
      console.error('Error cargando empleados:', error);
    } finally {
      setCargandoEmpleados(false);
    }
  };

  const loadTasasActuales = async () => {
    try {
      const response = await nominasService.getTasasActuales();
      if (response.success) {
        setTasas(response.data);
      }
    } catch (error) {
      console.error('Error cargando tasas:', error);
    }
  };

  const handleEmpleadoChange = async (e) => {
    const empleadoId = e.target.value;
    const empleado = empleados.find(emp => emp.id === empleadoId);
    
    setFormData({
      ...formData,
      empleado_id: empleadoId,
      salario_bruto: empleado?.salario_base || ''
    });
    setEmpleadoSeleccionado(empleado);

    // Calcular deducciones automáticamente si hay salario
    if (empleado?.salario_base && formData.calculo_automatico) {
      await calcularDeduccionesAutomaticas(empleado.salario_base);
    }
  };

  const calcularDeduccionesAutomaticas = async (salarioBruto) => {
    if (!salarioBruto || salarioBruto <= 0) return;
    
    setCalculando(true);
    try {
      const response = await nominasService.calcularDeducciones(salarioBruto);
      if (response.success) {
        setFormData(prev => ({
          ...prev,
          deducciones: {
            ...response.data.deducciones,
            otros: prev.deducciones.otros // Mantener deducciones manuales
          },
          salario_neto: response.data.salario_neto
        }));
        
        // Validar nómina
        await validarNomina();
      }
    } catch (error) {
      console.error('Error calculando deducciones:', error);
    } finally {
      setCalculando(false);
    }
  };

  const validarNomina = async () => {
    if (!formData.empleado_id || !formData.salario_bruto || !formData.periodo_pago) return;
    
    try {
      const response = await nominasService.validarNomina({
        empleado_id: formData.empleado_id,
        salario_bruto: formData.salario_bruto,
        periodo_pago: formData.periodo_pago
      });
      
      if (response.success) {
        setAdvertencias(response.data.advertencias || []);
        if (!response.data.valido) {
          setError(response.data.error || response.data.advertencia);
        } else {
          setError('');
        }
      }
    } catch (error) {
      console.error('Error validando nómina:', error);
    }
  };

  const handleCalculoAutomaticoChange = (e) => {
    const calculoAutomatico = e.target.checked;
    setFormData(prev => ({ ...prev, calculo_automatico: calculoAutomatico }));
    
    if (calculoAutomatico && formData.salario_bruto) {
      calcularDeduccionesAutomaticas(formData.salario_bruto);
    } else {
      // Resetear a cálculo manual
      setFormData(prev => ({
        ...prev,
        deducciones: {
          inss: 0,
          ir: 0,
          otros: prev.deducciones.otros,
          inss_patronal: 0,
          inatec: 0
        }
      }));
    }
  };

  const handleSalarioBrutoChange = async (e) => {
    const salarioBruto = e.target.value;
    setFormData(prev => ({ ...prev, salario_bruto: salarioBruto }));

    if (formData.calculo_automatico && salarioBruto) {
      await calcularDeduccionesAutomaticas(salarioBruto);
    } else {
      calcularSalarioNetoManual();
    }
  };

  const calcularSalarioNetoManual = () => {
    const bruto = parseFloat(formData.salario_bruto) || 0;
    const inss = parseFloat(formData.deducciones.inss) || 0;
    const ir = parseFloat(formData.deducciones.ir) || 0;
    const otros = parseFloat(formData.deducciones.otros) || 0;
    
    const totalDeducciones = inss + ir + otros;
    const neto = bruto - totalDeducciones;
    
    setFormData(prev => ({
      ...prev,
      salario_neto: neto > 0 ? neto : 0
    }));
  };

  const handleDeduccionChange = (tipo, valor) => {
    const nuevasDeducciones = {
      ...formData.deducciones,
      [tipo]: parseFloat(valor) || 0
    };
    
    setFormData({
      ...formData,
      deducciones: nuevasDeducciones
    });

    if (!formData.calculo_automatico) {
      calcularSalarioNetoManual();
    }
  };

  const handlePeriodoPagoChange = (e) => {
    const periodo = e.target.value;
    setFormData(prev => ({ ...prev, periodo_pago: periodo }));
    
    // Validar cuando se complete el período
    if (periodo && formData.empleado_id && formData.salario_bruto) {
      setTimeout(validarNomina, 500);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validaciones finales
    if (!formData.empleado_id) {
      setError('Debe seleccionar un empleado');
      setLoading(false);
      return;
    }

    if (!formData.salario_bruto || formData.salario_bruto <= 0) {
      setError('El salario bruto debe ser mayor a 0');
      setLoading(false);
      return;
    }

    if (formData.salario_neto < 0) {
      setError('El salario neto no puede ser negativo');
      setLoading(false);
      return;
    }

    try {
      const datosEnvio = {
        ...formData,
        deducciones: JSON.stringify(formData.deducciones)
      };

      const response = await nominasService.generar(datosEnvio);
      if (response.success) {
        navigate('/nominas/gestion');
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Error al generar nómina');
    } finally {
      setLoading(false);
    }
  };

  if (cargandoEmpleados) {
    return <LoadingSpinner />;
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Generar Nómina
      </Typography>

      <Card sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {advertencias.length > 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Advertencias:
            </Typography>
            {advertencias.map((adv, index) => (
              <Typography key={index} variant="body2">
                • {adv}
              </Typography>
            ))}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Empleado"
                name="empleado_id"
                value={formData.empleado_id}
                onChange={handleEmpleadoChange}
                required
                error={!formData.empleado_id}
              >
                {empleados.map((empleado) => (
                  <MenuItem key={empleado.id} value={empleado.id}>
                    {empleado.nombre} {empleado.apellido} - {empleado.codigo_empleado}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.calculo_automatico}
                    onChange={handleCalculoAutomaticoChange}
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2">
                      Cálculo automático según ley nicaragüense
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      INSS 6.25% • IR según tabla • INSS Patronal 15.5%
                    </Typography>
                  </Box>
                }
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Período de Pago"
                name="periodo_pago"
                value={formData.periodo_pago}
                onChange={handlePeriodoPagoChange}
                placeholder="Ej: Enero 2024, Q1 2024"
                required
                error={!formData.periodo_pago}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Fecha de Pago"
                name="fecha_pago"
                type="date"
                value={formData.fecha_pago}
                onChange={(e) => setFormData({...formData, fecha_pago: e.target.value})}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Salario Bruto"
                name="salario_bruto"
                type="number"
                value={formData.salario_bruto}
                onChange={handleSalarioBrutoChange}
                required
                disabled={calculando}
                error={!formData.salario_bruto || formData.salario_bruto <= 0}
                InputProps={{
                  startAdornment: <span>C$</span>,
                }}
              />
            </Grid>
          </Grid>

          {/* Deducciones */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Deducciones {calculando && <CircularProgress size={20} sx={{ ml: 2 }} />}
              {tasas && (
                <Chip 
                  label={`Límite INSS: ${formatCurrency(tasas.limite_inss)}`} 
                  size="small" 
                  color="info" 
                  sx={{ ml: 2 }}
                />
              )}
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="INSS (6.25%)"
                  type="number"
                  value={formData.deducciones.inss}
                  onChange={(e) => handleDeduccionChange('inss', e.target.value)}
                  disabled={formData.calculo_automatico}
                  InputProps={{
                    startAdornment: <span>C$</span>,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Impuesto sobre la Renta"
                  type="number"
                  value={formData.deducciones.ir}
                  onChange={(e) => handleDeduccionChange('ir', e.target.value)}
                  disabled={formData.calculo_automatico}
                  InputProps={{
                    startAdornment: <span>C$</span>,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Otras Deducciones"
                  type="number"
                  value={formData.deducciones.otros}
                  onChange={(e) => handleDeduccionChange('otros', e.target.value)}
                  InputProps={{
                    startAdornment: <span>C$</span>,
                  }}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Resumen Mejorado */}
          <Card variant="outlined" sx={{ mt: 3, p: 2, backgroundColor: 'grey.50' }}>
            <Typography variant="h6" gutterBottom>
              Resumen de Nómina
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell><strong>Salario Bruto:</strong></TableCell>
                    <TableCell align="right">{formatCurrency(formData.salario_bruto)}</TableCell>
                  </TableRow>
                  
                  {/* Deducciones del empleado */}
                  <TableRow>
                    <TableCell colSpan={2} sx={{ backgroundColor: 'grey.100', pt: 1 }}>
                      <Typography variant="subtitle2">
                        Deducciones del Empleado:
                      </Typography>
                    </TableCell>
                  </TableRow>
                  
                  <TableRow>
                    <TableCell sx={{ pl: 3 }}>INSS (6.25%):</TableCell>
                    <TableCell align="right">-{formatCurrency(formData.deducciones.inss)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ pl: 3 }}>Impuesto Renta:</TableCell>
                    <TableCell align="right">-{formatCurrency(formData.deducciones.ir)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ pl: 3 }}>Otras Deducciones:</TableCell>
                    <TableCell align="right">-{formatCurrency(formData.deducciones.otros)}</TableCell>
                  </TableRow>
                  
                  <TableRow>
                    <TableCell><strong>Total Deducciones:</strong></TableCell>
                    <TableCell align="right">
                      -{formatCurrency(
                        formData.deducciones.inss + 
                        formData.deducciones.ir + 
                        formData.deducciones.otros
                      )}
                    </TableCell>
                  </TableRow>
                  
                  <TableRow sx={{ backgroundColor: 'primary.50' }}>
                    <TableCell><strong>Salario Neto:</strong></TableCell>
                    <TableCell align="right">
                      <strong>{formatCurrency(formData.salario_neto)}</strong>
                    </TableCell>
                  </TableRow>

                  {/* Aportes patronales (solo informativo) */}
                  {formData.calculo_automatico && (
                    <>
                      <TableRow>
                        <TableCell colSpan={2} sx={{ backgroundColor: 'grey.100', pt: 1 }}>
                          <Typography variant="subtitle2">
                            Aportes Patronales (Información):
                          </Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ pl: 3, fontStyle: 'italic' }}>INSS Patronal (15.5%):</TableCell>
                        <TableCell align="right" sx={{ fontStyle: 'italic' }}>
                          +{formatCurrency(formData.deducciones.inss_patronal)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ pl: 3, fontStyle: 'italic' }}>INATEC (1.5%):</TableCell>
                        <TableCell align="right" sx={{ fontStyle: 'italic' }}>
                          +{formatCurrency(formData.deducciones.inatec)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontStyle: 'italic' }}><strong>Costo Total Empresa:</strong></TableCell>
                        <TableCell align="right" sx={{ fontStyle: 'italic' }}>
                          <strong>
                            {formatCurrency(
                              parseFloat(formData.salario_bruto || 0) + 
                              parseFloat(formData.deducciones.inss_patronal || 0) + 
                              parseFloat(formData.deducciones.inatec || 0)
                            )}
                          </strong>
                        </TableCell>
                      </TableRow>
                    </>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={loading || !formData.empleado_id || !formData.salario_bruto || !formData.periodo_pago}
              size="large"
            >
              {loading ? <CircularProgress size={24} /> : 'Generar Nómina'}
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/nominas/gestion')}
            >
              Cancelar
            </Button>
          </Box>
        </form>
      </Card>
    </Box>
  );
};

export default GenerarNomina;