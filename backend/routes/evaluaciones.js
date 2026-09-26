import express from 'express';
import { EvaluacionesController } from '../controllers/evaluacionesController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

// Todos los empleados pueden ver sus evaluaciones
router.get('/mis-evaluaciones', EvaluacionesController.obtenerMisEvaluaciones);

// Directivos y Admin pueden crear y ver evaluaciones
router.post('/', authorizeRoles('ADMIN_RRHH', 'DIRECTIVO'), EvaluacionesController.crearEvaluacion);
router.get('/realizadas', authorizeRoles('ADMIN_RRHH', 'DIRECTIVO'), EvaluacionesController.obtenerEvaluacionesRealizadas);
router.get('/', authorizeRoles('ADMIN_RRHH', 'DIRECTIVO'), EvaluacionesController.obtenerTodasEvaluaciones);
router.put('/:id', authorizeRoles('ADMIN_RRHH', 'DIRECTIVO'), EvaluacionesController.actualizarEvaluacion);

export default router;