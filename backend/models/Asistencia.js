import { executeQuery } from '../config/database.js';

export class Asistencia {
    static async registrar(asistenciaData) {
        const {
            empleado_id,
            fecha,
            hora_entrada,
            hora_salida,
            tipo_registro = 'NORMAL'
        } = asistenciaData;

        const query = `
            INSERT INTO asistencia 
            (empleado_id, fecha, hora_entrada, hora_salida, tipo_registro)
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            hora_entrada = VALUES(hora_entrada),
            hora_salida = VALUES(hora_salida),
            tipo_registro = VALUES(tipo_registro)
        `;

        const result = await executeQuery(query, [
            empleado_id, fecha, hora_entrada, hora_salida, tipo_registro
        ]);

        return result.insertId;
    }


    static async buscarPorEmpleadoYFecha(empleadoId, fecha) {
        const query = `
            SELECT * FROM asistencia 
            WHERE empleado_id = ? AND fecha = ?
        `;
        const resultados = await executeQuery(query, [empleadoId, fecha]);
        return resultados[0] || null;
    }

    static async obtenerReporteDetallado(departamento, fechaInicio, fechaFin) {
        let query = `
            SELECT 
                a.*,
                e.codigo_empleado,
                u.nombre,
                u.apellido,
                e.departamento,
                e.puesto
            FROM asistencia a
            JOIN empleados e ON a.empleado_id = e.id
            JOIN usuarios u ON e.usuario_id = u.id
            WHERE a.fecha BETWEEN ? AND ?
        `;

        const params = [fechaInicio, fechaFin];

        if (departamento) {
            query += ` AND e.departamento = ?`;
            params.push(departamento);
        }

        query += ` ORDER BY a.fecha DESC, u.nombre ASC`;

        return await executeQuery(query, params);
    }
    static async justificarInasistencia(id, justificacion) {
        const query = `
            UPDATE asistencia 
            SET tipo_registro = 'JUSTIFICADO', justificacion = ?
            WHERE id = ?
        `;
        await executeQuery(query, [justificacion, id]);
    }

    static async obtenerPorEmpleadoPeriodo(empleadoId, fechaInicio, fechaFin) {
        const query = `
            SELECT * FROM asistencia 
            WHERE empleado_id = ? AND fecha BETWEEN ? AND ?
            ORDER BY fecha DESC
        `;
        return await executeQuery(query, [empleadoId, fechaInicio, fechaFin]);
    }

    static async obtenerReporteDepartamento(departamento, fechaInicio, fechaFin) {
        const query = `
            SELECT 
                a.*,
                e.codigo_empleado,
                u.nombre,
                u.apellido,
                e.departamento,
                e.puesto
            FROM asistencia a
            JOIN empleados e ON a.empleado_id = e.id
            JOIN usuarios u ON e.usuario_id = u.id
            WHERE e.departamento = ? AND a.fecha BETWEEN ? AND ?
            ORDER BY a.fecha DESC, u.nombre ASC
        `;
        return await executeQuery(query, [departamento, fechaInicio, fechaFin]);
    }

    static async obtenerResumenAsistencia(fechaInicio, fechaFin) {
        const query = `
            SELECT 
                e.departamento,
                COUNT(DISTINCT a.empleado_id) as empleados_registrados,
                AVG(TIME_TO_SEC(TIMEDIFF(a.hora_salida, a.hora_entrada))) / 3600 as promedio_horas,
                SUM(CASE WHEN a.tipo_registro = 'JUSTIFICADO' THEN 1 ELSE 0 END) as inasistencias_justificadas,
                SUM(CASE WHEN a.tipo_registro = 'INASISTENCIA' THEN 1 ELSE 0 END) as inasistencias_injustificadas
            FROM asistencia a
            JOIN empleados e ON a.empleado_id = e.id
            WHERE a.fecha BETWEEN ? AND ?
            GROUP BY e.departamento
        `;
        return await executeQuery(query, [fechaInicio, fechaFin]);
    }
}