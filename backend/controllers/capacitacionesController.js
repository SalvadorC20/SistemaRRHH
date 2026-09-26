import { Capacitacion } from '../models/Capacitacion.js';
import { executeQuery } from '../config/database.js';

export class CapacitacionesController {
  static async crearCapacitacion(req, res) {
    try {
      // Eliminar la llamada a actualizarEstadoAutomatico aquí para mejorar rendimiento
      const capacitacionId = await Capacitacion.crear(req.body);
      const nuevaCapacitacion = await Capacitacion.buscarPorId(capacitacionId);

      res.status(201).json({
        success: true,
        message: 'Capacitación creada exitosamente',
        data: nuevaCapacitacion
      });

    } catch (error) {
      console.error('Error creando capacitación:', error);
      
      // Mejorar mensajes de error específicos
      let errorMessage = 'Error interno del servidor';
      let statusCode = 500;
      
      if (error.code === 'ER_DUP_ENTRY') {
        errorMessage = 'Ya existe una capacitación con ese nombre';
        statusCode = 400;
      } else if (error.code === 'ER_NO_REFERENCED_ROW') {
        errorMessage = 'Datos de referencia inválidos';
        statusCode = 400;
      }
      
      res.status(statusCode).json({
        success: false,
        error: errorMessage
      });
    }
  }

  static async obtenerCapacitaciones(req, res) {
    try {
      // Ejecutar actualización de estado solo una vez al cargar la lista
      await Capacitacion.actualizarEstadoAutomatico();
      const capacitaciones = await Capacitacion.listarTodas(req.query);

      res.json({
        success: true,
        data: capacitaciones
      });

    } catch (error) {
      console.error('Error obteniendo capacitaciones:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener las capacitaciones'
      });
    }
  }

  static async obtenerCapacitacion(req, res) {
    try {
      const { id } = req.params;
      
      // Validar que el ID sea un número válido
      const capacitacionId = parseInt(id);
      if (isNaN(capacitacionId) || capacitacionId <= 0) {
        return res.status(400).json({
          success: false,
          error: 'ID de capacitación inválido'
        });
      }

      // No es necesario actualizar estado automático aquí cada vez
      const capacitacion = await Capacitacion.buscarPorId(capacitacionId);

      if (!capacitacion) {
        return res.status(404).json({
          success: false,
          error: 'Capacitación no encontrada'
        });
      }

      const empleadosAsignados = await Capacitacion.obtenerEmpleadosAsignados(capacitacionId);
      const empleadosNoAsignados = await Capacitacion.obtenerEmpleadosNoAsignados(capacitacionId);

      res.json({
        success: true,
        data: {
          ...capacitacion,
          empleados_asignados: empleadosAsignados,
          empleados_no_asignados: empleadosNoAsignados
        }
      });

    } catch (error) {
      console.error('Error obteniendo capacitación:', error);
      res.status(500).json({
        success: false,
        error: 'Error al cargar la capacitación'
      });
    }
  }

  static async asignarEmpleados(req, res) {
    try {
      const { id } = req.params;
      const { empleados } = req.body;

      // Validar ID
      const capacitacionId = parseInt(id);
      if (isNaN(capacitacionId) || capacitacionId <= 0) {
        return res.status(400).json({
          success: false,
          error: 'ID de capacitación inválido'
        });
      }

      if (!empleados || !Array.isArray(empleados) || empleados.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Debe proporcionar una lista de empleados'
        });
      }

      // Validar que todos los IDs de empleados sean números válidos
      const empleadosIdsValidos = empleados.every(empId => {
        const id = parseInt(empId);
        return !isNaN(id) && id > 0;
      });
      
      if (!empleadosIdsValidos) {
        return res.status(400).json({
          success: false,
          error: 'La lista de empleados contiene IDs inválidos'
        });
      }

      await Capacitacion.asignarEmpleados(capacitacionId, empleados);

      res.json({
        success: true,
        message: `${empleados.length} empleado(s) asignado(s) exitosamente`
      });

    } catch (error) {
      console.error('Error asignando empleados:', error);
      
      let errorMessage = 'Error al asignar empleados';
      if (error.code === 'ER_DUP_ENTRY') {
        errorMessage = 'Algunos empleados ya están asignados a esta capacitación';
      }
      
      res.status(500).json({
        success: false,
        error: errorMessage
      });
    }
  }

  static async desasignarEmpleado(req, res) {
    try {
      const { id, empleadoId } = req.params;

      // Validar IDs
      const capacitacionId = parseInt(id);
      const empId = parseInt(empleadoId);
      
      if (isNaN(capacitacionId) || capacitacionId <= 0) {
        return res.status(400).json({
          success: false,
          error: 'ID de capacitación inválido'
        });
      }

      if (isNaN(empId) || empId <= 0) {
        return res.status(400).json({
          success: false,
          error: 'ID de empleado inválido'
        });
      }

      const result = await Capacitacion.desasignarEmpleado(capacitacionId, empId);

      res.json({
        success: true,
        message: 'Empleado desasignado exitosamente'
      });

    } catch (error) {
      console.error('Error desasignando empleado:', error);
      res.status(500).json({
        success: false,
        error: 'Error al desasignar empleado'
      });
    }
  }

  static async actualizarProgreso(req, res) {
    try {
      const { id, empleadoId } = req.params;
      const { progreso, asistio, calificacion } = req.body;

      // Validar IDs
      const capacitacionId = parseInt(id);
      const empId = parseInt(empleadoId);
      
      if (isNaN(capacitacionId) || capacitacionId <= 0) {
        return res.status(400).json({
          success: false,
          error: 'ID de capacitación inválido'
        });
      }

      if (isNaN(empId) || empId <= 0) {
        return res.status(400).json({
          success: false,
          error: 'ID de empleado inválido'
        });
      }

      // Validar que al menos un campo sea proporcionado
      if (progreso === undefined && asistio === undefined && calificacion === undefined) {
        return res.status(400).json({
          success: false,
          error: 'Debe proporcionar al menos un campo para actualizar'
        });
      }

      // Validar rangos
      if (progreso !== undefined && (progreso < 0 || progreso > 100)) {
        return res.status(400).json({
          success: false,
          error: 'El progreso debe estar entre 0 y 100'
        });
      }

      if (calificacion !== undefined && calificacion !== null && (calificacion < 0 || calificacion > 100)) {
        return res.status(400).json({
          success: false,
          error: 'La calificación debe estar entre 0 y 100'
        });
      }

      await Capacitacion.actualizarProgreso(capacitacionId, empId, progreso, asistio, calificacion);

      res.json({
        success: true,
        message: 'Progreso actualizado exitosamente'
      });

    } catch (error) {
      console.error('Error actualizando progreso:', error);
      res.status(500).json({
        success: false,
        error: 'Error al actualizar el progreso'
      });
    }
  }

  static async actualizarCapacitacion(req, res) {
    try {
      const { id } = req.params;

      // Validar ID
      const capacitacionId = parseInt(id);
      if (isNaN(capacitacionId) || capacitacionId <= 0) {
        return res.status(400).json({
          success: false,
          error: 'ID de capacitación inválido'
        });
      }
      
      // Verificar que la capacitación existe antes de actualizar
      const capacitacionExistente = await Capacitacion.buscarPorId(capacitacionId);
      if (!capacitacionExistente) {
        return res.status(404).json({
          success: false,
          error: 'Capacitación no encontrada'
        });
      }
      
      const capacitacionActualizada = await Capacitacion.actualizar(capacitacionId, req.body);

      res.json({
        success: true,
        message: 'Capacitación actualizada exitosamente',
        data: capacitacionActualizada
      });

    } catch (error) {
      console.error('Error actualizando capacitación:', error);
      res.status(500).json({
        success: false,
        error: 'Error al actualizar la capacitación'
      });
    }
  }

  static async eliminarCapacitacion(req, res) {
    try {
      const { id } = req.params;

      // Validar ID
      const capacitacionId = parseInt(id);
      if (isNaN(capacitacionId) || capacitacionId <= 0) {
        return res.status(400).json({
          success: false,
          error: 'ID de capacitación inválido'
        });
      }

      // Verificar que existe antes de eliminar
      const capacitacionExistente = await Capacitacion.buscarPorId(capacitacionId);
      if (!capacitacionExistente) {
        return res.status(404).json({
          success: false,
          error: 'Capacitación no encontrada'
        });
      }

      await Capacitacion.eliminar(capacitacionId);

      res.json({
        success: true,
        message: 'Capacitación eliminada exitosamente'
      });

    } catch (error) {
      console.error('Error eliminando capacitación:', error);
      
      let errorMessage = 'Error al eliminar la capacitación';
      if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        errorMessage = 'No se puede eliminar la capacitación porque tiene empleados asignados';
      }
      
      res.status(500).json({
        success: false,
        error: errorMessage
      });
    }
  }

  static async obtenerMisCapacitaciones(req, res) {
    try {
      const usuarioId = req.user.id;
      
      // Obtener el empleado asociado al usuario
      const empleadoQuery = 'SELECT id FROM empleados WHERE usuario_id = ? AND activo = true';
      const empleados = await executeQuery(empleadoQuery, [usuarioId]);
      
      if (empleados.length === 0) {
        return res.json({
          success: true,
          data: []
        });
      }
      
      const empleadoId = empleados[0].id;
      const capacitaciones = await Capacitacion.obtenerCapacitacionesPorEmpleado(empleadoId);
      
      res.json({
        success: true,
        data: capacitaciones
      });
      
    } catch (error) {
      console.error('Error obteniendo mis capacitaciones:', error);
      res.status(500).json({
        success: false,
        error: 'Error al cargar tus capacitaciones'
      });
    }
  }

  static async obtenerEstadisticas(req, res) {
    try {
      const estadisticas = await Capacitacion.obtenerEstadisticas();

      res.json({
        success: true,
        data: estadisticas
      });

    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      res.status(500).json({
        success: false,
        error: 'Error al cargar las estadísticas'
      });
    }
  }

  static async obtenerCapacitacionesProximas(req, res) {
    try {
      const { dias = 7 } = req.query;
      const diasNum = parseInt(dias);
      
      if (isNaN(diasNum) || diasNum <= 0) {
        return res.status(400).json({
          success: false,
          error: 'El parámetro días debe ser un número positivo'
        });
      }
      
      const capacitaciones = await Capacitacion.obtenerCapacitacionesProximas(diasNum);

      res.json({
        success: true,
        data: capacitaciones
      });

    } catch (error) {
      console.error('Error obteniendo capacitaciones próximas:', error);
      res.status(500).json({
        success: false,
        error: 'Error al cargar las capacitaciones próximas'
      });
    }
  }

  static async obtenerReporteParticipacion(req, res) {
    try {
      const reporte = await Capacitacion.obtenerReporteParticipacion();

      res.json({
        success: true,
        data: reporte
      });

    } catch (error) {
      console.error('Error obteniendo reporte de participación:', error);
      res.status(500).json({
        success: false,
        error: 'Error al generar el reporte de participación'
      });
    }
  }
}