import { executeQuery } from '../config/database.js';

export class Capacitacion {
  static async crear(capacitacionData) {
    const {
      nombre,
      descripcion,
      fecha_inicio,
      fecha_fin,
      estado = 'PLANIFICADA',
      instructor,
      ubicacion,
      duracion_horas
    } = capacitacionData;

    const query = `
      INSERT INTO capacitaciones 
      (nombre, descripcion, fecha_inicio, fecha_fin, estado, instructor, ubicacion, duracion_horas)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await executeQuery(query, [
      nombre, descripcion, fecha_inicio, fecha_fin, estado, instructor, ubicacion, duracion_horas
    ]);

    return result.insertId;
  }

  static async buscarPorId(id) {
  const query = `
    SELECT c.*, 
           COUNT(ec.empleado_id) as participantes_count,
           COUNT(CASE WHEN ec.asistio = true THEN 1 END) as asistentes_count
    FROM capacitaciones c
    LEFT JOIN empleados_capacitaciones ec ON c.id = ec.capacitacion_id
    WHERE c.id = ?
    GROUP BY c.id
  `;
  const capacitaciones = await executeQuery(query, [id]);
  return capacitaciones[0] || null;
}
  static async listarTodas(filtros = {}) {
    let query = `
      SELECT c.*, 
             COUNT(ec.empleado_id) as participantes_count,
             COUNT(CASE WHEN ec.asistio = true THEN 1 END) as asistentes_count
      FROM capacitaciones c 
      LEFT JOIN empleados_capacitaciones ec ON c.id = ec.capacitacion_id 
      WHERE 1=1
    `;
    const params = [];

    if (filtros.estado) {
      query += ' AND c.estado = ?';
      params.push(filtros.estado);
    }

    if (filtros.fecha_inicio) {
      query += ' AND c.fecha_inicio >= ?';
      params.push(filtros.fecha_inicio);
    }

    if (filtros.fecha_fin) {
      query += ' AND c.fecha_fin <= ?';
      params.push(filtros.fecha_fin);
    }

    query += ' GROUP BY c.id ORDER BY c.fecha_inicio DESC';
    return await executeQuery(query, params);
  }

  static async actualizar(id, datosActualizados) {
    const campos = Object.keys(datosActualizados);
    const valores = Object.values(datosActualizados);

    const setClause = campos.map(campo => `${campo} = ?`).join(', ');
    const query = `UPDATE capacitaciones SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;

    await executeQuery(query, [...valores, id]);
    return await this.buscarPorId(id);
  }

  static async eliminar(id) {
    const query = 'DELETE FROM capacitaciones WHERE id = ?';
    await executeQuery(query, [id]);
  }

  static async asignarEmpleados(capacitacionId, empleadosIds) {
    if (empleadosIds.length === 0) return;
    
    // CORREGIDO: Usar parámetros preparados en lugar de interpolación
    const placeholders = empleadosIds.map(() => '(?, ?)').join(',');
    const values = empleadosIds.flatMap(empleadoId => [empleadoId, capacitacionId]);
    
    const query = `
      INSERT IGNORE INTO empleados_capacitaciones (empleado_id, capacitacion_id)
      VALUES ${placeholders}
    `;
    
    await executeQuery(query, values);
  }

  static async desasignarEmpleado(capacitacionId, empleadoId) {
    const query = 'DELETE FROM empleados_capacitaciones WHERE capacitacion_id = ? AND empleado_id = ?';
    await executeQuery(query, [capacitacionId, empleadoId]);
  }

  static async obtenerEmpleadosAsignados(capacitacionId) {
    const query = `
      SELECT ec.*, 
             e.id as empleado_id,
             e.codigo_empleado, 
             u.nombre, 
             u.apellido, 
             u.email,
             e.departamento, 
             e.puesto,
             TIMESTAMPDIFF(YEAR, e.fecha_contratacion, CURDATE()) as antiguedad_anios
      FROM empleados_capacitaciones ec
      JOIN empleados e ON ec.empleado_id = e.id
      JOIN usuarios u ON e.usuario_id = u.id
      WHERE ec.capacitacion_id = ?
      ORDER BY u.nombre, u.apellido
    `;
    return await executeQuery(query, [capacitacionId]);
  }

  static async obtenerEmpleadosNoAsignados(capacitacionId) {
    const query = `
      SELECT e.*, u.nombre, u.apellido, u.email, u.telefono, e.departamento, e.puesto
      FROM empleados e
      JOIN usuarios u ON e.usuario_id = u.id
      WHERE e.activo = true 
      AND e.id NOT IN (
        SELECT empleado_id 
        FROM empleados_capacitaciones 
        WHERE capacitacion_id = ?
      )
      ORDER BY u.nombre, u.apellido
    `;
    return await executeQuery(query, [capacitacionId]);
  }

  static async actualizarProgreso(capacitacionId, empleadoId, progreso, asistio = null, calificacion = null) {
    const query = `
      UPDATE empleados_capacitaciones 
      SET progreso = ?, 
          asistio = COALESCE(?, asistio),
          calificacion = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE capacitacion_id = ? AND empleado_id = ?
    `;
    await executeQuery(query, [progreso, asistio, calificacion, capacitacionId, empleadoId]);
  }

  static async obtenerCapacitacionesPorEmpleado(empleadoId) {
    const query = `
      SELECT c.*, 
             ec.progreso, 
             ec.asistio, 
             ec.calificacion,
             CASE 
               WHEN c.fecha_inicio > CURDATE() THEN 'PENDIENTE'
               WHEN c.fecha_fin < CURDATE() THEN 'COMPLETADA'
               ELSE 'EN_CURSO'
             END as estado_real
      FROM capacitaciones c
      JOIN empleados_capacitaciones ec ON c.id = ec.capacitacion_id
      WHERE ec.empleado_id = ?
      ORDER BY c.fecha_inicio DESC
    `;
    return await executeQuery(query, [empleadoId]);
  }

  static async obtenerEstadisticas() {
    const query = `
      SELECT 
        COUNT(DISTINCT c.id) as total_capacitaciones,
        COUNT(DISTINCT CASE WHEN c.estado = 'COMPLETADA' THEN c.id END) as completadas,
        COUNT(DISTINCT CASE WHEN c.estado = 'EN_CURSO' THEN c.id END) as en_curso,
        COUNT(DISTINCT CASE WHEN c.estado = 'PLANIFICADA' THEN c.id END) as planificadas,
        AVG(ec.progreso) as promedio_progreso,
        COUNT(DISTINCT ec.empleado_id) as total_participantes,
        COUNT(CASE WHEN ec.asistio = true THEN 1 END) as total_asistencias
      FROM capacitaciones c
      LEFT JOIN empleados_capacitaciones ec ON c.id = ec.capacitacion_id
    `;
    const result = await executeQuery(query);
    return result[0];
  }

  static async actualizarEstadoAutomatico() {
    const query = `
      UPDATE capacitaciones 
      SET estado = CASE 
        WHEN fecha_fin < CURDATE() THEN 'COMPLETADA'
        WHEN fecha_inicio <= CURDATE() AND fecha_fin >= CURDATE() THEN 'EN_CURSO'
        ELSE estado
      END,
      updated_at = CURRENT_TIMESTAMP
      WHERE estado IN ('PLANIFICADA', 'EN_CURSO')
    `;
    await executeQuery(query);
  }

  static async obtenerCapacitacionesProximas(dias = 7) {
    const query = `
      SELECT c.*, 
             COUNT(ec.empleado_id) as participantes_count
      FROM capacitaciones c
      LEFT JOIN empleados_capacitaciones ec ON c.id = ec.capacitacion_id
      WHERE c.fecha_inicio BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL ? DAY)
      AND c.estado = 'PLANIFICADA'
      GROUP BY c.id
      ORDER BY c.fecha_inicio ASC
    `;
    return await executeQuery(query, [dias]);
  }

  static async obtenerReporteParticipacion() {
    const query = `
      SELECT 
        c.nombre as capacitacion,
        COUNT(ec.empleado_id) as total_participantes,
        COUNT(CASE WHEN ec.asistio = true THEN 1 END) as asistentes,
        COUNT(CASE WHEN ec.asistio = false THEN 1 END) as ausentes,
        AVG(ec.progreso) as progreso_promedio,
        AVG(ec.calificacion) as calificacion_promedio
      FROM capacitaciones c
      LEFT JOIN empleados_capacitaciones ec ON c.id = ec.capacitacion_id
      GROUP BY c.id, c.nombre
      ORDER BY c.fecha_inicio DESC
    `;
    return await executeQuery(query);
  }
}