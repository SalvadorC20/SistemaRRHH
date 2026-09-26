import { executeQuery } from '../config/database.js';

export class Evaluacion {
    static async crear(evaluacionData) {
        const {
            empleado_id,
            evaluador_id,
            periodo_evaluacion,
            fecha_evaluacion,
            criterios,
            puntuacion_total,
            comentarios
        } = evaluacionData;

        const criteriosJSON = typeof criterios === 'string' ? criterios : JSON.stringify(criterios || {});

        const query = `
            INSERT INTO evaluaciones 
            (empleado_id, evaluador_id, periodo_evaluacion, fecha_evaluacion, criterios, puntuacion_total, comentarios)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        const result = await executeQuery(query, [
            empleado_id, evaluador_id, periodo_evaluacion, fecha_evaluacion,
            criteriosJSON, puntuacion_total, comentarios
        ]);

        return result.insertId;
    }

    static async buscarPorId(id) {
        const query = `
            SELECT e.*, 
                   emp.codigo_empleado as empleado_codigo, 
                   u_emp.nombre as empleado_nombre, 
                   u_emp.apellido as empleado_apellido,
                   u_eval.nombre as evaluador_nombre, 
                   u_eval.apellido as evaluador_apellido
            FROM evaluaciones e
            JOIN empleados emp ON e.empleado_id = emp.id
            JOIN usuarios u_emp ON emp.usuario_id = u_emp.id
            JOIN usuarios u_eval ON e.evaluador_id = u_eval.id
            WHERE e.id = ?
        `;
        const evaluaciones = await executeQuery(query, [id]);
        return evaluaciones[0] || null;
    }

    static async listarPorEmpleado(empleadoId) {
        const query = `
            SELECT e.*, u_eval.nombre as evaluador_nombre, u_eval.apellido as evaluador_apellido
            FROM evaluaciones e
            JOIN usuarios u_eval ON e.evaluador_id = u_eval.id
            WHERE e.empleado_id = ?
            ORDER BY e.fecha_evaluacion DESC
        `;
        return await executeQuery(query, [empleadoId]);
    }

    static async listarPorEvaluador(evaluadorId) {
        const query = `
            SELECT e.*, emp.codigo_empleado, u_emp.nombre as empleado_nombre, 
                   u_emp.apellido as empleado_apellido, emp.departamento, emp.puesto
            FROM evaluaciones e
            JOIN empleados emp ON e.empleado_id = emp.id
            JOIN usuarios u_emp ON emp.usuario_id = u_emp.id
            WHERE e.evaluador_id = ?
            ORDER BY e.fecha_evaluacion DESC
        `;
        return await executeQuery(query, [evaluadorId]);
    }

    static async listarTodas(filtros = {}) {
        let query = `
            SELECT e.*, emp.codigo_empleado, u_emp.nombre as empleado_nombre, 
                   u_emp.apellido as empleado_apellido, emp.departamento,
                   u_eval.nombre as evaluador_nombre, u_eval.apellido as evaluador_apellido
            FROM evaluaciones e
            JOIN empleados emp ON e.empleado_id = emp.id
            JOIN usuarios u_emp ON emp.usuario_id = u_emp.id
            JOIN usuarios u_eval ON e.evaluador_id = u_eval.id
            WHERE 1=1
        `;
        const params = [];

        if (filtros.empleado_id) {
            query += ' AND e.empleado_id = ?';
            params.push(filtros.empleado_id);
        }

        if (filtros.evaluador_id) {
            query += ' AND e.evaluador_id = ?';
            params.push(filtros.evaluador_id);
        }

        if (filtros.periodo_evaluacion) {
            query += ' AND e.periodo_evaluacion = ?';
            params.push(filtros.periodo_evaluacion);
        }

        query += ' ORDER BY e.fecha_evaluacion DESC';
        return await executeQuery(query, params);
    }

    static async actualizar(id, datosActualizados) {
        const campos = Object.keys(datosActualizados);
        const valores = Object.values(datosActualizados);
        
        const setClause = campos.map(campo => `${campo} = ?`).join(', ');
        const query = `UPDATE evaluaciones SET ${setClause} WHERE id = ?`;
        
        await executeQuery(query, [...valores, id]);
    }
}