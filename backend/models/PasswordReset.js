import { executeQuery } from '../config/database.js';
import crypto from 'crypto';

export class PasswordReset {
    static async createToken(email) {
        // Limpiar tokens expirados primero
        await this.clearExpiredTokens();
        
        // Generar token único
        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hora
        
        const query = `
            UPDATE usuarios 
            SET reset_password_token = ?, reset_password_expires = ?
            WHERE email = ? AND activo = TRUE
        `;
        
        const result = await executeQuery(query, [token, expires, email]);
        return result.affectedRows > 0 ? token : null;
    }

    static async validateToken(token) {
        const query = `
            SELECT id, email, nombre, reset_password_expires 
            FROM usuarios 
            WHERE reset_password_token = ? AND reset_password_expires > NOW() AND activo = TRUE
        `;
        
        const users = await executeQuery(query, [token]);
        return users[0] || null;
    }

    static async resetPassword(token, newHashedPassword) {
        const user = await this.validateToken(token);
        if (!user) return false;

        const query = `
            UPDATE usuarios 
            SET password = ?, 
                reset_password_token = NULL, 
                reset_password_expires = NULL,
                password_changed_at = NOW(),
                updated_at = NOW()
            WHERE reset_password_token = ? AND id = ?
        `;
        
        const result = await executeQuery(query, [newHashedPassword, token, user.id]);
        
        if (result.affectedRows > 0) {
            // Guardar en historial
            await this.addToPasswordHistory(user.id, newHashedPassword);
            return true;
        }
        return false;
    }

    static async addToPasswordHistory(userId, passwordHash) {
        const query = `
            INSERT INTO password_history (user_id, password_hash) 
            VALUES (?, ?)
        `;
        await executeQuery(query, [userId, passwordHash]);
    }

    static async getRecentPasswords(userId, limit = 5) {
        const query = `
            SELECT password_hash 
            FROM password_history 
            WHERE user_id = ? 
            ORDER BY created_at DESC 
            LIMIT ?
        `;
        return await executeQuery(query, [userId, limit]);
    }

    static async clearExpiredTokens() {
        const query = `
            UPDATE usuarios 
            SET reset_password_token = NULL, reset_password_expires = NULL
            WHERE reset_password_expires < NOW()
        `;
        await executeQuery(query);
    }

    // Nuevo método: Verificar si el token existe (sin validar expiración)
    static async tokenExists(token) {
        const query = `
            SELECT id FROM usuarios 
            WHERE reset_password_token = ? AND activo = TRUE
        `;
        const users = await executeQuery(query, [token]);
        return users.length > 0;
    }
}