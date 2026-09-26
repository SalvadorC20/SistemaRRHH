import express from 'express';
import { NominasController } from '../controllers/nominasController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

// Empleados pueden ver sus nóminas
router.get('/mis-nominas', NominasController.obtenerMisNominas);

// Cálculos y validaciones (disponible para todos los autenticados)
router.post('/calcular-deducciones', NominasController.calcularDeducciones);
router.get('/tasas-actuales', NominasController.obtenerTasasActuales);
router.post('/validar', NominasController.validarNomina);

// Estadísticas y reportes
router.get('/estadisticas/generales', authorizeRoles('ADMIN_RRHH', 'DIRECTIVO'), NominasController.obtenerEstadisticasGenerales);
router.get('/resumen/:periodo', authorizeRoles('ADMIN_RRHH', 'DIRECTIVO'), NominasController.obtenerResumenPeriodo);
router.get('/reporte-legal/:periodo', authorizeRoles('ADMIN_RRHH', 'DIRECTIVO'), NominasController.generarReporteLegal);

// Admin puede gestionar nóminas
router.post('/', authorizeRoles('ADMIN_RRHH'), NominasController.generarNomina);
router.get('/', authorizeRoles('ADMIN_RRHH', 'DIRECTIVO'), NominasController.obtenerTodasNominas);
router.put('/:id/estado', authorizeRoles('ADMIN_RRHH'), NominasController.actualizarEstadoNomina);

export default router;