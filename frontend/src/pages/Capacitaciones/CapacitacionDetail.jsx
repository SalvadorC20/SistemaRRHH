import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  Grid,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  Alert,
  Snackbar,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Paper,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  Email as EmailIcon,
  PersonRemove as RemoveIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  BarChart as ChartIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { capacitacionesService } from '../../services/Api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate, getStatusColor, getEstadoCapacitacion } from '../../utils/formatters';

const TabPanel = ({ children, value, index, ...other }) => (
  <div role="tabpanel" hidden={value !== index} {...other}>
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const CapacitacionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [capacitacion, setCapacitacion] = useState(null);
  const [empleadosNoAsignados, setEmpleadosNoAsignados] = useState([]);
  const [selectedEmpleados, setSelectedEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [asignando, setAsignando] = useState(false);
  const [actualizando, setActualizando] = useState({});
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [removeDialog, setRemoveDialog] = useState({ open: false, empleado: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    // Obtener el ID del usuario actual del localStorage
    const getUserFromStorage = () => {
      try {
        const userData = localStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          return user.id;
        }
      } catch (error) {
        console.error('Error obteniendo usuario del localStorage:', error);
      }
      return null;
    };

    const userId = getUserFromStorage();
    setCurrentUserId(userId);
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await capacitacionesService.getById(id);
      if (response.success) {
        setCapacitacion(response.data);
        
        // Filtrar empleados excluyendo al usuario actual
        const empleadosFiltrados = (response.data.empleados_no_asignados || [])
          .filter(empleado => empleado.id !== currentUserId);
        
        setEmpleadosNoAsignados(empleadosFiltrados);
      } else {
        throw new Error(response.error || 'Error al cargar la capacitación');
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
      showSnackbar(error.message || 'Error cargando datos de la capacitación', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleAsignarEmpleados = async () => {
    if (selectedEmpleados.length === 0) {
      showSnackbar('Selecciona al menos un empleado', 'warning');
      return;
    }

    // Validar que no se esté intentando asignar al usuario actual
    if (selectedEmpleados.includes(currentUserId)) {
      showSnackbar('No puedes asignarte a ti mismo', 'error');
      return;
    }

    setAsignando(true);
    try {
      await capacitacionesService.asignarEmpleados(id, {
        empleados: selectedEmpleados
      });
      
      await loadData();
      setSelectedEmpleados([]);
      showSnackbar(`${selectedEmpleados.length} empleado(s) asignado(s) exitosamente`);
    } catch (error) {
      console.error('Error asignando empleados:', error);
      showSnackbar(error.message || 'Error al asignar empleados', 'error');
    } finally {
      setAsignando(false);
    }
  };

  const handleDesasignarEmpleado = async (empleado) => {
    try {
      await capacitacionesService.desasignarEmpleado(id, empleado.empleado_id);
      await loadData();
      showSnackbar('Empleado desasignado exitosamente');
      setRemoveDialog({ open: false, empleado: null });
    } catch (error) {
      console.error('Error desasignando empleado:', error);
      showSnackbar(error.message || 'Error al desasignar empleado', 'error');
    }
  };

  const handleActualizarProgreso = async (empleadoId, campo, valor) => {
    // Validar antes de enviar
    if (campo === 'progreso') {
      const progreso = parseInt(valor);
      if (isNaN(progreso) || progreso < 0 || progreso > 100) {
        showSnackbar('El progreso debe ser un número entre 0 y 100', 'error');
        return;
      }
    }

    if (campo === 'calificacion' && valor !== '') {
      const calificacion = parseFloat(valor);
      if (isNaN(calificacion) || calificacion < 0 || calificacion > 100) {
        showSnackbar('La calificación debe ser un número entre 0 y 100', 'error');
        return;
      }
    }

    setActualizando(prev => ({ ...prev, [empleadoId]: true }));
    
    try {
      const participante = capacitacion.empleados_asignados?.find(p => p.empleado_id === empleadoId);
      
      const datosActualizacion = {
        progreso: campo === 'progreso' ? parseInt(valor) : participante?.progreso || 0,
        asistio: campo === 'asistio' ? valor === 'true' : participante?.asistio || false,
        calificacion: campo === 'calificacion' ? (valor === '' ? null : parseFloat(valor)) : participante?.calificacion
      };

      await capacitacionesService.actualizarProgreso(id, empleadoId, datosActualizacion);
      await loadData();
      showSnackbar('Progreso actualizado exitosamente');
    } catch (error) {
      console.error('Error actualizando progreso:', error);
      showSnackbar(error.message || 'Error al actualizar progreso', 'error');
    } finally {
      setActualizando(prev => ({ ...prev, [empleadoId]: false }));
    }
  };

  const handleEliminarCapacitacion = async () => {
    try {
      await capacitacionesService.delete(id);
      showSnackbar('Capacitación eliminada exitosamente');
      navigate('/capacitaciones/gestion');
    } catch (error) {
      console.error('Error eliminando capacitación:', error);
      showSnackbar(error.message || 'Error al eliminar capacitación', 'error');
      setDeleteDialog(false);
    }
  };

  const getEstadoAutomatico = () => {
    if (!capacitacion) return 'PLANIFICADA';
    return getEstadoCapacitacion(capacitacion.fecha_inicio, capacitacion.fecha_fin);
  };

  const puedeEditarAsistencia = () => {
    const estado = getEstadoAutomatico();
    return estado === 'EN_CURSO' || estado === 'COMPLETADA';
  };

  const getProgresoPromedio = () => {
    if (!capacitacion.empleados_asignados?.length) return 0;
    const participantesConProgreso = capacitacion.empleados_asignados.filter(emp => emp.progreso !== undefined && emp.progreso !== null);
    if (participantesConProgreso.length === 0) return 0;
    
    const total = participantesConProgreso.reduce((sum, emp) => sum + (emp.progreso || 0), 0);
    return Math.round(total / participantesConProgreso.length);
  };

  const getCalificacionPromedio = () => {
    if (!capacitacion.empleados_asignados?.length) return 0;
    const participantesConCalificacion = capacitacion.empleados_asignados.filter(emp => emp.calificacion !== undefined && emp.calificacion !== null);
    if (participantesConCalificacion.length === 0) return 0;
    
    const total = participantesConCalificacion.reduce((sum, emp) => sum + (emp.calificacion || 0), 0);
    return Math.round((total / participantesConCalificacion.length) * 10) / 10; // Un decimal
  };

  if (loading) return <LoadingSpinner />;
  if (!capacitacion) {
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="h6" color="text.secondary">
          Capacitación no encontrada
        </Typography>
        <Button 
          variant="outlined" 
          onClick={() => navigate('/capacitaciones/gestion')}
          sx={{ mt: 2 }}
        >
          Volver a la lista
        </Button>
      </Box>
    );
  }

  const estadoAutomatico = getEstadoAutomatico();
  const progresoPromedio = getProgresoPromedio();
  const calificacionPromedio = getCalificacionPromedio();

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            {capacitacion.nombre}
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            {capacitacion.descripcion}
          </Typography>
          <Box display="flex" gap={1} flexWrap="wrap">
            <Chip 
              label={estadoAutomatico} 
              color={getStatusColor(estadoAutomatico)} 
            />
            <Chip 
              label={`${capacitacion.participantes_count || 0} participantes`} 
              variant="outlined" 
            />
            <Chip 
              label={`Progreso: ${progresoPromedio}%`} 
              color="primary" 
              variant="outlined"
            />
          </Box>
        </Box>
        <Box display="flex" gap={1} flexWrap="wrap">
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/capacitaciones/editar/${id}`)}
          >
            Editar
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => setDeleteDialog(true)}
          >
            Eliminar
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate('/capacitaciones/gestion')}
          >
            Volver
          </Button>
        </Box>
      </Box>

      {/* Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Información General" />
          <Tab label={`Participantes (${capacitacion.empleados_asignados?.length || 0})`} />
          <Tab label="Asignar Empleados" />
          <Tab label="Estadísticas" />
        </Tabs>

        {/* Tab 1: Información General */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Detalles de la Capacitación</Typography>
                <Box sx={{ '& > *': { mb: 2 } }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Descripción:</Typography>
                    <Typography variant="body1">{capacitacion.descripcion}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Fechas:</Typography>
                    <Typography variant="body1">
                      {formatDate(capacitacion.fecha_inicio)} - {formatDate(capacitacion.fecha_fin)}
                    </Typography>
                  </Box>
                  {capacitacion.duracion_horas && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">Duración:</Typography>
                      <Typography variant="body1">{capacitacion.duracion_horas} horas</Typography>
                    </Box>
                  )}
                  {capacitacion.instructor && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">Instructor:</Typography>
                      <Typography variant="body1">{capacitacion.instructor}</Typography>
                    </Box>
                  )}
                  {capacitacion.ubicacion && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">Ubicación:</Typography>
                      <Typography variant="body1">{capacitacion.ubicacion}</Typography>
                    </Box>
                  )}
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body2" color="text.secondary">Estado automático:</Typography>
                    <Chip 
                      label={estadoAutomatico} 
                      color={getStatusColor(estadoAutomatico)} 
                      size="small"
                    />
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body2" color="text.secondary">Estado en sistema:</Typography>
                    <Chip 
                      label={capacitacion.estado} 
                      color={getStatusColor(capacitacion.estado)} 
                      size="small"
                    />
                  </Box>
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Resumen de Participación</Typography>
                <Box sx={{ '& > *': { mb: 2 } }}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2">Total de participantes:</Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {capacitacion.participantes_count || 0}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2">Asistentes confirmados:</Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {capacitacion.asistentes_count || 0}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2">Progreso promedio:</Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {progresoPromedio}%
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2">Calificación promedio:</Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {calificacionPromedio || 'N/A'}
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={progresoPromedio} 
                    color={progresoPromedio >= 80 ? 'success' : progresoPromedio >= 50 ? 'warning' : 'primary'}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 2: Participantes */}
        <TabPanel value={tabValue} index={1}>
          <Card>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Empleado</TableCell>
                    <TableCell>Departamento</TableCell>
                    <TableCell>Progreso</TableCell>
                    <TableCell>Asistió</TableCell>
                    <TableCell>Calificación</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {capacitacion.empleados_asignados?.map((participante) => (
                    <TableRow key={participante.id || participante.empleado_id}>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar sx={{ width: 32, height: 32, mr: 2 }}>
                            {participante.nombre?.[0]}{participante.apellido?.[0]}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              {participante.nombre} {participante.apellido}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {participante.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{participante.departamento}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {participante.puesto}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ width: 150 }}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <TextField
                            type="number"
                            size="small"
                            value={participante.progreso || 0}
                            onChange={(e) => handleActualizarProgreso(
                              participante.empleado_id, 
                              'progreso', 
                              e.target.value
                            )}
                            onBlur={(e) => {
                              let valor = parseInt(e.target.value);
                              if (isNaN(valor)) valor = 0;
                              if (valor < 0) valor = 0;
                              if (valor > 100) valor = 100;
                              handleActualizarProgreso(participante.empleado_id, 'progreso', valor);
                            }}
                            inputProps={{ 
                              min: 0, 
                              max: 100, 
                              step: 10
                            }}
                            disabled={actualizando[participante.empleado_id]}
                            sx={{ width: 80 }}
                          />
                          <Typography variant="body2">%</Typography>
                          {actualizando[participante.empleado_id] && (
                            <CircularProgress size={20} />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <TextField
                          select
                          size="small"
                          value={participante.asistio ? 'true' : 'false'}
                          onChange={(e) => handleActualizarProgreso(
                            participante.empleado_id, 
                            'asistio', 
                            e.target.value
                          )}
                          disabled={!puedeEditarAsistencia() || actualizando[participante.empleado_id]}
                          sx={{ width: 100 }}
                        >
                          <MenuItem value="true">Sí</MenuItem>
                          <MenuItem value="false">No</MenuItem>
                        </TextField>
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          size="small"
                          value={participante.calificacion || ''}
                          onChange={(e) => handleActualizarProgreso(
                            participante.empleado_id, 
                            'calificacion', 
                            e.target.value
                          )}
                          inputProps={{ 
                            min: 0, 
                            max: 100, 
                            step: 0.1
                          }}
                          disabled={actualizando[participante.empleado_id]}
                          sx={{ width: 100 }}
                          placeholder="N/A"
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Notificar participante">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => showSnackbar(`Notificación enviada a ${participante.nombre}`)}
                          >
                            <EmailIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Remover participante">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => setRemoveDialog({ open: true, empleado: participante })}
                          >
                            <RemoveIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {(!capacitacion.empleados_asignados || capacitacion.empleados_asignados.length === 0) && (
              <Alert severity="info" sx={{ m: 2 }}>
                No hay empleados asignados a esta capacitación
              </Alert>
            )}
          </Card>
        </TabPanel>

        {/* Tab 3: Asignar Empleados */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Asignar Nuevos Participantes</Typography>
                
                {/* Mensaje informativo */}
                <Alert severity="info" sx={{ mb: 2 }}>
                  Nota: No puedes asignarte a ti mismo como participante.
                </Alert>
                
                <TextField
                  fullWidth
                  select
                  SelectProps={{ 
                    multiple: true,
                    renderValue: (selected) => `${selected.length} empleado(s) seleccionado(s)`
                  }}
                  label="Seleccionar Empleados"
                  value={selectedEmpleados}
                  onChange={(e) => setSelectedEmpleados(e.target.value)}
                  helperText={`${selectedEmpleados.length} empleado(s) seleccionado(s)`}
                  sx={{ mb: 2 }}
                >
                  {empleadosNoAsignados.map((empleado) => (
                    <MenuItem 
                      key={empleado.id} 
                      value={empleado.id}
                      disabled={empleado.id === currentUserId} // Deshabilitar la opción del admin
                    >
                      {empleado.nombre} {empleado.apellido} - {empleado.puesto} ({empleado.departamento})
                      {empleado.id === currentUserId && " (Tú)"}
                    </MenuItem>
                  ))}
                </TextField>
                <Button 
                  variant="contained" 
                  onClick={handleAsignarEmpleados}
                  disabled={asignando || selectedEmpleados.length === 0}
                  fullWidth
                  startIcon={asignando ? <CircularProgress size={20} /> : null}
                >
                  {asignando ? 'Asignando...' : `Asignar ${selectedEmpleados.length} Empleado(s)`}
                </Button>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Empleados Disponibles ({empleadosNoAsignados.length})
                </Typography>
                <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                  {empleadosNoAsignados.map((empleado, index) => (
                    <React.Fragment key={empleado.id}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar>
                            {empleado.nombre?.[0]}{empleado.apellido?.[0]}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center">
                              <Typography variant="body1">
                                {empleado.nombre} {empleado.apellido}
                              </Typography>
                              {empleado.id === currentUserId && (
                                <Chip 
                                  label="Tú" 
                                  size="small" 
                                  color="primary" 
                                  sx={{ ml: 1 }}
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" component="span" display="block">
                                {empleado.puesto}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {empleado.departamento}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < empleadosNoAsignados.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
                {empleadosNoAsignados.length === 0 && (
                  <Alert severity="info">
                    Todos los empleados están asignados a esta capacitación
                  </Alert>
                )}
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 4: Estadísticas */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 3, textAlign: 'center' }}>
                <ChartIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="h4" gutterBottom>
                  {progresoPromedio}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Progreso Promedio
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={progresoPromedio} 
                  sx={{ mt: 2, height: 8, borderRadius: 4 }}
                />
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h4" gutterBottom>
                  {capacitacion.asistentes_count || 0}/{capacitacion.participantes_count || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tasa de Asistencia
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {capacitacion.participantes_count ? 
                    Math.round((capacitacion.asistentes_count / capacitacion.participantes_count) * 100) : 0
                  }%
                </Typography>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h4" gutterBottom>
                  {capacitacion.empleados_asignados?.filter(e => e.calificacion >= 70).length || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Aprobados (≥70)
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {capacitacion.empleados_asignados?.length ? 
                    Math.round((capacitacion.empleados_asignados.filter(e => e.calificacion >= 70).length / capacitacion.empleados_asignados.length) * 100) : 0
                  }% de aprobación
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>

      {/* Dialogs */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar la capacitación "{capacitacion.nombre}"? 
            Esta acción no se puede deshacer y se perderán todos los datos asociados.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancelar</Button>
          <Button onClick={handleEliminarCapacitacion} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={removeDialog.open} onClose={() => setRemoveDialog({ open: false, empleado: null })}>
        <DialogTitle>Confirmar Remoción</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas remover a {removeDialog.empleado?.nombre} {removeDialog.empleado?.apellido} 
            de esta capacitación? Se perderá su progreso y calificación.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRemoveDialog({ open: false, empleado: null })}>Cancelar</Button>
          <Button onClick={() => handleDesasignarEmpleado(removeDialog.empleado)} color="error" variant="contained">
            Remover
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Box>
  );
};

export default CapacitacionDetail;