import { executeQuery } from '../config/database.js';

export class Empleado {
    static async crear(empleadoData) {
        const {
            codigo_empleado,
            fecha_contratacion,
            tipo_contrato,
            salario_base,
            departamento,
            puesto,
            usuario_id,
            activo = true
        } = empleadoData;

        const query = `
            INSERT INTO empleados 
            (codigo_empleado, fecha_contratacion, tipo_contrato, salario_base, departamento, puesto, usuario_id, activo)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const result = await executeQuery(query, [
            codigo_empleado, fecha_contratacion, tipo_contrato,
            salario_base, departamento, puesto, usuario_id, activo
        ]);

        return result.insertId;
    }

    static async buscarPorId(id) {
        const query = `
            SELECT e.*, u.email, u.nombre, u.apellido, u.telefono, r.nombre as rol_nombre,
                   CASE 
                     WHEN e.activo = 1 THEN 'ACTIVO'
                     ELSE 'INACTIVO'
                   END as estado_empleado
            FROM empleados e
            JOIN usuarios u ON e.usuario_id = u.id
            JOIN roles r ON u.rol_id = r.id
            WHERE e.id = ?
        `;
        const empleados = await executeQuery(query, [id]);
        return empleados[0] || null;
    }

    static async buscarPorUsuarioId(usuarioId) {
        const query = `
            SELECT e.*, u.email, u.nombre, u.apellido, u.telefono, r.nombre as rol_nombre,
                   CASE 
                     WHEN e.activo = 1 THEN 'ACTIVO'
                     ELSE 'INACTIVO'
                   END as estado_empleado
            FROM empleados e
            JOIN usuarios u ON e.usuario_id = u.id
            JOIN roles r ON u.rol_id = r.id
            WHERE e.usuario_id = ?
        `;
        const empleados = await executeQuery(query, [usuarioId]);
        return empleados[0] || null;
    }

    static async listarTodos() {
        const query = `
            SELECT e.*, u.email, u.nombre, u.apellido, u.telefono, r.nombre as rol_nombre,
                   CASE 
                     WHEN e.activo = 1 THEN 'ACTIVO'
                     ELSE 'INACTIVO'
                   END as estado_empleado
            FROM empleados e
            JOIN usuarios u ON e.usuario_id = u.id
            JOIN roles r ON u.rol_id = r.id
            ORDER BY e.created_at DESC
        `;
        return await executeQuery(query);
    }

    static async actualizar(id, datosActualizados) {
        const campos = Object.keys(datosActualizados);
        const valores = Object.values(datosActualizados);

        const setClause = campos.map(campo => `${campo} = ?`).join(', ');
        const query = `UPDATE empleados SET ${setClause} WHERE id = ?`;

        await executeQuery(query, [...valores, id]);
    }

    static async buscarPorCodigo(codigo) {
        const query = `
            SELECT *, 
                   CASE 
                     WHEN activo = 1 THEN 'ACTIVO'
                     ELSE 'INACTIVO'
                   END as estado_empleado
            FROM empleados WHERE codigo_empleado = ?`;
        const empleados = await executeQuery(query, [codigo]);
        return empleados[0] || null;
    }

    static async cambiarEstado(id, activo) {
        const query = `UPDATE empleados SET activo = ? WHERE id = ?`;
        await executeQuery(query, [activo, id]);
    }
}