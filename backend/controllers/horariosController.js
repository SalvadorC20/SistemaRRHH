import { Horario } from '../models/Horario.js';
import { Empleado } from '../models/Empleado.js';

export class HorariosController {
  static async obtenerHorariosEmpleado(req, res) {
    try {
      const { empleadoId } = req.params;
      
      const horarios = await Horario.buscarPorEmpleado(empleadoId);
      
      res.json({
        success: true,
        data: horarios
      });
      
    } catch (error) {
      console.error('Error obteniendo horarios:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  static async obtenerMisHorarios(req, res) {
    try {
      // Obtener el empleado del usuario actual
      const empleado = await Empleado.buscarPorUsuarioId(req.user.id);
      
      if (!empleado) {
        return res.status(404).json({
          success: false,
          error: 'No se encontró información de empleado'
        });
      }
      
      const horarios = await Horario.buscarPorEmpleado(empleado.id);
      
      res.json({
        success: true,
        data: horarios
      });
      
    } catch (error) {
      console.error('Error obteniendo horarios:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  static async guardarHorarios(req, res) {
    try {
      const { empleadoId } = req.params;
      const { horarios } = req.body;

      // Verificar que el empleado existe
      const empleado = await Empleado.buscarPorId(empleadoId);
      if (!empleado) {
        return res.status(404).json({
          success: false,
          error: 'Empleado no encontrado'
        });
      }

      // Validar horarios
      const horariosValidos = await Horario.validarHorarios(horarios);
      if (!horariosValidos) {
        return res.status(400).json({
          success: false,
          error: 'Los horarios no son válidos'
        });
      }

      // Guardar horarios
      await Horario.guardarHorarios(empleadoId, horarios);

      res.json({
        success: true,
        message: 'Horarios guardados exitosamente'
      });

    } catch (error) {
      console.error('Error guardando horarios:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  static async validarDisponibilidad(req, res) {
    try {
      const { empleadoId, horarios } = req.body;

      const conflictos = await Horario.validarDisponibilidad(empleadoId, horarios);
      
      res.json({
        success: true,
        data: {
          disponible: conflictos.length === 0,
          conflictos
        }
      });

    } catch (error) {
      console.error('Error validando disponibilidad:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  static async obtenerTodosHorarios(req, res) {
    try {
      const horarios = await Horario.obtenerTodosConEmpleados();
      
      res.json({
        success: true,
        data: horarios
      });

    } catch (error) {
      console.error('Error obteniendo horarios:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }
}