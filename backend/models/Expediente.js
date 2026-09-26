import { executeQuery } from '../config/database.js';

export class Expediente {
  static async crear(expedienteData) {
    const {
      empleado_id,
      documentos,
      observaciones
    } = expedienteData;

    const query = `
      INSERT INTO expedientes (empleado_id, documentos, observaciones)
      VALUES (?, ?, ?)
    `;

    const result = await executeQuery(query, [
      empleado_id, 
      JSON.stringify(documentos || []), 
      observaciones || ''
    ]);

    return result.insertId;
  }

  static async buscarPorId(id) {
    const query = `
      SELECT e.*, emp.codigo_empleado, usr.nombre, usr.apellido
      FROM expedientes e
      JOIN empleados emp ON e.empleado_id = emp.id
      JOIN usuarios usr ON emp.usuario_id = usr.id
      WHERE e.id = ?
    `;
    const expedientes = await executeQuery(query, [id]);
    return expedientes[0] || null;
  }

  static async buscarPorEmpleado(empleadoId) {
    const query = `
      SELECT e.*, emp.codigo_empleado, usr.nombre, usr.apellido
      FROM expedientes e
      JOIN empleados emp ON e.empleado_id = emp.id
      JOIN usuarios usr ON emp.usuario_id = usr.id
      WHERE e.empleado_id = ?
    `;
    const expedientes = await executeQuery(query, [empleadoId]);
    return expedientes[0] || null;
  }

  static async actualizar(id, datosActualizados) {
    const campos = Object.keys(datosActualizados);
    const valores = Object.values(datosActualizados);
    
    // Convertir documentos a JSON si existe
    const valoresConvertidos = valores.map(valor => {
      if (Array.isArray(valor)) {
        return JSON.stringify(valor);
      }
      return valor;
    });
    
    const setClause = campos.map(campo => `${campo} = ?`).join(', ');
    const query = `UPDATE expedientes SET ${setClause} WHERE id = ?`;
    
    await executeQuery(query, [...valoresConvertidos, id]);
  }

  static async eliminarDocumento(id, documentoNombre) {
    const expediente = await this.buscarPorId(id);
    if (!expediente) return;

    let documentos = expediente.documentos;
    if (typeof documentos === 'string') {
      documentos = JSON.parse(documentos);
    }

    // Filtrar el documento a eliminar
    const nuevosDocumentos = documentos.filter(doc => doc !== documentoNombre);
    
    await this.actualizar(id, { documentos: nuevosDocumentos });
  }

  static async listarTodos() {
    const query = `
      SELECT e.*, emp.codigo_empleado, usr.nombre, usr.apellido
      FROM expedientes e
      JOIN empleados emp ON e.empleado_id = emp.id
      JOIN usuarios usr ON emp.usuario_id = usr.id
      ORDER BY e.updated_at DESC
    `;
    return await executeQuery(query);
  }
}