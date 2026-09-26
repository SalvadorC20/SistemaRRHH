import express from 'express';
import { CapacitacionesController } from '../controllers/capacitacionesController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import {
    validarCapacitacion,
    validarAsignacionEmpleados,
    validarProgreso,
    validarActualizacionCapacitacion,
    validarIdCapacitacion
} from '../middleware/validators/capacitaciones.js';

const router = express.Router();

router.use(authenticateToken);

// Aplicar validador de ID a todas las rutas que usen :id
router.param('id', validarIdCapacitacion);

// Rutas públicas (todos los autenticados)
router.get('/', CapacitacionesController.obtenerCapacitaciones);
router.get('/mis-capacitaciones', CapacitacionesController.obtenerMisCapacitaciones);
router.get('/estadisticas', CapacitacionesController.obtenerEstadisticas);
router.get('/proximas', CapacitacionesController.obtenerCapacitacionesProximas);
router.get('/reporte-participacion', CapacitacionesController.obtenerReporteParticipacion);
router.get('/:id', CapacitacionesController.obtenerCapacitacion); // Ya no necesita validador específico

// Rutas de administración (solo Admin RRHH)
router.post('/', authorizeRoles('ADMIN_RRHH'), validarCapacitacion, CapacitacionesController.crearCapacitacion);
router.put('/:id', authorizeRoles('ADMIN_RRHH'), validarActualizacionCapacitacion, CapacitacionesController.actualizarCapacitacion);
router.delete('/:id', authorizeRoles('ADMIN_RRHH'), CapacitacionesController.eliminarCapacitacion);

// Gestión de participantes
router.post('/:id/asignar', authorizeRoles('ADMIN_RRHH'), validarAsignacionEmpleados, CapacitacionesController.asignarEmpleados);
router.delete('/:id/empleados/:empleadoId', authorizeRoles('ADMIN_RRHH'), CapacitacionesController.desasignarEmpleado);

// Gestión de progreso
router.put('/:id/empleados/:empleadoId/progreso', authorizeRoles('ADMIN_RRHH'), validarProgreso, CapacitacionesController.actualizarProgreso);

export default router;