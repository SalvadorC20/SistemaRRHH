import jwt from 'jsonwebtoken';
import { Usuario } from '../models/Usuario.js';

const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ 
            success: false,
            error: 'Token de acceso requerido' 
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        
        // CORRECCIÓN: Usar decoded.id en lugar de decoded.userId
        const userId = decoded.id || decoded.userId;
        
        if (!userId) {
            return res.status(403).json({ 
                success: false,
                error: 'Token inválido: ID de usuario no encontrado' 
            });
        }

        const usuario = await Usuario.buscarPorId(userId);
        
        if (!usuario) {
            return res.status(403).json({ 
                success: false,
                error: 'Usuario no autorizado' 
            });
        }

        req.user = {
            ...usuario,
            rol: usuario.rol_nombre
        };
        
        next();
    } catch (error) {
        console.error('Error en authenticateToken:', error);
        return res.status(403).json({ 
            success: false,
            error: 'Token inválido o expirado' 
        });
    }
};

const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                success: false,
                error: 'Usuario no autenticado' 
            });
        }

        if (!allowedRoles.includes(req.user.rol)) {
            return res.status(403).json({ 
                success: false,
                error: 'No tiene permisos para realizar esta acción' 
            });
        }

        next();
    };
};

const optionalAuth = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
            const userId = decoded.id || decoded.userId;
            
            if (userId) {
                const usuario = await Usuario.buscarPorId(userId);
                if (usuario) {
                    req.user = {
                        ...usuario,
                        rol: usuario.rol_nombre
                    };
                }
            }
        } catch (error) {
            // Token inválido, continuar sin usuario
            console.log('Token inválido en optionalAuth:', error.message);
        }
    }

    next();
};

export { authenticateToken, authorizeRoles, optionalAuth };