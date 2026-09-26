import { Asistencia } from '../models/Asistencia.js';
import { Empleado } from '../models/Empleado.js';

export class AsistenciaController {
    static async registrarAsistencia(req, res) {
        try {
            const empleado = await Empleado.buscarPorUsuarioId(req.user.id);
            if (!empleado) {
                return res.status(404).json({
                    success: false,
                    error: 'No se encontró información de empleado'
                });
            }

            const asistenciaData = {
                ...req.body,
                empleado_id: empleado.id
            };

            // Validar que no exista ya un registro para esta fecha
            const registroExistente = await Asistencia.buscarPorEmpleadoYFecha(
                empleado.id,
                asistenciaData.fecha
            );

            if (registroExistente) {
                return res.status(400).json({
                    success: false,
                    error: 'Ya existe un registro de asistencia para esta fecha'
                });
            }

            const asistenciaId = await Asistencia.registrar(asistenciaData);

            res.json({
                success: true,
                message: 'Asistencia registrada exitosamente',
                data: { id: asistenciaId }
            });

        } catch (error) {
            console.error('Error registrando asistencia:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor'
            });
        }
    }

    static async justificarInasistencia(req, res) {
        try {
            const { id } = req.params;
            const { justificacion } = req.body;

            await Asistencia.justificarInasistencia(id, justificacion);

            res.json({
                success: true,
                message: 'Inasistencia justificada exitosamente'
            });

        } catch (error) {
            console.error('Error justificando inasistencia:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor'
            });
        }
    }

    static async obtenerMiAsistencia(req, res) {
        try {
            const empleado = await Empleado.buscarPorUsuarioId(req.user.id);
            if (!empleado) {
                return res.status(404).json({
                    success: false,
                    error: 'No se encontró información de empleado'
                });
            }

            const { fecha_inicio, fecha_fin } = req.query;
            const asistencia = await Asistencia.obtenerPorEmpleadoPeriodo(
                empleado.id,
                fecha_inicio,
                fecha_fin
            );

            res.json({
                success: true,
                data: asistencia
            });

        } catch (error) {
            console.error('Error obteniendo asistencia:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor'
            });
        }
    }

    static async obtenerReporteAsistencia(req, res) {
        try {
            const { departamento, fecha_inicio, fecha_fin } = req.query;

            const reporte = await Asistencia.obtenerReporteDetallado(
                departamento,
                fecha_inicio,
                fecha_fin
            );

            res.json({
                success: true,
                data: reporte
            });

        } catch (error) {
            console.error('Error obteniendo reporte de asistencia:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor'
            });
        }
    }
}
