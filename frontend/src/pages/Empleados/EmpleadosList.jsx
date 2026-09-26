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
  TablePagination,
  Button,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  ToggleOn as ActivarIcon,
  ToggleOff as DesactivarIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { empleadosService } from '../../services/Api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate, getStatusColor } from '../../utils/formatters';

const EmpleadosList = () => {
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadEmpleados();
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
      setLoading(false);
    }
  };

  const filteredEmpleados = empleados.filter(empleado =>
    empleado.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    empleado.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    empleado.codigo_empleado?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    empleado.departamento?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    empleado.puesto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    empleado.estado_empleado?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleView = (empleadoId) => {
    navigate(`/empleados/${empleadoId}`);
  };

  const handleEdit = (empleadoId) => {
    navigate(`/empleados/editar/${empleadoId}`);
  };

  const handleToggleEstado = async (empleadoId, nuevoEstado) => {
    if (window.confirm(`¿Estás seguro de que quieres ${nuevoEstado ? 'activar' : 'desactivar'} este empleado?`)) {
      try {
        await empleadosService.update(empleadoId, { activo: nuevoEstado });
        loadEmpleados(); // Recargar la lista
      } catch (error) {
        console.error('Error cambiando estado:', error);
        alert('Error al cambiar el estado del empleado');
      }
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Gestión de Empleados
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/empleados/nuevo')}
        >
          Agregar Empleado
        </Button>
      </Box>

      <Card>
        <Box p={2}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Buscar empleados por nombre, apellido, código, departamento, puesto o estado..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Código</strong></TableCell>
                  <TableCell><strong>Nombre Completo</strong></TableCell>
                  <TableCell><strong>Departamento</strong></TableCell>
                  <TableCell><strong>Puesto</strong></TableCell>
                  <TableCell><strong>Tipo Contrato</strong></TableCell>
                  <TableCell><strong>Estado</strong></TableCell>
                  <TableCell><strong>Fecha Contratación</strong></TableCell>
                  <TableCell><strong>Acciones</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredEmpleados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography variant="body1" color="text.secondary">
                        No se encontraron empleados
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEmpleados
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((empleado) => (
                      <TableRow key={empleado.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            {empleado.codigo_empleado}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body1" fontWeight="medium">
                            {empleado.nombre} {empleado.apellido}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {empleado.email}
                          </Typography>
                        </TableCell>
                        <TableCell>{empleado.departamento}</TableCell>
                        <TableCell>{empleado.puesto}</TableCell>
                        <TableCell>
                          <Chip
                            label={empleado.tipo_contrato}
                            size="small"
                            color={getStatusColor(empleado.tipo_contrato)}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={empleado.estado_empleado || 'ACTIVO'}
                            color={getStatusColor(empleado.estado_empleado)}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          {formatDate(empleado.fecha_contratacion)}
                        </TableCell>
                        <TableCell>
                          <Box display="flex" gap={1}>
                            <Tooltip title="Ver detalles">
                              <IconButton
                                color="primary"
                                size="small"
                                onClick={() => handleView(empleado.id)}
                              >
                                <ViewIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Editar empleado">
                              <IconButton
                                color="secondary"
                                size="small"
                                onClick={() => handleEdit(empleado.id)}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={empleado.estado_empleado === 'ACTIVO' ? 'Desactivar empleado' : 'Activar empleado'}>
                              <IconButton
                                color={empleado.estado_empleado === 'ACTIVO' ? 'warning' : 'success'}
                                size="small"
                                onClick={() => handleToggleEstado(empleado.id, empleado.estado_empleado !== 'ACTIVO')}
                              >
                                {empleado.estado_empleado === 'ACTIVO' ? <DesactivarIcon /> : <ActivarIcon />}
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredEmpleados.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Filas por página:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} de ${count}`
            }
          />
        </Box>
      </Card>
    </Box>
  );
};

export default EmpleadosList;