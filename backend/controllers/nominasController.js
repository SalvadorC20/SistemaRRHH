import { Nomina } from '../models/Nomina.js';
import { Empleado } from '../models/Empleado.js';

export class NominasController {
    static async generarNomina(req, res) {
        try {
            const nominaData = req.body;
            
            // Validar datos requeridos
            if (!nominaData.empleado_id || !nominaData.periodo_pago || !nominaData.salario_bruto) {
                return res.status(400).json({
                    success: false,
                    error: 'Datos incompletos: empleado_id, periodo_pago y salario_bruto son requeridos'
                });
            }

            // Calcular deducciones automáticamente si no se proporcionan
            if (!nominaData.deducciones || Object.keys(nominaData.deducciones).length === 0) {
                const calculo = NominasController.calcularDeduccionesLey(parseFloat(nominaData.salario_bruto));
                nominaData.deducciones = calculo.deducciones;
                nominaData.salario_neto = calculo.salario_neto;
            }

            // Validar que el salario neto sea positivo
            if (nominaData.salario_neto < 0) {
                return res.status(400).json({
                    success: false,
                    error: 'El salario neto no puede ser negativo'
                });
            }

            const nominaId = await Nomina.crear(nominaData);
            const nuevaNomina = await Nomina.buscarPorId(nominaId);

            res.status(201).json({
                success: true,
                message: 'Nómina generada exitosamente',
                data: nuevaNomina
            });

        } catch (error) {
            console.error('Error generando nómina:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor'
            });
        }
    }

    static async obtenerMisNominas(req, res) {
        try {
            const empleado = await Empleado.buscarPorUsuarioId(req.user.id);
            if (!empleado) {
                return res.status(404).json({
                    success: false,
                    error: 'No se encontró información de empleado'
                });
            }

            const nominas = await Nomina.listarPorEmpleado(empleado.id);

            res.json({
                success: true,
                data: nominas
            });

        } catch (error) {
            console.error('Error obteniendo nóminas:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor'
            });
        }
    }

    static async obtenerTodasNominas(req, res) {
        try {
            const nominas = await Nomina.listarTodas(req.query);

            res.json({
                success: true,
                data: nominas
            });

        } catch (error) {
            console.error('Error obteniendo nóminas:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor'
            });
        }
    }

    static async obtenerResumenPeriodo(req, res) {
        try {
            const { periodo } = req.params;
            const resumen = await Nomina.obtenerResumenPeriodo(periodo);

            res.json({
                success: true,
                data: resumen
            });

        } catch (error) {
            console.error('Error obteniendo resumen:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor'
            });
        }
    }

    static async actualizarEstadoNomina(req, res) {
        try {
            const { id } = req.params;
            const { estado } = req.body;

            if (!['PENDIENTE', 'PAGADO', 'CANCELADO'].includes(estado)) {
                return res.status(400).json({
                    success: false,
                    error: 'Estado inválido. Los estados permitidos son: PENDIENTE, PAGADO, CANCELADO'
                });
            }

            await Nomina.actualizarEstado(id, estado);
            const nominaActualizada = await Nomina.buscarPorId(id);

            res.json({
                success: true,
                message: `Nómina ${estado.toLowerCase()} exitosamente`,
                data: nominaActualizada
            });

        } catch (error) {
            console.error('Error actualizando nómina:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor'
            });
        }
    }

    // NUEVO: Calcular deducciones según ley nicaragüense
    static async calcularDeducciones(req, res) {
        try {
            const { salario_bruto, calculo_manual } = req.body;
            
            if (!salario_bruto || isNaN(salario_bruto)) {
                return res.status(400).json({
                    success: false,
                    error: 'Salario bruto es requerido y debe ser un número válido'
                });
            }

            const salarioBruto = parseFloat(salario_bruto);

            if (salarioBruto <= 0) {
                return res.status(400).json({
                    success: false,
                    error: 'El salario bruto debe ser mayor a 0'
                });
            }

            // Si es cálculo manual, usar las deducciones proporcionadas
            if (calculo_manual && req.body.deducciones) {
                const deducciones = req.body.deducciones;
                const totalDeducciones = (deducciones.inss || 0) + (deducciones.ir || 0) + (deducciones.otros || 0);
                const salarioNeto = salarioBruto - totalDeducciones;

                return res.json({
                    success: true,
                    data: {
                        deducciones,
                        salario_neto: Math.max(0, salarioNeto),
                        desglose: NominasController.generarDesglose(salarioBruto, deducciones)
                    }
                });
            }

            // Cálculo automático según ley
            const calculo = NominasController.calcularDeduccionesLey(salarioBruto);

            res.json({
                success: true,
                data: {
                    deducciones: calculo.deducciones,
                    salario_neto: calculo.salario_neto,
                    desglose: NominasController.generarDesglose(salarioBruto, calculo.deducciones)
                }
            });

        } catch (error) {
            console.error('Error calculando deducciones:', error);
            res.status(500).json({
                success: false,
                error: 'Error calculando deducciones: ' + error.message
            });
        }
    }

    // NUEVO: Obtener tasas actuales según ley
    static async obtenerTasasActuales(req, res) {
        try {
            const tasas = NominasController.obtenerTasasVigentes();
            
            res.json({
                success: true,
                data: tasas
            });

        } catch (error) {
            console.error('Error obteniendo tasas:', error);
            res.status(500).json({
                success: false,
                error: 'Error obteniendo tasas actuales: ' + error.message
            });
        }
    }

    // NUEVO: Generar reporte legal
    static async generarReporteLegal(req, res) {
        try {
            const { periodo } = req.params;
            
            if (!periodo) {
                return res.status(400).json({
                    success: false,
                    error: 'Período es requerido'
                });
            }

            const reporte = await Nomina.generarReporteLegal(periodo);

            res.json({
                success: true,
                data: reporte
            });

        } catch (error) {
            console.error('Error generando reporte legal:', error);
            res.status(500).json({
                success: false,
                error: 'Error generando reporte legal: ' + error.message
            });
        }
    }

    // NUEVO: Obtener estadísticas generales
    static async obtenerEstadisticasGenerales(req, res) {
        try {
            const estadisticas = await Nomina.obtenerEstadisticasGenerales();
            
            res.json({
                success: true,
                data: estadisticas
            });

        } catch (error) {
            console.error('Error obteniendo estadísticas:', error);
            res.status(500).json({
                success: false,
                error: 'Error obteniendo estadísticas generales: ' + error.message
            });
        }
    }

    // NUEVO: Validar nómina antes de generar
    static async validarNomina(req, res) {
        try {
            const { empleado_id, salario_bruto, periodo_pago } = req.body;

            if (!empleado_id || !salario_bruto) {
                return res.status(400).json({
                    success: false,
                    error: 'empleado_id y salario_bruto son requeridos'
                });
            }

            // Verificar si ya existe nómina para este empleado en el período
            const nominasExistentes = await Nomina.listarTodas({
                empleado_id,
                periodo_pago
            });

            if (nominasExistentes.length > 0) {
                return res.json({
                    success: true,
                    data: {
                        valido: false,
                        error: `Ya existe una nómina para este empleado en el período ${periodo_pago}`,
                        nominas_existentes: nominasExistentes
                    }
                });
            }

            // Verificar que el salario no sea menor al mínimo
            const tasas = NominasController.obtenerTasasVigentes();
            if (salario_bruto < tasas.salario_minimo_educacion) {
                return res.json({
                    success: true,
                    data: {
                        valido: false,
                        advertencia: `El salario bruto (C$ ${salario_bruto}) es menor al salario mínimo del sector educación (C$ ${tasas.salario_minimo_educacion})`,
                        salario_minimo: tasas.salario_minimo_educacion
                    }
                });
            }

            // Calcular deducciones para previsualización
            const calculo = NominasController.calcularDeduccionesLey(parseFloat(salario_bruto));

            res.json({
                success: true,
                data: {
                    valido: true,
                    deducciones: calculo.deducciones,
                    salario_neto: calculo.salario_neto,
                    desglose: NominasController.generarDesglose(parseFloat(salario_bruto), calculo.deducciones),
                    advertencias: []
                }
            });

        } catch (error) {
            console.error('Error validando nómina:', error);
            res.status(500).json({
                success: false,
                error: 'Error validando nómina: ' + error.message
            });
        }
    }

    // ========== MÉTODOS ESTÁTICOS DE CÁLCULO ==========

    static calcularDeduccionesLey(salarioBruto) {
        const tasas = NominasController.obtenerTasasVigentes();
        
        // Calcular INSS (límite máximo según ley)
        const baseINSS = Math.min(salarioBruto, tasas.limite_inss);
        const inss = baseINSS * tasas.inss_empleado;

        // Calcular IR: Deduciendo INSS laboral de la base imponible
        const baseGravableMensual = Math.max(0, salarioBruto - inss);
        const ir = NominasController.calcularImpuestoRenta(baseGravableMensual, tasas.ir_escalas);

        // Calcular aportes patronales
        const inssPatronal = baseINSS * tasas.inss_patronal;
        const inatec = baseINSS * tasas.inatec;

        const totalDeducciones = inss + ir;
        const salarioNeto = salarioBruto - totalDeducciones;

        return {
            deducciones: {
                inss: Math.round(inss * 100) / 100,
                ir: Math.round(ir * 100) / 100,
                otros: 0, // Se puede modificar después
                inss_patronal: Math.round(inssPatronal * 100) / 100,
                inatec: Math.round(inatec * 100) / 100,
                total: Math.round(totalDeducciones * 100) / 100
            },
            salario_neto: Math.round(salarioNeto * 100) / 100
        };
    }

    static calcularImpuestoRenta(baseGravableMensual, escalas) {
        // En Nicaragua (Ley 822), la proyección es a 12 meses (Aguinaldo/Mes 13 está exento)
        const salarioAnual = baseGravableMensual * 12;
        let impuestoAnual = 0;

        for (let i = 0; i < escalas.length; i++) {
            const escala = escalas[i];
            
            if (salarioAnual > escala.desde) {
                const baseImponible = Math.min(
                    salarioAnual, 
                    escala.hasta || Number.MAX_SAFE_INTEGER
                ) - escala.desde;
                
                impuestoAnual += baseImponible * escala.porcentaje;
            } else {
                break;
            }
        }

        // Convertir a mensual y redondear (distribuido en 12 meses)
        const impuestoMensual = impuestoAnual / 12;
        return Math.max(0, Math.round(impuestoMensual * 100) / 100);
    }

    static generarDesglose(salarioBruto, deducciones) {
        const totalDeduccionesEmpleado = (deducciones.inss || 0) + (deducciones.ir || 0) + (deducciones.otros || 0);
        const totalAportesPatronales = (deducciones.inss_patronal || 0) + (deducciones.inatec || 0);

        return {
            salario_bruto: salarioBruto,
            aporte_empleado: {
                inss: deducciones.inss || 0,
                ir: deducciones.ir || 0,
                otros: deducciones.otros || 0,
                total: totalDeduccionesEmpleado
            },
            aporte_patronal: {
                inss: deducciones.inss_patronal || 0,
                inatec: deducciones.inatec || 0,
                total: totalAportesPatronales
            },
            salario_neto: salarioBruto - totalDeduccionesEmpleado,
            costo_total_empresa: salarioBruto + totalAportesPatronales,
            relacion_costo_neto: ((salarioBruto + totalAportesPatronales) / Math.max(1, (salarioBruto - totalDeduccionesEmpleado))).toFixed(2)
        };
    }

    static obtenerTasasVigentes() {
        // Tasas según legislación nicaragüense vigente (Ley 822 y reformas INSS)
        return {
            inss_empleado: 0.07,      // 7% INSS laboral
            inss_patronal: 0.215,     // 21.5% INSS patronal
            inatec: 0.02,             // 2% INATEC
            limite_inss: 236754.24,   // Límite máximo para cálculo INSS
            salario_minimo_educacion: 6500.00,
            ir_escalas: [
                { 
                    desde: 0, 
                    hasta: 100000, 
                    porcentaje: 0,
                    descripcion: 'Exento' 
                },
                { 
                    desde: 100000.01, 
                    hasta: 200000, 
                    porcentaje: 0.15,
                    descripcion: '15% sobre excedente de 100,000' 
                },
                { 
                    desde: 200000.01, 
                    hasta: 350000, 
                    porcentaje: 0.20,
                    descripcion: '20% sobre excedente de 200,000' 
                },
                { 
                    desde: 350000.01, 
                    hasta: 500000, 
                    porcentaje: 0.25,
                    descripcion: '25% sobre excedente de 350,000' 
                },
                { 
                    desde: 500000.01, 
                    porcentaje: 0.30,
                    descripcion: '30% sobre excedente de 500,000' 
                }
            ]
        };
    }
}