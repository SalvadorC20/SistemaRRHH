import express from 'express';
import { HorariosController } from '../controllers/horariosController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

router.get('/mis-horarios', HorariosController.obtenerMisHorarios);
router.get('/empleado/:empleadoId', authorizeRoles('ADMIN_RRHH', 'DIRECTIVO'), HorariosController.obtenerHorariosEmpleado);
router.post('/empleado/:empleadoId', authorizeRoles('ADMIN_RRHH'), HorariosController.guardarHorarios);
router.post('/validar-disponibilidad', authorizeRoles('ADMIN_RRHH'), HorariosController.validarDisponibilidad);
router.get('/', authorizeRoles('ADMIN_RRHH', 'DIRECTIVO'), HorariosController.obtenerTodosHorarios);

export default router;