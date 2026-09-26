import { executeQuery } from '../config/database.js';

export class Permiso {
    static async crear(permisoData) {
        const {
            empleado_id,
            tipo_permiso,
            fecha_inicio,
            fecha_fin,
            motivo,
            estado = 'PENDIENTE'
        } = permisoData;

        const query = `
            INSERT INTO permisos 
            (empleado_id, tipo_permiso, fecha_inicio, fecha_fin, motivo, estado)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        const result = await executeQuery(query, [
            empleado_id, tipo_permiso, fecha_inicio, fecha_fin, motivo, estado
        ]);

        return result.insertId;
    }

    static async buscarPorId(id) {
        const query = `
            SELECT p.*, e.codigo_empleado, u.nombre, u.apellido,
                   a.nombre as aprobador_nombre, a.apellido as aprobador_apellido
            FROM permisos p
            JOIN empleados e ON p.empleado_id = e.id
            JOIN usuarios u ON e.usuario_id = u.id
            LEFT JOIN usuarios a ON p.aprobado_por = a.id
            WHERE p.id = ?
        `;
        const permisos = await executeQuery(query, [id]);
        return permisos[0] || null;
    }

    static async listarPorEmpleado(empleadoId) {
        const query = `
            SELECT p.*, e.codigo_empleado
            FROM permisos p
            JOIN empleados e ON p.empleado_id = e.id
            WHERE p.empleado_id = ?
            ORDER BY p.created_at DESC
        `;
        return await executeQuery(query, [empleadoId]);
    }

    static async listarPendientes() {
        const query = `
            SELECT p.*, e.codigo_empleado, u.nombre, u.apellido, u.email,
                   e.departamento, e.puesto
            FROM permisos p
            JOIN empleados e ON p.empleado_id = e.id
            JOIN usuarios u ON e.usuario_id = u.id
            WHERE p.estado = 'PENDIENTE'
            ORDER BY p.created_at DESC
        `;
        return await executeQuery(query);
    }

    static async actualizarEstado(id, estado, aprobadoPor = null, comentarios = null) {
        console.log('Ejecutando actualización de estado:', { id, estado, aprobadoPor, comentarios });
        
        const query = `
            UPDATE permisos 
            SET estado = ?, aprobado_por = ?, comentarios_aprobador = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        
        const result = await executeQuery(query, [estado, aprobadoPor, comentarios, id]);
        console.log('Resultado de la actualización:', result);
        
        return result;
    }

    static async listarTodos(filtros = {}) {
        let query = `
            SELECT p.*, e.codigo_empleado, u.nombre, u.apellido, u.email,
                   e.departamento, e.puesto, a.nombre as aprobador_nombre
            FROM permisos p
            JOIN empleados e ON p.empleado_id = e.id
            JOIN usuarios u ON e.usuario_id = u.id
            LEFT JOIN usuarios a ON p.aprobado_por = a.id
            WHERE 1=1
        `;
        const params = [];

        if (filtros.estado) {
            query += ' AND p.estado = ?';
            params.push(filtros.estado);
        }

        if (filtros.empleado_id) {
            query += ' AND p.empleado_id = ?';
            params.push(filtros.empleado_id);
        }

        if (filtros.tipo_permiso) {
            query += ' AND p.tipo_permiso = ?';
            params.push(filtros.tipo_permiso);
        }

        if (filtros.fecha_inicio) {
            query += ' AND p.fecha_inicio >= ?';
            params.push(filtros.fecha_inicio);
        }

        if (filtros.fecha_fin) {
            query += ' AND p.fecha_fin <= ?';
            params.push(filtros.fecha_fin);
        }

        query += ' ORDER BY p.created_at DESC';
        return await executeQuery(query, params);
    }
}