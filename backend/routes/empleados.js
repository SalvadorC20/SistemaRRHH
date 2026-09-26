import express from 'express';
import { EmpleadosController } from '../controllers/empleadosController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
// CORREGIR: Cambiar la ruta de importación
import { validarEmpleado } from '../middleware/validators/empleados.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

router.post('/', authorizeRoles('ADMIN_RRHH'), validarEmpleado, EmpleadosController.crearEmpleado);
router.get('/', authorizeRoles('ADMIN_RRHH', 'DIRECTIVO'), EmpleadosController.obtenerEmpleados);
router.get('/mi-perfil', EmpleadosController.obtenerMiPerfil);
router.get('/:id', authorizeRoles('ADMIN_RRHH', 'DIRECTIVO'), EmpleadosController.obtenerEmpleado);
router.put('/:id', authorizeRoles('ADMIN_RRHH'), EmpleadosController.actualizarEmpleado);

export default router;