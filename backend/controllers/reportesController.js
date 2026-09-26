import { Reporte } from '../models/Reporte.js';

export class ReportesController {

    static async obtenerDashboard(req, res) {
        try {
            const user = req.user;
            console.log('Usuario solicitando dashboard:', { id: user.id, rol: user.rol });

            let dashboardData;

            switch (user.rol) {
                case 'ADMIN_RRHH':
                    console.log('Obteniendo dashboard para ADMIN_RRHH');
                    dashboardData = await Reporte.obtenerDashboardAdmin();
                    break;
                case 'DIRECTIVO':
                    console.log('Obteniendo dashboard para DIRECTIVO');
                    dashboardData = await Reporte.obtenerDashboardDirectivo();
                    break;
                case 'DOCENTE':
                    console.log('Obteniendo dashboard para DOCENTE:', user.id);
                    dashboardData = await Reporte.obtenerDashboardDocente(user.id);
                    break;
                case 'PERSONAL_APOYO':
                    console.log('Obteniendo dashboard para PERSONAL_APOYO:', user.id);
                    dashboardData = await Reporte.obtenerDashboardPersonalApoyo(user.id);
                    break;
                default:
                    console.log('Obteniendo dashboard básico para rol:', user.rol);
                    dashboardData = await Reporte.obtenerDashboardBasico();
            }

            console.log('Datos del dashboard obtenidos:', dashboardData);

            res.json({
                success: true,
                data: dashboardData
            });

        } catch (error) {
            console.error('Error obteniendo dashboard:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    static async obtenerReporteAsistencia(req, res) {
        try {
            const { fecha_inicio, fecha_fin, departamento } = req.query;

            // Validar fechas
            if (!fecha_inicio || !fecha_fin) {
                return res.status(400).json({
                    success: false,
                    error: 'Las fechas de inicio y fin son requeridas'
                });
            }

            const reporte = await Reporte.obtenerReporteAsistencia(
                fecha_inicio,
                fecha_fin,
                departamento
            );

            // Asegurar que los valores agregados de MySQL se conviertan a números
            const reporteFormateado = (reporte || []).map(r => ({
                ...r,
                dias_registrados: Number(r.dias_registrados) || 0,
                dias_normales: Number(r.dias_normales) || 0,
                dias_justificados: Number(r.dias_justificados) || 0,
                inasistencias: Number(r.inasistencias) || 0,
                promedio_horas_diarias: r.promedio_horas_diarias != null ? Number(parseFloat(r.promedio_horas_diarias).toFixed(2)) : 0
            }));

            res.json({
                success: true,
                data: reporteFormateado,
                metadata: {
                    fecha_inicio,
                    fecha_fin,
                    departamento: departamento || 'Todos',
                    total_registros: reporteFormateado.length
                }
            });

        } catch (error) {
            console.error('Error generando reporte de asistencia:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor'
            });
        }
    }

    static async obtenerReporteNomina(req, res) {
        try {
            const { periodo, departamento } = req.query;

            if (!periodo) {
                return res.status(400).json({
                    success: false,
                    error: 'El período es requerido (formato: YYYY-MM)'
                });
            }

            const reporte = await Reporte.obtenerReporteNomina(periodo, departamento);

            res.json({
                success: true,
                data: reporte,
                metadata: {
                    periodo,
                    departamento: departamento || 'Todos',
                    total_registros: reporte.length,
                    total_nomina: reporte.reduce((sum, item) => sum + parseFloat(item.salario_neto || 0), 0)
                }
            });

        } catch (error) {
            console.error('Error generando reporte de nómina:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor'
            });
        }
    }

    static async obtenerReporteDesempeno(req, res) {
        try {
            const { periodo, departamento } = req.query;

            if (!periodo) {
                return res.status(400).json({
                    success: false,
                    error: 'El período de evaluación es requerido'
                });
            }

            const reporte = await Reporte.obtenerReporteDesempeno(periodo, departamento);

            res.json({
                success: true,
                data: reporte,
                metadata: {
                    periodo,
                    departamento: departamento || 'Todos',
                    total_registros: reporte.length,
                    promedio_general: reporte.length > 0 ?
                        reporte.reduce((sum, item) => sum + parseFloat(item.puntuacion_total || 0), 0) / reporte.length : 0
                }
            });

        } catch (error) {
            console.error('Error generando reporte de desempeño:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor'
            });
        }
    }
}