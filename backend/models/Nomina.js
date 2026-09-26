import { executeQuery } from '../config/database.js';

export class Nomina {
    static async crear(nominaData) {
        const {
            empleado_id,
            periodo_pago,
            fecha_pago,
            salario_bruto,
            deducciones,
            salario_neto,
            estado = 'PENDIENTE',
            horas_trabajadas = 160,
            horas_extras = 0,
            bonificaciones = 0
        } = nominaData;

        // Obtener información del empleado para el código
        const empleado = await this.obtenerEmpleadoPorId(empleado_id);
        
        const query = `
            INSERT INTO nominas 
            (empleado_id, codigo_empleado, periodo_pago, fecha_pago, salario_bruto, 
             deducciones, salario_neto, estado, horas_trabajadas, horas_extras, bonificaciones,
             inss_patronal, inatec, salario_minimo_sector, cumplimiento_legal)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        // Parsear deducciones si es string
        let deduccionesObj;
        try {
            deduccionesObj = typeof deducciones === 'string' ? JSON.parse(deducciones) : deducciones;
        } catch (error) {
            deduccionesObj = deducciones;
        }

        // Obtener salario mínimo del sector
        const salarioMinimoSector = await this.obtenerSalarioMinimoSector();
        
        // Verificar cumplimiento legal
        const cumplimientoLegal = await this.verificarCumplimientoLegal(
            parseFloat(salario_bruto), 
            deduccionesObj, 
            salarioMinimoSector
        );

        const result = await executeQuery(query, [
            empleado_id,
            empleado?.codigo_empleado || '',
            periodo_pago,
            fecha_pago,
            salario_bruto,
            JSON.stringify(deduccionesObj),
            salario_neto,
            estado,
            horas_trabajadas,
            horas_extras,
            bonificaciones,
            deduccionesObj.inss_patronal || 0,
            deduccionesObj.inatec || 0,
            salarioMinimoSector,
            cumplimientoLegal
        ]);

        return result.insertId;
    }

    static async buscarPorId(id) {
        const query = `
            SELECT n.*, 
                   e.codigo_empleado, 
                   u.nombre, 
                   u.apellido, 
                   u.email,
                   e.departamento, 
                   e.puesto, 
                   e.salario_base,
                   e.fecha_contratacion,
                   e.tipo_contrato
            FROM nominas n
            JOIN empleados e ON n.empleado_id = e.id
            JOIN usuarios u ON e.usuario_id = u.id
            WHERE n.id = ?
        `;
        const nominas = await executeQuery(query, [id]);
        return nominas[0] || null;
    }

    static async listarPorEmpleado(empleadoId) {
        const query = `
            SELECT n.*, e.codigo_empleado
            FROM nominas n
            JOIN empleados e ON n.empleado_id = e.id
            WHERE n.empleado_id = ?
            ORDER BY n.fecha_pago DESC, n.created_at DESC
        `;
        return await executeQuery(query, [empleadoId]);
    }

    static async listarTodas(filtros = {}) {
        let query = `
            SELECT n.*, 
                   e.codigo_empleado, 
                   u.nombre, 
                   u.apellido, 
                   u.email,
                   e.departamento, 
                   e.puesto
            FROM nominas n
            JOIN empleados e ON n.empleado_id = e.id
            JOIN usuarios u ON e.usuario_id = u.id
            WHERE 1=1
        `;
        const params = [];

        if (filtros.estado) {
            query += ' AND n.estado = ?';
            params.push(filtros.estado);
        }

        if (filtros.empleado_id) {
            query += ' AND n.empleado_id = ?';
            params.push(filtros.empleado_id);
        }

        if (filtros.periodo_pago) {
            query += ' AND n.periodo_pago = ?';
            params.push(filtros.periodo_pago);
        }

        if (filtros.fecha_inicio) {
            query += ' AND n.fecha_pago >= ?';
            params.push(filtros.fecha_inicio);
        }

        if (filtros.fecha_fin) {
            query += ' AND n.fecha_pago <= ?';
            params.push(filtros.fecha_fin);
        }

        if (filtros.departamento) {
            query += ' AND e.departamento = ?';
            params.push(filtros.departamento);
        }

        if (filtros.cumplimiento_legal !== undefined) {
            query += ' AND n.cumplimiento_legal = ?';
            params.push(filtros.cumplimiento_legal);
        }

        query += ' ORDER BY n.fecha_pago DESC, n.created_at DESC';
        
        // Paginación
        if (filtros.limit) {
            query += ' LIMIT ?';
            params.push(parseInt(filtros.limit));
        }

        if (filtros.offset) {
            query += ' OFFSET ?';
            params.push(parseInt(filtros.offset));
        }

        return await executeQuery(query, params);
    }

    static async actualizarEstado(id, estado) {
        const query = 'UPDATE nominas SET estado = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
        await executeQuery(query, [estado, id]);
    }

    static async obtenerResumenPeriodo(periodo) {
        const query = `
            SELECT 
                COUNT(*) as total_nominas,
                SUM(salario_bruto) as total_bruto,
                SUM(salario_neto) as total_neto,
                AVG(salario_bruto) as promedio_bruto,
                AVG(salario_neto) as promedio_neto,
                SUM(JSON_EXTRACT(deducciones, '$.inss')) as total_inss,
                SUM(JSON_EXTRACT(deducciones, '$.ir')) as total_ir,
                SUM(JSON_EXTRACT(deducciones, '$.otros')) as total_otros,
                SUM(JSON_EXTRACT(deducciones, '$.inss_patronal')) as total_inss_patronal,
                SUM(JSON_EXTRACT(deducciones, '$.inatec')) as total_inatec,
                estado,
                COUNT(*) as count_estado
            FROM nominas 
            WHERE periodo_pago = ?
            GROUP BY estado
        `;
        return await executeQuery(query, [periodo]);
    }

    static async generarReporteLegal(periodo) {
        const query = `
            SELECT 
                n.periodo_pago,
                COUNT(*) as total_nominas,
                SUM(n.salario_bruto) as total_bruto,
                SUM(n.salario_neto) as total_neto,
                SUM(JSON_EXTRACT(n.deducciones, '$.inss')) as total_inss_empleado,
                SUM(JSON_EXTRACT(n.deducciones, '$.ir')) as total_ir,
                SUM(JSON_EXTRACT(n.deducciones, '$.otros')) as total_otros,
                SUM(JSON_EXTRACT(n.deducciones, '$.inss_patronal')) as total_inss_patronal,
                SUM(JSON_EXTRACT(n.deducciones, '$.inatec')) as total_inatec,
                AVG(n.salario_bruto) as promedio_bruto,
                AVG(n.salario_neto) as promedio_neto,
                COUNT(CASE WHEN n.cumplimiento_legal = 1 THEN 1 END) as nominas_cumplen_ley,
                COUNT(CASE WHEN n.cumplimiento_legal = 0 THEN 1 END) as nominas_no_cumplen_ley,
                n.estado,
                COUNT(*) as count_estado
            FROM nominas n
            WHERE n.periodo_pago = ?
            GROUP BY n.estado
        `;
        
        const resultados = await executeQuery(query, [periodo]);
        
        // Calcular totales generales
        const totales = {
            periodo: periodo,
            total_empleados: resultados.reduce((sum, item) => sum + item.total_nominas, 0),
            total_bruto_general: resultados.reduce((sum, item) => sum + (item.total_bruto || 0), 0),
            total_neto_general: resultados.reduce((sum, item) => sum + (item.total_neto || 0), 0),
            total_aportes_empleado: resultados.reduce((sum, item) => 
                sum + (item.total_inss_empleado || 0) + (item.total_ir || 0) + (item.total_otros || 0), 0),
            total_aportes_patronales: resultados.reduce((sum, item) => 
                sum + (item.total_inss_patronal || 0) + (item.total_inatec || 0), 0),
            porcentaje_cumplimiento: 0,
            desglose_estados: resultados
        };
        
        totales.costo_total_empresa = totales.total_bruto_general + totales.total_aportes_patronales;
        totales.porcentaje_cumplimiento = totales.desglose_estados.length > 0 ?
            (totales.desglose_estados[0].nominas_cumplen_ley / totales.total_empleados * 100) : 0;
        
        return totales;
    }

    static async obtenerEstadisticasGenerales() {
        const query = `
            SELECT 
                COUNT(*) as total_nominas,
                COUNT(DISTINCT empleado_id) as total_empleados,
                SUM(salario_bruto) as total_bruto_general,
                SUM(salario_neto) as total_neto_general,
                AVG(salario_bruto) as salario_promedio,
                MIN(salario_bruto) as salario_minimo,
                MAX(salario_bruto) as salario_maximo,
                COUNT(CASE WHEN estado = 'PAGADO' THEN 1 END) as nominas_pagadas,
                COUNT(CASE WHEN estado = 'PENDIENTE' THEN 1 END) as nominas_pendientes,
                COUNT(CASE WHEN estado = 'CANCELADO' THEN 1 END) as nominas_canceladas,
                COUNT(CASE WHEN cumplimiento_legal = 1 THEN 1 END) as nominas_cumplen_ley,
                COUNT(CASE WHEN cumplimiento_legal = 0 THEN 1 END) as nominas_no_cumplen_ley
            FROM nominas
        `;
        
        const resultados = await executeQuery(query);
        return resultados[0] || null;
    }

    static async obtenerNominasPorDepartamento(periodo = null) {
        let query = `
            SELECT 
                e.departamento,
                COUNT(*) as total_nominas,
                SUM(n.salario_bruto) as total_bruto,
                SUM(n.salario_neto) as total_neto,
                AVG(n.salario_bruto) as promedio_bruto,
                AVG(n.salario_neto) as promedio_neto,
                SUM(JSON_EXTRACT(n.deducciones, '$.inss')) as total_inss,
                SUM(JSON_EXTRACT(n.deducciones, '$.ir')) as total_ir,
                SUM(JSON_EXTRACT(n.deducciones, '$.inss_patronal')) as total_inss_patronal,
                SUM(JSON_EXTRACT(n.deducciones, '$.inatec')) as total_inatec
            FROM nominas n
            JOIN empleados e ON n.empleado_id = e.id
            WHERE 1=1
        `;
        
        const params = [];
        
        if (periodo) {
            query += ' AND n.periodo_pago = ?';
            params.push(periodo);
        }
        
        query += ' GROUP BY e.departamento ORDER BY total_bruto DESC';
        
        return await executeQuery(query, params);
    }

    static async obtenerUltimosPeriodos(limit = 12) {
        const query = `
            SELECT 
                periodo_pago,
                COUNT(*) as total_nominas,
                SUM(salario_bruto) as total_bruto,
                SUM(salario_neto) as total_neto,
                AVG(salario_bruto) as promedio_bruto,
                MIN(fecha_pago) as primera_fecha,
                MAX(fecha_pago) as ultima_fecha
            FROM nominas
            GROUP BY periodo_pago
            ORDER BY ultima_fecha DESC
            LIMIT ?
        `;
        
        return await executeQuery(query, [limit]);
    }

    static async verificarDuplicado(empleadoId, periodoPago) {
        const query = `
            SELECT id, estado, salario_bruto, salario_neto
            FROM nominas
            WHERE empleado_id = ? AND periodo_pago = ?
            LIMIT 1
        `;
        
        const resultados = await executeQuery(query, [empleadoId, periodoPago]);
        return resultados[0] || null;
    }

    // Métodos auxiliares

    static async obtenerEmpleadoPorId(empleadoId) {
        const query = `
            SELECT e.*, u.nombre, u.apellido
            FROM empleados e
            JOIN usuarios u ON e.usuario_id = u.id
            WHERE e.id = ?
        `;
        const resultados = await executeQuery(query, [empleadoId]);
        return resultados[0] || null;
    }

    static async obtenerSalarioMinimoSector() {
        // En una implementación real, esto vendría de una tabla de configuración
        // Por ahora retornamos un valor por defecto para educación
        return 6500.00; // C$6,500 - Verificar valor actual según MT
    }

    static async verificarCumplimientoLegal(salarioBruto, deducciones, salarioMinimo) {
        try {
            // Verificar que el salario bruto no sea menor al mínimo
            if (salarioBruto < salarioMinimo) {
                return false;
            }

            // Verificar que las deducciones de INSS sean correctas (6.25%)
            const inssCalculado = salarioBruto * 0.0625;
            const inssAplicado = parseFloat(deducciones.inss) || 0;
            
            // Permitir pequeña diferencia por redondeo
            if (Math.abs(inssCalculado - inssAplicado) > 1.0) {
                return false;
            }

            // Verificar que el IR sea consistente (aunque puede variar por escalas)
            const irAplicado = parseFloat(deducciones.ir) || 0;
            if (irAplicado < 0) {
                return false;
            }

            // Verificar que el salario neto sea positivo
            const salarioNeto = salarioBruto - (inssAplicado + irAplicado + (parseFloat(deducciones.otros) || 0));
            if (salarioNeto < 0) {
                return false;
            }

            return true;

        } catch (error) {
            console.error('Error verificando cumplimiento legal:', error);
            return false;
        }
    }

    static async actualizarDeducciones(id, nuevasDeducciones) {
        const query = `
            UPDATE nominas 
            SET deducciones = ?, 
                salario_neto = salario_bruto - (? + ? + ?),
                updated_at = CURRENT_TIMESTAMP,
                cumplimiento_legal = ?
            WHERE id = ?
        `;
        
        const inss = parseFloat(nuevasDeducciones.inss) || 0;
        const ir = parseFloat(nuevasDeducciones.ir) || 0;
        const otros = parseFloat(nuevasDeducciones.otros) || 0;
        
        // Re-verificar cumplimiento legal
        const nomina = await this.buscarPorId(id);
        const cumplimientoLegal = await this.verificarCumplimientoLegal(
            nomina.salario_bruto, 
            nuevasDeducciones, 
            nomina.salario_minimo_sector
        );

        await executeQuery(query, [
            JSON.stringify(nuevasDeducciones),
            inss,
            ir,
            otros,
            cumplimientoLegal,
            id
        ]);

        return await this.buscarPorId(id);
    }

    static async eliminar(id) {
        const query = 'DELETE FROM nominas WHERE id = ?';
        await executeQuery(query, [id]);
    }

    static async obtenerNominasConProblemas() {
        const query = `
            SELECT n.*, 
                   e.codigo_empleado, 
                   u.nombre, 
                   u.apellido,
                   e.departamento
            FROM nominas n
            JOIN empleados e ON n.empleado_id = e.id
            JOIN usuarios u ON e.usuario_id = u.id
            WHERE n.cumplimiento_legal = 0
               OR n.salario_neto < 0
               OR n.estado = 'CANCELADO'
            ORDER BY n.fecha_pago DESC
        `;
        
        return await executeQuery(query);
    }

    static async obtenerResumenAportesPatronales(periodo) {
        const query = `
            SELECT 
                periodo_pago,
                SUM(JSON_EXTRACT(deducciones, '$.inss_patronal')) as total_inss_patronal,
                SUM(JSON_EXTRACT(deducciones, '$.inatec')) as total_inatec,
                COUNT(*) as total_empleados,
                SUM(salario_bruto) as total_salarios_brutos
            FROM nominas
            WHERE periodo_pago = ?
            GROUP BY periodo_pago
        `;
        
        const resultados = await executeQuery(query, [periodo]);
        return resultados[0] || null;
    }
}