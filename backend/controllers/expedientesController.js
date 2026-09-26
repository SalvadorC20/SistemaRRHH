import { Expediente } from '../models/Expediente.js';
import { Empleado } from '../models/Empleado.js';

export class ExpedientesController {
  static async obtenerExpedienteEmpleado(req, res) {
    try {
      const { empleadoId } = req.params;
      
      const expediente = await Expediente.buscarPorEmpleado(empleadoId);
      
      if (!expediente) {
        return res.status(404).json({
          success: false,
          error: 'Expediente no encontrado'
        });
      }
      
      res.json({
        success: true,
        data: expediente
      });
      
    } catch (error) {
      console.error('Error obteniendo expediente:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  static async obtenerMiExpediente(req, res) {
    try {
      // Obtener el empleado del usuario actual
      const empleado = await Empleado.buscarPorUsuarioId(req.user.id);
      
      if (!empleado) {
        return res.status(404).json({
          success: false,
          error: 'No se encontró información de empleado'
        });
      }
      
      const expediente = await Expediente.buscarPorEmpleado(empleado.id);
      
      res.json({
        success: true,
        data: expediente
      });
      
    } catch (error) {
      console.error('Error obteniendo expediente:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  static async guardarExpediente(req, res) {
    try {
      const { empleadoId } = req.params;
      const { documentos, observaciones } = req.body;

      // Verificar que el empleado existe
      const empleado = await Empleado.buscarPorId(empleadoId);
      if (!empleado) {
        return res.status(404).json({
          success: false,
          error: 'Empleado no encontrado'
        });
      }

      // Buscar si ya existe un expediente
      let expediente = await Expediente.buscarPorEmpleado(empleadoId);
      
      if (expediente) {
        // Actualizar expediente existente
        await Expediente.actualizar(expediente.id, { documentos, observaciones });
        expediente = await Expediente.buscarPorEmpleado(empleadoId);
      } else {
        // Crear nuevo expediente
        const expedienteId = await Expediente.crear({
          empleado_id: empleadoId,
          documentos,
          observaciones
        });
        expediente = await Expediente.buscarPorId(expedienteId);
      }

      res.json({
        success: true,
        message: 'Expediente guardado exitosamente',
        data: expediente
      });

    } catch (error) {
      console.error('Error guardando expediente:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  static async actualizarExpediente(req, res) {
    try {
      const { id } = req.params;
      const { documentos, observaciones } = req.body;

      // Verificar que el expediente existe
      const expediente = await Expediente.buscarPorId(id);
      if (!expediente) {
        return res.status(404).json({
          success: false,
          error: 'Expediente no encontrado'
        });
      }

      await Expediente.actualizar(id, { documentos, observaciones });
      const expedienteActualizado = await Expediente.buscarPorId(id);

      res.json({
        success: true,
        message: 'Expediente actualizado exitosamente',
        data: expedienteActualizado
      });

    } catch (error) {
      console.error('Error actualizando expediente:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  static async eliminarDocumento(req, res) {
    try {
      const { id, documentoNombre } = req.params;

      const expediente = await Expediente.buscarPorId(id);
      if (!expediente) {
        return res.status(404).json({
          success: false,
          error: 'Expediente no encontrado'
        });
      }

      await Expediente.eliminarDocumento(id, documentoNombre);
      const expedienteActualizado = await Expediente.buscarPorId(id);

      res.json({
        success: true,
        message: 'Documento eliminado exitosamente',
        data: expedienteActualizado
      });

    } catch (error) {
      console.error('Error eliminando documento:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }
}