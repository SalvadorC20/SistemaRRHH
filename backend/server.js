import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { EventEmitter } from 'events';

EventEmitter.defaultMaxListeners = 20;

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
// Configuración de CORS dinámica para desarrollo y despliegues en Vercel
const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173'
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Permitir solicitudes sin origin (como apps móviles, Postman o curl)
        if (!origin) return callback(null, true);
        if (
            allowedOrigins.includes(origin) ||
            origin.endsWith('.vercel.app') ||
            process.env.NODE_ENV === 'development'
        ) {
            return callback(null, true);
        }
        return callback(null, true); // Permite acceso para testing / demo
    },
    credentials: true
}));

// Límite de peticiones (rate limiting)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000, // Increased from 100 to 1000 for development
});
app.use(limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Importar rutas
import authRoutes from './routes/auth.js';
import demoRoutes from './routes/demo.js';
import empleadosRoutes from './routes/empleados.js';
import permisosRoutes from './routes/permisos.js';
import evaluacionesRoutes from './routes/evaluaciones.js';
import capacitacionesRoutes from './routes/capacitaciones.js';
import nominasRoutes from './routes/nominas.js';
import asistenciaRoutes from './routes/asistencia.js';
import expedientesRoutes from './routes/expedientes.js';
import horariosRoutes from './routes/horarios.js';
import reportesRoutes from './routes/reportes.js';

// Configurar rutas (CORREGIDO: sin duplicados)
app.use('/api/auth', authRoutes);
app.use('/api/demo', demoRoutes);
app.use('/api/empleados', empleadosRoutes);
app.use('/api/permisos', permisosRoutes);
app.use('/api/evaluaciones', evaluacionesRoutes);
app.use('/api/capacitaciones', capacitacionesRoutes);
app.use('/api/nominas', nominasRoutes);
app.use('/api/asistencia', asistenciaRoutes);
app.use('/api/expedientes', expedientesRoutes);
app.use('/api/horarios', horariosRoutes);
app.use('/api/reportes', reportesRoutes); // SOLO UNA VEZ

app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Sistema de RRHH funcionando correctamente',
        timestamp: new Date().toISOString()
    });
});

app.use((req, res) => {
    if (req.path.startsWith('/api/')) {
        res.status(404).json({
            success: false,
            error: 'Ruta API no encontrada'
        });
    } else {
        res.status(404).json({
            success: false,
            error: 'Ruta no encontrada. Use /api/ para acceder a la API'
        });
    }
});

app.use((error, req, res, next) => {
    console.error('Error no manejado:', error);
    res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
    });
});

app.listen(PORT, () => {
    console.log(`\nServidor ejecutándose en puerto ${PORT}`);
    console.log(`Sistema de Gestión de RRHH - Instituto Dr. Carlos Vega Bolaños`);
    console.log(`Health check: http://localhost:${PORT}/api/health\n`);
    console.log(`Rutas disponibles:`);
    console.log(`  - /api/auth/*`);
    console.log(`  - /api/empleados/*`);
    console.log(`  - /api/permisos/*`);
    console.log(`  - /api/evaluaciones/*`);
    console.log(`  - /api/capacitaciones/*`);
    console.log(`  - /api/nominas/*`);
    console.log(`  - /api/asistencia/*`);
    console.log(`  - /api/expedientes/*`);
    console.log(`  - /api/horarios/*`);
    console.log(`  - /api/reportes/*\n`);
});

export default app;