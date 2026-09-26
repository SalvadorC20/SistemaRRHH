import express from 'express';
import { DemoController } from '../controllers/demoController.js';

const router = express.Router();

// Ruta pública para listar roles demo disponibles
router.get('/roles', DemoController.getDemoRoles);

// Ruta pública para restablecer datos demo
router.post('/reset', DemoController.resetDemo);

export default router;
