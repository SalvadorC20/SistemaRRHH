import express from 'express';
import { AsistenciaController } from '../controllers/asistenciaController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

// Empleados pueden registrar y ver su asistencia
router.post('/registrar', AsistenciaController.registrarAsistencia);
router.get('/mi-asistencia', AsistenciaController.obtenerMiAsistencia);

// Admin y Directivos pueden gestionar asistencia
router.put('/:id/justificar', authorizeRoles('ADMIN_RRHH', 'DIRECTIVO'), AsistenciaController.justificarInasistencia);
router.get('/reporte', authorizeRoles('ADMIN_RRHH', 'DIRECTIVO'), AsistenciaController.obtenerReporteAsistencia);

export default router;