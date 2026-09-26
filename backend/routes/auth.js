import express from 'express';
import { AuthController } from '../controllers/authController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { validarLogin, validarRegistro } from '../middleware/validators/auth.js'; 

const router = express.Router();

// Públicas
router.post('/login', validarLogin, AuthController.login);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);
router.get('/validate-reset-token/:token', AuthController.validateResetToken);

// Protegidas
router.get('/profile', authenticateToken, AuthController.getProfile);
router.get('/roles', authenticateToken, authorizeRoles('ADMIN_RRHH'), AuthController.getRoles);
router.post('/register', authenticateToken, authorizeRoles('ADMIN_RRHH'), validarRegistro, AuthController.register);
router.get('/users', authenticateToken, authorizeRoles('ADMIN_RRHH'), AuthController.getUsers);
router.post('/change-password', authenticateToken, AuthController.changePassword);

export default router;