import express from 'express';
import { PermisosController } from '../controllers/PermisosController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

// Empleados pueden solicitar y ver sus permisos
router.post('/solicitar', PermisosController.solicitarPermiso);
router.get('/mis-permisos', PermisosController.obtenerMisPermisos);

// Admin y Directivos pueden ver y gestionar permisos
router.get('/pendientes', authorizeRoles('ADMIN_RRHH', 'DIRECTIVO'), PermisosController.obtenerPermisosPendientes);
router.get('/', authorizeRoles('ADMIN_RRHH', 'DIRECTIVO'), PermisosController.obtenerTodosPermisos);
router.put('/:id/aprobar', authorizeRoles('ADMIN_RRHH', 'DIRECTIVO'), PermisosController.aprobarRechazarPermiso);

export default router;