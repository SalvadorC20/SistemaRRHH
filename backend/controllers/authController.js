import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { executeQuery } from '../config/database.js';
import { PasswordReset } from '../models/PasswordReset.js';
import { sendPasswordResetEmail, sendPasswordChangedEmail } from '../config/email.js';

export class AuthController {

    // Validación de fortaleza de contraseña (mínimo 6 caracteres)
    static validatePasswordStrength(password) {
        const minLength = 6;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);

        if (password.length < minLength) {
            return `La contraseña debe tener al menos ${minLength} caracteres`;
        }
        if (!hasUpperCase) {
            return 'La contraseña debe contener al menos una letra mayúscula';
        }
        if (!hasLowerCase) {
            return 'La contraseña debe contener al menos una letra minúscula';
        }
        if (!hasNumbers) {
            return 'La contraseña debe contener al menos un número';
        }
        return null;
    }

    // ====================== LOGIN ======================
    static async login(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ success: false, error: 'Email y contraseña son requeridos' });
            }

            const query = `
                SELECT u.*, r.nombre as rol_nombre 
                FROM usuarios u 
                JOIN roles r ON u.rol_id = r.id 
                WHERE u.email = ? AND u.activo = TRUE
            `;
            const usuarios = await executeQuery(query, [email]);

            if (usuarios.length === 0) {
                return res.status(401).json({ success: false, error: 'Credenciales inválidas' });
            }

            const usuario = usuarios[0];
            const isPasswordValid = await bcrypt.compare(password, usuario.password);
            if (!isPasswordValid) {
                return res.status(401).json({ success: false, error: 'Credenciales inválidas' });
            }

            const token = jwt.sign(
                { id: usuario.id, email: usuario.email, rol: usuario.rol_nombre },
                process.env.JWT_SECRET || 'fallback_secret',
                { expiresIn: '24h' }
            );

            await executeQuery('UPDATE usuarios SET last_login = NOW() WHERE id = ?', [usuario.id]);

            const userData = {
                id: usuario.id,
                email: usuario.email,
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                telefono: usuario.telefono,
                rol: usuario.rol_nombre,
                rol_id: usuario.rol_id,
                activo: usuario.activo,
                created_at: usuario.created_at
            };

            res.json({ success: true, message: 'Login exitoso', token, user: userData });

        } catch (error) {
            console.error('Error en login:', error);
            res.status(500).json({ success: false, error: 'Error interno del servidor' });
        }
    }

    // ====================== REGISTER ======================
    static async register(req, res) {
        try {
            const { email, password, nombre, apellido, telefono, rol_id } = req.body;

            if (!req.user || req.user.rol !== 'ADMIN_RRHH') {
                return res.status(403).json({ success: false, error: 'Solo los administradores de RRHH pueden registrar usuarios' });
            }

            if (!email || !password || !nombre || !apellido || !rol_id) {
                return res.status(400).json({ success: false, error: 'Todos los campos requeridos deben ser completados' });
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ success: false, error: 'Email inválido' });
            }

            // Validar fortaleza de contraseña
            const passwordError = AuthController.validatePasswordStrength(password);
            if (passwordError) {
                return res.status(400).json({ success: false, error: passwordError });
            }

            const emailExiste = await executeQuery('SELECT id FROM usuarios WHERE email = ?', [email]);
            if (emailExiste.length > 0) {
                return res.status(400).json({ success: false, error: 'El email ya está registrado' });
            }

            const rolesPermitidos = await executeQuery('SELECT id FROM roles WHERE id != 1 AND id = ?', [rol_id]);
            if (rolesPermitidos.length === 0) {
                return res.status(400).json({ success: false, error: 'Rol no válido para registro' });
            }

            const hashedPassword = await bcrypt.hash(password, 12);
            const insertQuery = `
                INSERT INTO usuarios (email, password, nombre, apellido, telefono, rol_id)
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            const result = await executeQuery(insertQuery, [email, hashedPassword, nombre, apellido, telefono, rol_id]);

            const nuevoUsuario = await executeQuery(`
                SELECT u.*, r.nombre as rol_nombre 
                FROM usuarios u 
                JOIN roles r ON u.rol_id = r.id 
                WHERE u.id = ?
            `, [result.insertId]);

            await PasswordReset.addToPasswordHistory(result.insertId, hashedPassword);

            const userData = {
                id: nuevoUsuario[0].id,
                email: nuevoUsuario[0].email,
                nombre: nuevoUsuario[0].nombre,
                apellido: nuevoUsuario[0].apellido,
                telefono: nuevoUsuario[0].telefono,
                rol: nuevoUsuario[0].rol_nombre,
                rol_id: nuevoUsuario[0].rol_id,
                activo: nuevoUsuario[0].activo,
                created_at: nuevoUsuario[0].created_at
            };

            res.status(201).json({ success: true, message: 'Usuario registrado exitosamente', data: userData });

        } catch (error) {
            console.error('Error completo en registro:', error);
            res.status(500).json({ success: false, error: 'Error interno del servidor: ' + error.message });
        }
    }

    // ====================== GET PROFILE ======================
    static async getProfile(req, res) {
        try {
            const userId = req.user.id;
            const query = `
                SELECT u.*, r.nombre as rol_nombre,
                       e.id as empleado_id, e.codigo_empleado, e.departamento, e.puesto
                FROM usuarios u 
                JOIN roles r ON u.rol_id = r.id 
                LEFT JOIN empleados e ON u.id = e.usuario_id
                WHERE u.id = ? AND u.activo = TRUE
            `;
            const usuarios = await executeQuery(query, [userId]);

            if (usuarios.length === 0) {
                return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
            }

            const usuario = usuarios[0];
            const userData = {
                id: usuario.id,
                email: usuario.email,
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                telefono: usuario.telefono,
                rol: usuario.rol_nombre,
                rol_id: usuario.rol_id,
                activo: usuario.activo,
                created_at: usuario.created_at,
                updated_at: usuario.updated_at,
                last_login: usuario.last_login
            };

            if (usuario.empleado_id) {
                userData.empleado = {
                    id: usuario.empleado_id,
                    codigo_empleado: usuario.codigo_empleado,
                    departamento: usuario.departamento,
                    puesto: usuario.puesto
                };
            }

            res.json({ success: true, user: userData });

        } catch (error) {
            console.error('Error obteniendo perfil:', error);
            res.status(500).json({ success: false, error: 'Error interno del servidor' });
        }
    }

    // ====================== GET ROLES ======================
    static async getRoles(req, res) {
        try {
            if (req.user.rol !== 'ADMIN_RRHH') {
                return res.status(403).json({ success: false, error: 'No tiene permisos para realizar esta acción' });
            }

            const query = 'SELECT id, nombre, descripcion FROM roles WHERE id != 1 ORDER BY id';
            const roles = await executeQuery(query);

            res.json({ success: true, data: roles });

        } catch (error) {
            console.error('Error obteniendo roles:', error);
            res.status(500).json({ success: false, error: 'Error interno del servidor al obtener roles' });
        }
    }

    // ====================== GET USERS ======================
    static async getUsers(req, res) {
        try {
            if (req.user.rol !== 'ADMIN_RRHH') {
                return res.status(403).json({ success: false, error: 'No tienes permisos para realizar esta acción' });
            }

            const query = `
                SELECT u.id, u.email, u.nombre, u.apellido, u.telefono, 
                       u.activo, u.created_at, u.updated_at,
                       r.nombre as rol_nombre,
                       e.id as empleado_id
                FROM usuarios u
                JOIN roles r ON u.rol_id = r.id
                LEFT JOIN empleados e ON u.id = e.usuario_id
                ORDER BY u.created_at DESC
            `;
            const usuarios = await executeQuery(query);

            res.json({ success: true, data: usuarios });

        } catch (error) {
            console.error('Error obteniendo usuarios:', error);
            res.status(500).json({ success: false, error: 'Error interno del servidor' });
        }
    }

    // ====================== CHANGE PASSWORD ======================
    static async changePassword(req, res) {
        try {
            const { currentPassword, newPassword, confirmPassword } = req.body;
            const userId = req.user.id;

            if (!currentPassword || !newPassword || !confirmPassword) {
                return res.status(400).json({ success: false, error: 'Todos los campos son requeridos' });
            }

            if (newPassword !== confirmPassword) {
                return res.status(400).json({ success: false, error: 'Las nuevas contraseñas no coinciden' });
            }

            const passwordError = AuthController.validatePasswordStrength(newPassword);
            if (passwordError) {
                return res.status(400).json({ success: false, error: passwordError });
            }

            const usuarios = await executeQuery('SELECT * FROM usuarios WHERE id = ? AND activo = TRUE', [userId]);
            if (usuarios.length === 0) return res.status(404).json({ success: false, error: 'Usuario no encontrado' });

            const usuario = usuarios[0];
            const isCurrentPasswordValid = await bcrypt.compare(currentPassword, usuario.password);
            if (!isCurrentPasswordValid) return res.status(400).json({ success: false, error: 'La contraseña actual es incorrecta' });

            const isSameAsCurrent = await bcrypt.compare(newPassword, usuario.password);
            if (isSameAsCurrent) return res.status(400).json({ success: false, error: 'La nueva contraseña debe ser diferente a la actual' });

            const recentPasswords = await PasswordReset.getRecentPasswords(userId);
            let isReused = false;
            for (const record of recentPasswords) {
                const isMatch = await bcrypt.compare(newPassword, record.password_hash);
                if (isMatch) { isReused = true; break; }
            }
            if (isReused) return res.status(400).json({ success: false, error: 'No puedes reutilizar una contraseña anterior' });

            const hashedPassword = await bcrypt.hash(newPassword, 12);
            await executeQuery('UPDATE usuarios SET password = ?, password_changed_at = NOW(), updated_at = NOW() WHERE id = ?', [hashedPassword, userId]);
            await PasswordReset.addToPasswordHistory(userId, hashedPassword);

            await sendPasswordChangedEmail(usuario.email, usuario.nombre);

            res.json({ success: true, message: 'Contraseña actualizada exitosamente' });

        } catch (error) {
            console.error('Error en changePassword:', error);
            res.status(500).json({ success: false, error: 'Error interno del servidor' });
        }
    }

    // ====================== FORGOT PASSWORD ======================
    static async forgotPassword(req, res) {
        try {
            const { email } = req.body;
            if (!email) return res.status(400).json({ success: false, error: 'El email es requerido' });

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) return res.status(400).json({ success: false, error: 'Email inválido' });

            const usuario = await executeQuery('SELECT id, nombre, email FROM usuarios WHERE email = ? AND activo = TRUE', [email]);
            if (usuario.length === 0) {
                return res.json({ success: true, message: 'Si el email existe, recibirás un enlace para restablecer tu contraseña' });
            }

            const token = await PasswordReset.createToken(email);
            if (!token) return res.status(500).json({ success: false, error: 'Error al generar token de restablecimiento' });

            const emailSent = await sendPasswordResetEmail(email, token);
            if (!emailSent) return res.status(500).json({ success: false, error: 'Error al enviar el email de restablecimiento' });

            res.json({ success: true, message: 'Si el email existe, recibirás un enlace para restablecer tu contraseña' });

        } catch (error) {
            console.error('Error en forgotPassword:', error);
            res.status(500).json({ success: false, error: 'Error interno del servidor' });
        }
    }

    // ====================== RESET PASSWORD ======================
    static async resetPassword(req, res) {
        try {
            const { token, newPassword, confirmPassword } = req.body;

            if (!token || !newPassword || !confirmPassword) {
                return res.status(400).json({ success: false, error: 'Todos los campos son requeridos' });
            }

            if (newPassword !== confirmPassword) {
                return res.status(400).json({ success: false, error: 'Las contraseñas no coinciden' });
            }

            const passwordError = AuthController.validatePasswordStrength(newPassword);
            if (passwordError) return res.status(400).json({ success: false, error: passwordError });

            const user = await PasswordReset.validateToken(token);
            if (!user) return res.status(400).json({ success: false, error: 'El token es inválido o ha expirado' });

            const hashedPassword = await bcrypt.hash(newPassword, 12);

            const recentPasswords = await PasswordReset.getRecentPasswords(user.id);
            let isReused = false;
            for (const record of recentPasswords) {
                const isMatch = await bcrypt.compare(newPassword, record.password_hash);
                if (isMatch) { isReused = true; break; }
            }
            if (isReused) return res.status(400).json({ success: false, error: 'No puedes reutilizar una contraseña anterior' });

            const success = await PasswordReset.resetPassword(token, hashedPassword);
            if (!success) return res.status(500).json({ success: false, error: 'Error al restablecer la contraseña' });

            await sendPasswordChangedEmail(user.email, user.nombre);

            res.json({ success: true, message: 'Contraseña restablecida exitosamente' });

        } catch (error) {
            console.error('Error en resetPassword:', error);
            res.status(500).json({ success: false, error: 'Error interno del servidor' });
        }
    }

    // ====================== VALIDATE RESET TOKEN ======================
    static async validateResetToken(req, res) {
        try {
            const { token } = req.params;
            const user = await PasswordReset.validateToken(token);
            if (!user) return res.status(400).json({ success: false, error: 'El token es inválido o ha expirado' });

            res.json({ success: true, message: 'Token válido', data: { email: user.email } });

        } catch (error) {
            console.error('Error validando token:', error);
            res.status(500).json({ success: false, error: 'Error interno del servidor' });
        }
    }
}
