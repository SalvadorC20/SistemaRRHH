import { Empleado } from '../models/Empleado.js';
import { Usuario } from '../models/Usuario.js';

export class EmpleadosController {
    static async crearEmpleado(req, res) {
        try {
            const empleadoData = req.body;

            // Verificar si el código de empleado ya existe
            const empleadoExistente = await Empleado.buscarPorCodigo(empleadoData.codigo_empleado);
            if (empleadoExistente) {
                return res.status(400).json({
                    success: false,
                    error: 'El código de empleado ya existe'
                });
            }

            // Verificar si el usuario existe
            const usuario = await Usuario.buscarPorId(empleadoData.usuario_id);
            if (!usuario) {
                return res.status(404).json({
                    success: false,
                    error: 'Usuario no encontrado'
                });
            }

            const empleadoId = await Empleado.crear(empleadoData);
            const nuevoEmpleado = await Empleado.buscarPorId(empleadoId);

            res.status(201).json({
                success: true,
                message: 'Empleado creado exitosamente',
                data: nuevoEmpleado
            });

        } catch (error) {
            console.error('Error creando empleado:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor'
            });
        }
    }

    static async obtenerEmpleados(req, res) {
        try {
            const empleados = await Empleado.listarTodos();

            res.json({
                success: true,
                data: empleados
            });

        } catch (error) {
            console.error('Error obteniendo empleados:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor'
            });
        }
    }

    static async obtenerEmpleado(req, res) {
        try {
            const { id } = req.params;
            const empleado = await Empleado.buscarPorId(id);

            if (!empleado) {
                return res.status(404).json({
                    success: false,
                    error: 'Empleado no encontrado'
                });
            }

            res.json({
                success: true,
                data: empleado
            });

        } catch (error) {
            console.error('Error obteniendo empleado:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor'
            });
        }
    }

    static async actualizarEmpleado(req, res) {
    try {
        const { id } = req.params;
        const datosActualizados = req.body;

        // Validar que el empleado existe
        const empleado = await Empleado.buscarPorId(id);
        if (!empleado) {
            return res.status(404).json({
                success: false,
                error: 'Empleado no encontrado'
            });
        }

        // Si se está actualizando el código, verificar que no exista otro empleado con el mismo código
        if (datosActualizados.codigo_empleado && datosActualizados.codigo_empleado !== empleado.codigo_empleado) {
            const empleadoConMismoCodigo = await Empleado.buscarPorCodigo(datosActualizados.codigo_empleado);
            if (empleadoConMismoCodigo && empleadoConMismoCodigo.id !== parseInt(id)) {
                return res.status(400).json({
                    success: false,
                    error: 'El código de empleado ya existe'
                });
            }
        }

        await Empleado.actualizar(id, datosActualizados);
        const empleadoActualizado = await Empleado.buscarPorId(id);

        res.json({
            success: true,
            message: 'Empleado actualizado exitosamente',
            data: empleadoActualizado
        });

    } catch (error) {
        console.error('Error actualizando empleado:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
}

    static async obtenerMiPerfil(req, res) {
        try {
            const empleado = await Empleado.buscarPorUsuarioId(req.user.id);

            if (!empleado) {
                return res.status(404).json({
                    success: false,
                    error: 'No se encontró información de empleado'
                });
            }

            res.json({
                success: true,
                data: empleado
            });

        } catch (error) {
            console.error('Error obteniendo perfil:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor'
            });
        }
    }
}

