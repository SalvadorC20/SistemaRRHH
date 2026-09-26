import express from 'express';
import { ExpedientesController } from '../controllers/expedientesController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

router.get('/mi-expediente', ExpedientesController.obtenerMiExpediente);
router.get('/empleado/:empleadoId', authorizeRoles('ADMIN_RRHH', 'DIRECTIVO'), ExpedientesController.obtenerExpedienteEmpleado);
router.post('/empleado/:empleadoId', authorizeRoles('ADMIN_RRHH'), ExpedientesController.guardarExpediente);
router.put('/:id', authorizeRoles('ADMIN_RRHH'), ExpedientesController.actualizarExpediente);
router.delete('/:id/documentos/:documentoNombre', authorizeRoles('ADMIN_RRHH'), ExpedientesController.eliminarDocumento);

export default router;