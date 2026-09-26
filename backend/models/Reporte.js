import { executeQuery } from '../config/database.js';

export class Reporte {

    static async obtenerReporteAsistencia(fechaInicio, fechaFin, departamento) {
        try {
            let query = `
                SELECT 
                    e.departamento,
                    e.puesto,
                    u.nombre,
                    u.apellido,
                    e.codigo_empleado,
                    COUNT(a.id) as dias_registrados,
                    SUM(CASE WHEN a.tipo_registro = 'NORMAL' THEN 1 ELSE 0 END) as dias_normales,
                    SUM(CASE WHEN a.tipo_registro = 'JUSTIFICADO' THEN 1 ELSE 0 END) as dias_justificados,
                    SUM(CASE WHEN a.tipo_registro = 'INASISTENCIA' THEN 1 ELSE 0 END) as inasistencias,
                    AVG(TIME_TO_SEC(TIMEDIFF(a.hora_salida, a.hora_entrada))) / 3600 as promedio_horas_diarias
                FROM empleados e
                JOIN usuarios u ON e.usuario_id = u.id
                LEFT JOIN asistencia a ON e.id = a.empleado_id AND a.fecha BETWEEN ? AND ?
                WHERE 1=1
            `;

            const params = [fechaInicio, fechaFin];

            if (departamento && departamento !== '') {
                query += ` AND e.departamento = ?`;
                params.push(departamento);
            }

            query += ` GROUP BY e.id ORDER BY e.departamento, u.nombre`;

            console.log('Query ejecutado:', query);
            console.log('Parámetros:', params);

            const result = await executeQuery(query, params);
            return result;

        } catch (error) {
            console.error('Error en obtenerReporteAsistencia:', error);
            throw error;
        }
    }

    static async obtenerReporteNomina(periodo, departamento) {
        let query = `
            SELECT 
                e.departamento,
                e.puesto,
                u.nombre,
                u.apellido,
                e.codigo_empleado,
                e.salario_base,
                n.salario_bruto,
                n.deducciones,
                n.salario_neto,
                n.estado as estado_nomina,
                n.fecha_pago,
                n.periodo_pago
            FROM empleados e
            JOIN usuarios u ON e.usuario_id = u.id
            LEFT JOIN nominas n ON e.id = n.empleado_id AND n.periodo_pago = ?
            WHERE 1=1
        `;

        const params = [periodo];

        if (departamento && departamento !== '') {
            query += ` AND e.departamento = ?`;
            params.push(departamento);
        }

        query += ` ORDER BY e.departamento, u.nombre`;

        return await executeQuery(query, params);
    }

    static async obtenerReporteDesempeno(periodo, departamento) {
        let query = `
            SELECT 
                e.departamento,
                e.puesto,
                u.nombre,
                u.apellido,
                e.codigo_empleado,
                ev.periodo_evaluacion,
                ev.fecha_evaluacion,
                ev.puntuacion_total,
                ev.comentarios,
                u_eval.nombre as evaluador_nombre,
                u_eval.apellido as evaluador_apellido,
                JSON_EXTRACT(ev.criterios, '$.puntualidad') as puntualidad,
                JSON_EXTRACT(ev.criterios, '$.calidad_trabajo') as calidad_trabajo,
                JSON_EXTRACT(ev.criterios, '$.colaboracion') as colaboracion,
                JSON_EXTRACT(ev.criterios, '$.iniciativa') as iniciativa
            FROM empleados e
            JOIN usuarios u ON e.usuario_id = u.id
            LEFT JOIN evaluaciones ev ON e.id = ev.empleado_id AND ev.periodo_evaluacion = ?
            LEFT JOIN usuarios u_eval ON ev.evaluador_id = u_eval.id
            WHERE 1=1
        `;

        const params = [periodo];

        if (departamento && departamento !== '') {
            query += ` AND e.departamento = ?`;
            params.push(departamento);
        }

        query += ` ORDER BY e.departamento, u.nombre`;

        return await executeQuery(query, params);
    }

    // Métodos para Dashboard según rol
    static async obtenerDashboardAdmin() {
        try {
            console.log('Ejecutando obtenerDashboardAdmin');
            const [estadisticas, ultimasEvaluaciones, proximasCapacitaciones] = await Promise.all([
                Reporte.obtenerEstadisticasDashboard(),
                Reporte.obtenerUltimasEvaluaciones(),
                Reporte.obtenerProximasCapacitaciones()
            ]);

            return {
                estadisticas: estadisticas[0] || {},
                ultimas_evaluaciones: ultimasEvaluaciones || [],
                proximas_capacitaciones: proximasCapacitaciones || []
            };
        } catch (error) {
            console.error('Error en obtenerDashboardAdmin:', error);
            throw error;
        }
    }

    static async obtenerDashboardDocente(usuarioId) {
        try {
            console.log('Ejecutando obtenerDashboardDocente para usuario:', usuarioId);
            const [estadisticas, misEvaluaciones, misCapacitaciones] = await Promise.all([
                Reporte.obtenerEstadisticasDocente(usuarioId),
                Reporte.obtenerMisEvaluaciones(usuarioId),
                Reporte.obtenerMisCapacitaciones(usuarioId)
            ]);

            return {
                estadisticas: estadisticas[0] || {},
                mis_evaluaciones: misEvaluaciones || [],
                mis_capacitaciones: misCapacitaciones || []
            };
        } catch (error) {
            console.error('Error en obtenerDashboardDocente:', error);
            throw error;
        }
    }

    static async obtenerDashboardPersonalApoyo(usuarioId) {
        try {
            console.log('Ejecutando obtenerDashboardPersonalApoyo para usuario:', usuarioId);
            const [estadisticas, misEvaluaciones, misCapacitaciones] = await Promise.all([
                Reporte.obtenerEstadisticasPersonalApoyo(usuarioId),
                Reporte.obtenerMisEvaluaciones(usuarioId),
                Reporte.obtenerMisCapacitaciones(usuarioId)
            ]);

            return {
                estadisticas: estadisticas[0] || {},
                mis_evaluaciones: misEvaluaciones || [],
                mis_capacitaciones: misCapacitaciones || []
            };
        } catch (error) {
            console.error('Error en obtenerDashboardPersonalApoyo:', error);
            throw error;
        }
    }

    static async obtenerDashboardDirectivo() {
        try {
            console.log('Ejecutando obtenerDashboardDirectivo');
            const [estadisticas, ultimasEvaluaciones, proximasCapacitaciones] = await Promise.all([
                Reporte.obtenerEstadisticasDashboard(),
                Reporte.obtenerUltimasEvaluaciones(),
                Reporte.obtenerProximasCapacitaciones()
            ]);

            return {
                estadisticas: estadisticas[0] || {},
                ultimas_evaluaciones: ultimasEvaluaciones || [],
                proximas_capacitaciones: proximasCapacitaciones || []
            };
        } catch (error) {
            console.error('Error en obtenerDashboardDirectivo:', error);
            throw error;
        }
    }

    // Métodos para estadísticas generales (Admin/Directivo)
    static async obtenerEstadisticasDashboard() {
        try {
            const query = `
                SELECT 
                    COALESCE((SELECT COUNT(*) FROM empleados WHERE activo = 1), 0) as total_empleados,
                    COALESCE((SELECT COUNT(*) FROM empleados WHERE departamento = 'Académico' AND activo = 1), 0) as total_docentes,
                    COALESCE((SELECT COUNT(*) FROM empleados WHERE departamento != 'Académico' AND activo = 1), 0) as total_administrativos,
                    COALESCE((SELECT COUNT(*) FROM permisos WHERE estado = 'PENDIENTE'), 0) as permisos_pendientes,
                    COALESCE((SELECT COUNT(*) FROM asistencia WHERE fecha = CURDATE()), 0) as asistencias_hoy,
                    COALESCE((SELECT AVG(puntuacion_total) FROM evaluaciones WHERE YEAR(fecha_evaluacion) = YEAR(CURDATE())), 0) as promedio_desempeno,
                    0 as evaluaciones_pendientes
                FROM DUAL
            `;

            console.log('Ejecutando obtenerEstadisticasDashboard');
            const result = await executeQuery(query);
            console.log('Resultado estadísticas dashboard:', result);
            return result;
        } catch (error) {
            console.error('Error en obtenerEstadisticasDashboard:', error);
            // Retornar valores por defecto en caso de error
            return [{
                total_empleados: 0,
                total_docentes: 0,
                total_administrativos: 0,
                permisos_pendientes: 0,
                asistencias_hoy: 0,
                promedio_desempeno: 0,
                evaluaciones_pendientes: 0
            }];
        }
    }

    // Métodos para estadísticas específicas de Docente
    static async obtenerEstadisticasDocente(usuarioId) {
        try {
            const query = `
                SELECT 
                    COALESCE((SELECT COUNT(*) FROM asistencia a 
                             JOIN empleados e ON a.empleado_id = e.id 
                             WHERE e.usuario_id = ? AND a.fecha = CURDATE()), 0) as asistencias_hoy,
                    COALESCE((SELECT COUNT(*) FROM permisos p 
                             JOIN empleados e ON p.empleado_id = e.id 
                             WHERE e.usuario_id = ? AND p.estado = 'PENDIENTE'), 0) as mis_permisos_pendientes,
                    COALESCE((SELECT COUNT(*) FROM horarios h 
                             JOIN empleados e ON h.empleado_id = e.id 
                             WHERE e.usuario_id = ? AND h.dia_semana = ELT(WEEKDAY(CURDATE()) + 1, 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO') AND h.activo = 1), 0) as proximas_clases,
                    COALESCE((SELECT COUNT(*) FROM evaluaciones ev 
                             JOIN empleados e ON ev.empleado_id = e.id 
                             WHERE e.usuario_id = ? AND YEAR(ev.fecha_evaluacion) = YEAR(CURDATE())), 0) as mis_evaluaciones,
                    COALESCE((SELECT AVG(puntuacion_total) FROM evaluaciones ev 
                             JOIN empleados e ON ev.empleado_id = e.id 
                             WHERE e.usuario_id = ?), 0) as mi_calificacion,
                    0 as tareas_pendientes,
                    0 as alertas
                FROM DUAL
            `;

            console.log('Ejecutando obtenerEstadisticasDocente para usuario:', usuarioId);
            const result = await executeQuery(query, [usuarioId, usuarioId, usuarioId, usuarioId, usuarioId]);
            console.log('Resultado estadísticas docente:', result);
            return result;
        } catch (error) {
            console.error('Error en obtenerEstadisticasDocente:', error);
            return [{
                asistencias_hoy: 0,
                mis_permisos_pendientes: 0,
                proximas_clases: 0,
                mis_evaluaciones: 0,
                mi_calificacion: 0,
                tareas_pendientes: 0,
                alertas: 0
            }];
        }
    }

    // Métodos para estadísticas específicas de Personal de Apoyo
    static async obtenerEstadisticasPersonalApoyo(usuarioId) {
        try {
            const query = `
                SELECT 
                    COALESCE((SELECT COUNT(*) FROM asistencia a 
                             JOIN empleados e ON a.empleado_id = e.id 
                             WHERE e.usuario_id = ? AND a.fecha = CURDATE()), 0) as asistencias_hoy,
                    COALESCE((SELECT COUNT(*) FROM permisos p 
                             JOIN empleados e ON p.empleado_id = e.id 
                             WHERE e.usuario_id = ? AND p.estado = 'PENDIENTE'), 0) as mis_permisos_pendientes,
                    0 as proximas_clases,
                    COALESCE((SELECT COUNT(*) FROM evaluaciones ev 
                             JOIN empleados e ON ev.empleado_id = e.id 
                             WHERE e.usuario_id = ? AND YEAR(ev.fecha_evaluacion) = YEAR(CURDATE())), 0) as mis_evaluaciones,
                    COALESCE((SELECT AVG(puntuacion_total) FROM evaluaciones ev 
                             JOIN empleados e ON ev.empleado_id = e.id 
                             WHERE e.usuario_id = ?), 0) as mi_calificacion,
                    5 as tareas_pendientes,
                    2 as alertas
                FROM DUAL
            `;

            console.log('Ejecutando obtenerEstadisticasPersonalApoyo para usuario:', usuarioId);
            const result = await executeQuery(query, [usuarioId, usuarioId, usuarioId, usuarioId]);
            console.log('Resultado estadísticas personal apoyo:', result);
            return result;
        } catch (error) {
            console.error('Error en obtenerEstadisticasPersonalApoyo:', error);
            return [{
                asistencias_hoy: 0,
                mis_permisos_pendientes: 0,
                proximas_clases: 0,
                mis_evaluaciones: 0,
                mi_calificacion: 0,
                tareas_pendientes: 5,
                alertas: 2
            }];
        }
    }

    // Métodos para actividades recientes
    static async obtenerUltimasEvaluaciones(limite = 5) {
        try {
            const query = `
                SELECT 
                    ev.id,
                    u.nombre,
                    u.apellido,
                    ev.puntuacion_total,
                    ev.periodo_evaluacion,
                    ev.fecha_evaluacion,
                    ev.comentarios,
                    u_eval.nombre as evaluador_nombre,
                    u_eval.apellido as evaluador_apellido
                FROM evaluaciones ev
                JOIN empleados emp ON ev.empleado_id = emp.id
                JOIN usuarios u ON emp.usuario_id = u.id
                LEFT JOIN usuarios u_eval ON ev.evaluador_id = u_eval.id
                ORDER BY ev.fecha_evaluacion DESC
                LIMIT ?
            `;
            return await executeQuery(query, [limite]);
        } catch (error) {
            console.error('Error en obtenerUltimasEvaluaciones:', error);
            return [];
        }
    }

    static async obtenerProximasCapacitaciones(limite = 5) {
        try {
            const query = `
                SELECT 
                    nombre,
                    descripcion,
                    fecha_inicio,
                    fecha_fin,
                    estado
                FROM capacitaciones 
                WHERE fecha_inicio >= CURDATE() 
                ORDER BY fecha_inicio ASC
                LIMIT ?
            `;
            return await executeQuery(query, [limite]);
        } catch (error) {
            console.error('Error en obtenerProximasCapacitaciones:', error);
            return [];
        }
    }

    // Métodos para actividades personales
    static async obtenerMisEvaluaciones(usuarioId) {
        try {
            const query = `
                SELECT 
                    ev.id,
                    ev.periodo_evaluacion,
                    ev.periodo_evaluacion as periodo,
                    ev.puntuacion_total,
                    ev.fecha_evaluacion,
                    ev.comentarios,
                    u.nombre,
                    u.apellido,
                    u_eval.nombre as evaluador_nombre,
                    u_eval.apellido as evaluador_apellido
                FROM evaluaciones ev
                JOIN empleados emp ON ev.empleado_id = emp.id
                JOIN usuarios u ON emp.usuario_id = u.id
                LEFT JOIN usuarios u_eval ON ev.evaluador_id = u_eval.id
                WHERE emp.usuario_id = ?
                ORDER BY ev.fecha_evaluacion DESC
                LIMIT 5
            `;
            return await executeQuery(query, [usuarioId]);
        } catch (error) {
            console.error('Error en obtenerMisEvaluaciones:', error);
            return [];
        }
    }

    static async obtenerMisCapacitaciones(usuarioId) {
        try {
            const query = `
                SELECT 
                    c.nombre,
                    c.descripcion,
                    c.fecha_inicio,
                    c.fecha_fin,
                    c.estado,
                    ec.progreso
                FROM capacitaciones c
                JOIN empleados_capacitaciones ec ON c.id = ec.capacitacion_id
                JOIN empleados emp ON ec.empleado_id = emp.id
                WHERE emp.usuario_id = ?
                ORDER BY c.fecha_inicio ASC
                LIMIT 5
            `;
            return await executeQuery(query, [usuarioId]);
        } catch (error) {
            console.error('Error en obtenerMisCapacitaciones:', error);
            return [];
        }
    }

    // Método para obtener datos básicos (fallback)
    static async obtenerDashboardBasico() {
        try {
            console.log('Ejecutando obtenerDashboardBasico');
            const [estadisticas] = await Promise.all([
                Reporte.obtenerEstadisticasDashboard()
            ]);

            return {
                estadisticas: estadisticas[0] || {},
                ultimas_evaluaciones: [],
                proximas_capacitaciones: []
            };
        } catch (error) {
            console.error('Error en obtenerDashboardBasico:', error);
            return {
                estadisticas: {},
                ultimas_evaluaciones: [],
                proximas_capacitaciones: []
            };
        }
    }
}