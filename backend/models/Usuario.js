import { executeQuery } from '../config/database.js';
import bcrypt from 'bcryptjs';

export class Usuario {
    static async crear(usuarioData) {
        const {
            email,
            password,
            nombre,
            apellido,
            telefono,
            rol_id
        } = usuarioData;

        // Validar que el rol exista
        const rolValido = await executeQuery(
            'SELECT id FROM roles WHERE id = ?',
            [rol_id]
        );

        if (rolValido.length === 0) {
            throw new Error('Rol no válido');
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const query = `
            INSERT INTO usuarios (email, password, nombre, apellido, telefono, rol_id)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        const result = await executeQuery(query, [
            email, hashedPassword, nombre, apellido, telefono, rol_id
        ]);

        return result.insertId;
    }

    static async buscarPorEmail(email) {
        const query = `
            SELECT u.*, r.nombre as rol_nombre 
            FROM usuarios u 
            JOIN roles r ON u.rol_id = r.id 
            WHERE u.email = ? AND u.activo = TRUE
        `;
        const usuarios = await executeQuery(query, [email]);
        return usuarios[0] || null;
    }

    static async buscarPorId(id) {
        const query = `
            SELECT u.*, r.nombre as rol_nombre 
            FROM usuarios u 
            JOIN roles r ON u.rol_id = r.id 
            WHERE u.id = ? AND u.activo = TRUE
        `;
        const usuarios = await executeQuery(query, [id]);
        return usuarios[0] || null;
    }

    static async verificarPassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    static async actualizar(id, datosActualizados) {
        const campos = Object.keys(datosActualizados);
        const valores = Object.values(datosActualizados);

        const setClause = campos.map(campo => `${campo} = ?`).join(', ');
        const query = `UPDATE usuarios SET ${setClause}, updated_at = NOW() WHERE id = ?`;

        await executeQuery(query, [...valores, id]);
    }

    static async listarTodos() {
        const query = `
            SELECT u.id, u.email, u.nombre, u.apellido, u.telefono, 
                   u.activo, r.nombre as rol_nombre, u.created_at,
                   e.id as empleado_id
            FROM usuarios u 
            JOIN roles r ON u.rol_id = r.id 
            LEFT JOIN empleados e ON u.id = e.usuario_id
            ORDER BY u.created_at DESC
        `;
        return await executeQuery(query);
    }

    static async actualizarUltimoLogin(id) {
        const query = 'UPDATE usuarios SET last_login = NOW() WHERE id = ?';
        await executeQuery(query, [id]);
    }

    static async buscarSinEmpleado() {
        const query = `
            SELECT u.*, r.nombre as rol_nombre
            FROM usuarios u 
            JOIN roles r ON u.rol_id = r.id 
            LEFT JOIN empleados e ON u.id = e.usuario_id
            WHERE e.id IS NULL AND u.activo = TRUE
        `;
        return await executeQuery(query);
    }
 
    //Obtener roles para el registro
    static async obtenerRoles() {
        const query = 'SELECT id, nombre, descripcion FROM roles WHERE id != 1 ORDER BY id'; // Excluye ADMIN_RRHH
        return await executeQuery(query);
    }
    // Nuevo: Verificar si email ya existe
    static async emailExiste(email) {
        const query = 'SELECT id FROM usuarios WHERE email = ?';
        const usuarios = await executeQuery(query, [email]);
        return usuarios.length > 0;
    }
}