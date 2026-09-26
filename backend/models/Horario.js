import { executeQuery } from '../config/database.js';

export class Horario {
  static DIAS_SEMANA = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];

  static async buscarPorEmpleado(empleadoId) {
    const query = `
      SELECT h.*, e.codigo_empleado, u.nombre, u.apellido
      FROM horarios h
      JOIN empleados e ON h.empleado_id = e.id
      JOIN usuarios u ON e.usuario_id = u.id
      WHERE h.empleado_id = ? AND h.activo = TRUE
      ORDER BY 
        FIELD(h.dia_semana, 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'),
        h.hora_entrada
    `;
    return await executeQuery(query, [empleadoId]);
  }

  static async guardarHorarios(empleadoId, horarios) {
    // Desactivar horarios existentes
    await executeQuery(
      'UPDATE horarios SET activo = FALSE WHERE empleado_id = ?',
      [empleadoId]
    );

    // Insertar nuevos horarios
    for (const horario of horarios) {
      if (horario.hora_entrada && horario.hora_salida) {
        await executeQuery(
          `INSERT INTO horarios (empleado_id, dia_semana, hora_entrada, hora_salida, activo)
           VALUES (?, ?, ?, ?, TRUE)`,
          [empleadoId, horario.dia_semana, horario.hora_entrada, horario.hora_salida]
        );
      }
    }
  }

  static async validarHorarios(horarios) {
    for (const horario of horarios) {
      if (!this.DIAS_SEMANA.includes(horario.dia_semana)) {
        return false;
      }
      
      if (!horario.hora_entrada || !horario.hora_salida) {
        return false;
      }
      
      if (horario.hora_entrada >= horario.hora_salida) {
        return false;
      }
    }
    return true;
  }

  static async validarDisponibilidad(empleadoId, horarios) {
    const conflictos = [];
    
    for (const nuevoHorario of horarios) {
      if (!nuevoHorario.hora_entrada || !nuevoHorario.hora_salida) continue;
      
      // Verificar conflictos con horarios existentes del mismo empleado
      const query = `
        SELECT * FROM horarios 
        WHERE empleado_id = ? 
        AND dia_semana = ? 
        AND activo = TRUE
        AND (
          (hora_entrada BETWEEN ? AND ?) OR
          (hora_salida BETWEEN ? AND ?) OR
          (? BETWEEN hora_entrada AND hora_salida) OR
          (? BETWEEN hora_entrada AND hora_salida)
        )
      `;
      
      const horariosConflictivos = await executeQuery(query, [
        empleadoId,
        nuevoHorario.dia_semana,
        nuevoHorario.hora_entrada, nuevoHorario.hora_salida,
        nuevoHorario.hora_entrada, nuevoHorario.hora_salida,
        nuevoHorario.hora_entrada, nuevoHorario.hora_salida
      ]);
      
      if (horariosConflictivos.length > 0) {
        conflictos.push({
          dia: nuevoHorario.dia_semana,
          horario: `${nuevoHorario.hora_entrada} - ${nuevoHorario.hora_salida}`,
          conflictos: horariosConflictivos
        });
      }
    }
    
    return conflictos;
  }

  static async obtenerTodosConEmpleados() {
    const query = `
      SELECT h.*, e.codigo_empleado, u.nombre, u.apellido, u.email, e.departamento, e.puesto
      FROM horarios h
      JOIN empleados e ON h.empleado_id = e.id
      JOIN usuarios u ON e.usuario_id = u.id
      WHERE h.activo = TRUE
      ORDER BY u.nombre, u.apellido, 
        FIELD(h.dia_semana, 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO')
    `;
    return await executeQuery(query);
  }

  static async eliminarHorariosEmpleado(empleadoId) {
    await executeQuery(
      'DELETE FROM horarios WHERE empleado_id = ?',
      [empleadoId]
    );
  }
}