import express from 'express';
import { ReportesController } from '../controllers/reportesController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Dashboard accesible para todos los roles autenticados
router.get('/dashboard', ReportesController.obtenerDashboard);

// Reportes solo para Admin y Directivos
router.get('/asistencia', authorizeRoles('ADMIN_RRHH', 'DIRECTIVO'), ReportesController.obtenerReporteAsistencia);
router.get('/nomina', authorizeRoles('ADMIN_RRHH', 'DIRECTIVO'), ReportesController.obtenerReporteNomina);
router.get('/desempeno', authorizeRoles('ADMIN_RRHH', 'DIRECTIVO'), ReportesController.obtenerReporteDesempeno);

export default router;