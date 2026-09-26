import { Evaluacion } from '../models/Evaluacion.js';
import { Empleado } from '../models/Empleado.js';

export class EvaluacionesController {
    static async crearEvaluacion(req, res) {
        try {
            const evaluacionData = {
                ...req.body,
                evaluador_id: req.user.id
            };

            const evaluacionId = await Evaluacion.crear(evaluacionData);
            const nuevaEvaluacion = await Evaluacion.buscarPorId(evaluacionId);

            res.status(201).json({
                success: true,
                message: 'Evaluación creada exitosamente',
                data: nuevaEvaluacion
            });

        } catch (error) {
            console.error('Error creando evaluación:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor'
            });
        }
    }

    static async obtenerMisEvaluaciones(req, res) {
        try {
            const empleado = await Empleado.buscarPorUsuarioId(req.user.id);
            if (!empleado) {
                return res.status(404).json({
                    success: false,
                    error: 'No se encontró información de empleado'
                });
            }

            const evaluaciones = await Evaluacion.listarPorEmpleado(empleado.id);

            res.json({
                success: true,
                data: evaluaciones
            });

        } catch (error) {
            console.error('Error obteniendo evaluaciones:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor'
            });
        }
    }

    static async obtenerEvaluacionesRealizadas(req, res) {
        try {
            const evaluaciones = await Evaluacion.listarPorEvaluador(req.user.id);

            res.json({
                success: true,
                data: evaluaciones
            });

        } catch (error) {
            console.error('Error obteniendo evaluaciones realizadas:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor'
            });
        }
    }

    static async obtenerTodasEvaluaciones(req, res) {
        try {
            const evaluaciones = await Evaluacion.listarTodas(req.query);

            res.json({
                success: true,
                data: evaluaciones
            });

        } catch (error) {
            console.error('Error obteniendo evaluaciones:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor'
            });
        }
    }

    static async actualizarEvaluacion(req, res) {
        try {
            const { id } = req.params;
            const datosActualizados = req.body;

            const evaluacion = await Evaluacion.buscarPorId(id);
            if (!evaluacion) {
                return res.status(404).json({
                    success: false,
                    error: 'Evaluación no encontrada'
                });
            }

            await Evaluacion.actualizar(id, datosActualizados);
            const evaluacionActualizada = await Evaluacion.buscarPorId(id);

            res.json({
                success: true,
                message: 'Evaluación actualizada exitosamente',
                data: evaluacionActualizada
            });

        } catch (error) {
            console.error('Error actualizando evaluación:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor'
            });
        }
    }
}

