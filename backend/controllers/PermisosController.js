import { Permiso } from '../models/Permiso.js';
import { Empleado } from '../models/Empleado.js';

export class PermisosController {
    static async solicitarPermiso(req, res) {
        try {
            console.log('Solicitando permiso para usuario:', req.user.id);
            
            const empleado = await Empleado.buscarPorUsuarioId(req.user.id);
            if (!empleado) {
                return res.status(404).json({
                    success: false,
                    error: 'No se encontró información de empleado'
                });
            }

            const permisoData = {
                ...req.body,
                empleado_id: empleado.id
            };

            console.log('Datos del permiso:', permisoData);

            // Validar fechas
            if (new Date(permisoData.fecha_inicio) > new Date(permisoData.fecha_fin)) {
                return res.status(400).json({
                    success: false,
                    error: 'La fecha de inicio no puede ser mayor a la fecha fin'
                });
            }

            const permisoId = await Permiso.crear(permisoData);
            const nuevoPermiso = await Permiso.buscarPorId(permisoId);

            res.status(201).json({
                success: true,
                message: 'Permiso solicitado exitosamente',
                data: nuevoPermiso
            });

        } catch (error) {
            console.error('Error solicitando permiso:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor: ' + error.message
            });
        }
    }

    static async obtenerMisPermisos(req, res) {
        try {
            console.log('Obteniendo permisos para usuario:', req.user.id);
            
            const empleado = await Empleado.buscarPorUsuarioId(req.user.id);
            if (!empleado) {
                return res.json({
                    success: true,
                    data: []
                });
            }

            const permisos = await Permiso.listarPorEmpleado(empleado.id);

            res.json({
                success: true,
                data: permisos
            });

        } catch (error) {
            console.error('Error obteniendo permisos:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor: ' + error.message
            });
        }
    }

    static async obtenerPermisosPendientes(req, res) {
        try {
            console.log('Obteniendo permisos pendientes');
            
            const permisos = await Permiso.listarPendientes();

            res.json({
                success: true,
                data: permisos
            });

        } catch (error) {
            console.error('Error obteniendo permisos pendientes:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor: ' + error.message
            });
        }
    }

    static async aprobarRechazarPermiso(req, res) {
        try {
            const { id } = req.params;
            const { estado, comentarios } = req.body;

            console.log('Aprobando/Rechazando permiso:', { 
                id, 
                estado, 
                comentarios,
                usuario: req.user.id 
            });

            if (!estado || !['APROBADO', 'RECHAZADO'].includes(estado)) {
                return res.status(400).json({
                    success: false,
                    error: 'Estado debe ser APROBADO o RECHAZADO'
                });
            }

            // Verificar que el permiso existe
            const permiso = await Permiso.buscarPorId(id);
            console.log('Permiso encontrado:', permiso);
            
            if (!permiso) {
                return res.status(404).json({
                    success: false,
                    error: 'Permiso no encontrado'
                });
            }

            if (permiso.estado !== 'PENDIENTE') {
                return res.status(400).json({
                    success: false,
                    error: 'El permiso ya ha sido procesado'
                });
            }

            // Actualizar el estado
            console.log('Actualizando estado del permiso...');
            await Permiso.actualizarEstado(id, estado, req.user.id, comentarios);
            
            const permisoActualizado = await Permiso.buscarPorId(id);
            console.log('Permiso actualizado:', permisoActualizado);

            res.json({
                success: true,
                message: `Permiso ${estado.toLowerCase()} exitosamente`,
                data: permisoActualizado
            });

        } catch (error) {
            console.error('Error actualizando permiso:', error);
            console.error('Stack trace:', error.stack);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor: ' + error.message
            });
        }
    }

    static async obtenerTodosPermisos(req, res) {
        try {
            const permisos = await Permiso.listarTodos(req.query);

            res.json({
                success: true,
                data: permisos
            });

        } catch (error) {
            console.error('Error obteniendo permisos:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor: ' + error.message
            });
        }
    }
}