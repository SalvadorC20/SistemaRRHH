import React, { useState, useEffect, useCallback } from 'react';
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
  TextField,
  Alert,
  Snackbar,
  Paper,
  IconButton,
  Tooltip,
  MenuItem, // AÑADIR ESTA IMPORTACIÓN
  CircularProgress, // AÑADIR ESTA IMPORTACIÓN TAMBIÉN
} from '@mui/material';
import { 
  Check as CheckIcon, 
  Close as CloseIcon,
  Refresh as RefreshIcon 
} from '@mui/icons-material';
import { permisosService } from '../../services/Api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate, getStatusColor } from '../../utils/formatters';

const GestionPermisos = () => {
  const [permisos, setPermisos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedPermiso, setSelectedPermiso] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [comentarios, setComentarios] = useState('');
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });
  const [filters, setFilters] = useState({
    departamento: '',
    tipo: ''
  });

  // Memoizar la carga de permisos
  const loadPermisosPendientes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await permisosService.getPendientes();
      if (response.success) {
        setPermisos(response.data);
      } else {
        throw new Error(response.error || 'Error al cargar permisos');
      }
    } catch (error) {
      console.error('Error cargando permisos pendientes:', error);
      showSnackbar(
        error.message || 'Error cargando permisos pendientes', 
        'error'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPermisosPendientes();
  }, [loadPermisosPendientes]);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleAprobarRechazar = (permiso, accion) => {
    setSelectedPermiso({ ...permiso, accion });
    setComentarios('');
    setDialogOpen(true);
  };

  const confirmarAccion = async () => {
    if (!selectedPermiso) return;

    setProcessing(true);
    try {
      const estado = selectedPermiso.accion === 'aprobar' ? 'APROBADO' : 'RECHAZADO';
      
      // Validación adicional para comentarios en rechazo
      if (estado === 'RECHAZADO' && !comentarios.trim()) {
        showSnackbar('Es necesario especificar el motivo del rechazo', 'warning');
        return;
      }
      
      const response = await permisosService.aprobarRechazar(selectedPermiso.id, {
        estado,
        comentarios: comentarios.trim() || undefined
      });
      
      if (response.success) {
        showSnackbar(response.message || `Permiso ${estado.toLowerCase()} exitosamente`);
        setDialogOpen(false);
        await loadPermisosPendientes();
      } else {
        throw new Error(response.error || 'Error al procesar la solicitud');
      }
    } catch (error) {
      console.error('Error actualizando permiso:', error);
      const errorMessage = error.message || 'Error al procesar la solicitud';
      showSnackbar(errorMessage, 'error');
    } finally {
      setProcessing(false);
    }
  };

  const calcularDiasPermiso = (fechaInicio, fechaFin) => {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const diferenciaTiempo = fin.getTime() - inicio.getTime();
    return Math.ceil(diferenciaTiempo / (1000 * 3600 * 24)) + 1;
  };

  // Filtrar permisos
  const permisosFiltrados = permisos.filter(permiso => {
    if (filters.departamento && permiso.departamento !== filters.departamento) {
      return false;
    }
    if (filters.tipo && permiso.tipo_permiso !== filters.tipo) {
      return false;
    }
    return true;
  });

  // Obtener departamentos únicos para filtros
  const departamentosUnicos = [...new Set(permisos.map(p => p.departamento))];
  const tiposUnicos = [...new Set(permisos.map(p => p.tipo_permiso))];

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 0 }}>
          Gestión de Permisos Pendientes
        </Typography>
        <Tooltip title="Actualizar">
          <IconButton 
            onClick={loadPermisosPendientes} 
            color="primary"
            disabled={loading}
          >
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Filtros */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Filtros
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            select
            label="Departamento"
            value={filters.departamento}
            onChange={(e) => setFilters(prev => ({ ...prev, departamento: e.target.value }))}
            sx={{ minWidth: 200 }}
            size="small"
          >
            <MenuItem value="">Todos los departamentos</MenuItem>
            {departamentosUnicos.map(depto => (
              <MenuItem key={depto} value={depto}>{depto}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Tipo de Permiso"
            value={filters.tipo}
            onChange={(e) => setFilters(prev => ({ ...prev, tipo: e.target.value }))}
            sx={{ minWidth: 200 }}
            size="small"
          >
            <MenuItem value="">Todos los tipos</MenuItem>
            {tiposUnicos.map(tipo => (
              <MenuItem key={tipo} value={tipo}>{tipo}</MenuItem>
            ))}
          </TextField>
        </Box>
      </Paper>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Empleado</TableCell>
                <TableCell>Departamento</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Fechas</TableCell>
                <TableCell>Motivo</TableCell>
                <TableCell>Días</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {permisosFiltrados.map((permiso) => {
                const diferenciaDias = calcularDiasPermiso(permiso.fecha_inicio, permiso.fecha_fin);

                return (
                  <TableRow key={permiso.id} hover>
                    <TableCell>
                      <Typography variant="body1" fontWeight="bold">
                        {permiso.nombre} {permiso.apellido}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {permiso.codigo_empleado}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {permiso.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={permiso.departamento}
                        size="small"
                        variant="outlined"
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {permiso.puesto}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={permiso.tipo_permiso}
                        color="primary"
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        <strong>Inicio:</strong> {formatDate(permiso.fecha_inicio)}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Fin:</strong> {formatDate(permiso.fecha_fin)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Tooltip title={permiso.motivo}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            maxWidth: 200,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {permiso.motivo}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${diferenciaDias} día${diferenciaDias !== 1 ? 's' : ''}`}
                        size="small"
                        color={diferenciaDias > 5 ? 'warning' : 'default'}
                        variant={diferenciaDias > 10 ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1} flexDirection={{ xs: 'column', sm: 'row' }}>
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          startIcon={<CheckIcon />}
                          onClick={() => handleAprobarRechazar(permiso, 'aprobar')}
                          disabled={processing}
                        >
                          Aprobar
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          startIcon={<CloseIcon />}
                          onClick={() => handleAprobarRechazar(permiso, 'rechazar')}
                          disabled={processing}
                        >
                          Rechazar
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {permisosFiltrados.length === 0 && (
          <Box p={3} textAlign="center">
            <Typography variant="body1" color="text.secondary">
              {permisos.length === 0 
                ? 'No hay permisos pendientes de aprobación.' 
                : 'No se encontraron permisos con los filtros aplicados.'}
            </Typography>
          </Box>
        )}
      </Card>

      {/* Dialog de confirmación */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => !processing && setDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>
          {selectedPermiso?.accion === 'aprobar' ? 'Aprobar' : 'Rechazar'} Permiso
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            ¿Estás seguro de que deseas {selectedPermiso?.accion === 'aprobar' ? 'aprobar' : 'rechazar'} el permiso de:
          </Typography>
          <Typography variant="body1" fontWeight="bold" gutterBottom>
            {selectedPermiso?.nombre} {selectedPermiso?.apellido}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {selectedPermiso?.tipo_permiso} • {formatDate(selectedPermiso?.fecha_inicio)} - {formatDate(selectedPermiso?.fecha_fin)}
            {' • '}{calcularDiasPermiso(selectedPermiso?.fecha_inicio, selectedPermiso?.fecha_fin)} días
          </Typography>
          
          {selectedPermiso?.accion === 'rechazar' && (
            <Alert severity="warning" sx={{ my: 1 }}>
              Es recomendable especificar el motivo del rechazo.
            </Alert>
          )}
          
          <TextField
            fullWidth
            multiline
            rows={3}
            label={selectedPermiso?.accion === 'aprobar' ? 'Comentarios (opcional)' : 'Motivo del rechazo *'}
            value={comentarios}
            onChange={(e) => setComentarios(e.target.value)}
            sx={{ mt: 2 }}
            placeholder={
              selectedPermiso?.accion === 'aprobar' 
                ? 'Agregar comentarios de aprobación...' 
                : 'Especificar motivo del rechazo...'
            }
            error={selectedPermiso?.accion === 'rechazar' && !comentarios.trim()}
            helperText={
              selectedPermiso?.accion === 'rechazar' && !comentarios.trim() 
                ? 'El motivo del rechazo es obligatorio' 
                : ''
            }
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDialogOpen(false)} 
            disabled={processing}
          >
            Cancelar
          </Button>
          <Button 
            onClick={confirmarAccion} 
            variant="contained"
            color={selectedPermiso?.accion === 'aprobar' ? 'success' : 'error'}
            disabled={processing || (selectedPermiso?.accion === 'rechazar' && !comentarios.trim())}
            startIcon={processing ? <CircularProgress size={16} /> : null}
          >
            {processing ? 'Procesando...' : selectedPermiso?.accion === 'aprobar' ? 'Aprobar' : 'Rechazar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={handleCloseSnackbar}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default GestionPermisos;