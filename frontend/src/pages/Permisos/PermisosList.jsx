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
  TextField,
  MenuItem,
  Grid,
  Paper,
  IconButton,
  Tooltip,
  Alert,
} from '@mui/material';
import { 
  Add as AddIcon, 
  Refresh as RefreshIcon,
  Visibility as ViewIcon 
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { permisosService } from '../../services/Api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate, getStatusColor } from '../../utils/formatters';

const PermisosList = () => {
  const [permisos, setPermisos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    estado: '',
    tipo_permiso: '',
    fecha_inicio: '',
    fecha_fin: ''
  });
  const navigate = useNavigate();
  const location = useLocation();

  const loadPermisos = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.estado) params.estado = filters.estado;
      if (filters.tipo_permiso) params.tipo_permiso = filters.tipo_permiso;
      if (filters.fecha_inicio) params.fecha_inicio = filters.fecha_inicio;
      if (filters.fecha_fin) params.fecha_fin = filters.fecha_fin;

      const response = await permisosService.getMisPermisos(params);
      if (response.success) {
        setPermisos(response.data);
      } else {
        throw new Error(response.error || 'Error al cargar permisos');
      }
    } catch (error) {
      console.error('Error cargando permisos:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadPermisos();
  }, [loadPermisos]);

  // Mostrar mensaje de éxito después de redirección
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Limpiar el estado de navegación
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      estado: '',
      tipo_permiso: '',
      fecha_inicio: '',
      fecha_fin: ''
    });
  };

  const calcularDias = (fechaInicio, fechaFin) => {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const diferenciaTiempo = fin.getTime() - inicio.getTime();
    return Math.ceil(diferenciaTiempo / (1000 * 3600 * 24)) + 1;
  };

  const getEstadosUnicos = () => {
    return [...new Set(permisos.map(p => p.estado))];
  };

  const getTiposUnicos = () => {
    return [...new Set(permisos.map(p => p.tipo_permiso))];
  };

  const permisosFiltrados = permisos; // Ya vienen filtrados del servicio

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Mis Permisos
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/permisos/solicitar')}
        >
          Solicitar Permiso
        </Button>
      </Box>

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}

      {/* Filtros */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Filtros</Typography>
          <Box>
            <Tooltip title="Actualizar">
              <IconButton onClick={loadPermisos} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button onClick={clearFilters} size="small">
              Limpiar
            </Button>
          </Box>
        </Box>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              select
              label="Estado"
              value={filters.estado}
              onChange={(e) => handleFilterChange('estado', e.target.value)}
              size="small"
            >
              <MenuItem value="">Todos los estados</MenuItem>
              {getEstadosUnicos().map(estado => (
                <MenuItem key={estado} value={estado}>
                  <Chip 
                    label={estado} 
                    size="small" 
                    color={getStatusColor(estado)}
                    variant="outlined"
                  />
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              select
              label="Tipo de Permiso"
              value={filters.tipo_permiso}
              onChange={(e) => handleFilterChange('tipo_permiso', e.target.value)}
              size="small"
            >
              <MenuItem value="">Todos los tipos</MenuItem>
              {getTiposUnicos().map(tipo => (
                <MenuItem key={tipo} value={tipo}>{tipo}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Fecha Desde"
              type="date"
              value={filters.fecha_inicio}
              onChange={(e) => handleFilterChange('fecha_inicio', e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Fecha Hasta"
              type="date"
              value={filters.fecha_fin}
              onChange={(e) => handleFilterChange('fecha_fin', e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
          </Grid>
        </Grid>
      </Paper>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tipo</TableCell>
                <TableCell>Fechas</TableCell>
                <TableCell>Duración</TableCell>
                <TableCell>Motivo</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Fecha Solicitud</TableCell>
                <TableCell>Comentarios</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {permisosFiltrados.map((permiso) => {
                const dias = calcularDias(permiso.fecha_inicio, permiso.fecha_fin);
                
                return (
                  <TableRow key={permiso.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {permiso.tipo_permiso}
                      </Typography>
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
                      <Chip
                        label={`${dias} día${dias !== 1 ? 's' : ''}`}
                        size="small"
                        variant="outlined"
                        color={dias > 5 ? 'warning' : 'default'}
                      />
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
                        label={permiso.estado}
                        color={getStatusColor(permiso.estado)}
                        size="small"
                        variant="filled"
                      />
                    </TableCell>
                    <TableCell>
                      {formatDate(permiso.created_at)}
                    </TableCell>
                    <TableCell>
                      {permiso.comentarios_aprobador ? (
                        <Tooltip title={permiso.comentarios_aprobador}>
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ 
                              maxWidth: 150,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {permiso.comentarios_aprobador}
                          </Typography>
                        </Tooltip>
                      ) : (
                        <Typography variant="body2" color="text.secondary" fontStyle="italic">
                          Sin comentarios
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {permisosFiltrados.length === 0 && !loading && (
          <Box p={3} textAlign="center">
            <Typography variant="body1" color="text.secondary">
              {permisos.length === 0 
                ? 'No has solicitado ningún permiso aún.' 
                : 'No se encontraron permisos con los filtros aplicados.'}
            </Typography>
          </Box>
        )}
      </Card>

      {loading && <LoadingSpinner />}
    </Box>
  );
};

export default PermisosList;