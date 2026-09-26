import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'sistema_rrhh'
};

async function seedDatabase() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Conectado a la base de datos');
        console.log('🚀 Iniciando inserción masiva y extendida para el Instituto Dr. Carlos Vega Bolaños...');

        // 1. LIMPIEZA DE TABLAS
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');
        const tablas = [
            'asistencia', 'horarios', 'nominas', 'evaluaciones', 'permisos',
            'empleados_capacitaciones', 'capacitaciones',
            'empleados', 'usuarios', 'roles'
        ];
        for (const tabla of tablas) {
            await connection.query(`TRUNCATE TABLE ${tabla}`);
        }
        await connection.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log('🧹 Base de datos limpia.');

        const hashedPassword = await bcrypt.hash('password123', 10);

        // 2. ROLES
        const roles = [
            { id: 1, nombre: 'ADMIN_RRHH', descripcion: 'Administrador de Recursos Humanos' },
            { id: 2, nombre: 'DIRECTIVO', descripcion: 'Directivo del Instituto' },
            { id: 3, nombre: 'DOCENTE', descripcion: 'Personal Docente' },
            { id: 4, nombre: 'PERSONAL_APOYO', descripcion: 'Personal de Apoyo Administrativo' }
        ];
        for (const role of roles) {
            await connection.execute(`INSERT INTO roles (id, nombre, descripcion) VALUES (?, ?, ?)`, [role.id, role.nombre, role.descripcion]);
        }

        // 3. USUARIOS (Añadidos más docentes)
        const usuarios = [
            { id: 1, email: 'admin@instituto.edu', nombre: 'Carlos', apellido: 'Administrador', telefono: '1234-5678', rol: 1 },
            { id: 2, email: 'director@instituto.edu', nombre: 'María', apellido: 'Directora', telefono: '1234-5679', rol: 2 },
            { id: 3, email: 'profesor@instituto.edu', nombre: 'Juan', apellido: 'Pérez', telefono: '1234-5680', rol: 3 },
            { id: 4, email: 'apoyo@instituto.edu', nombre: 'Ana', apellido: 'García', telefono: '1234-5681', rol: 4 },
            { id: 5, email: 'gabrielrojas@instituto.edu', nombre: 'Gabriel', apellido: 'Rojas', telefono: '1234-5682', rol: 3 },
            { id: 6, email: 'lauramartinez@instituto.edu', nombre: 'Laura', apellido: 'Martínez', telefono: '1234-5683', rol: 3 },
            { id: 7, email: 'robertogomez@instituto.edu', nombre: 'Roberto', apellido: 'Gómez', telefono: '1234-5684', rol: 3 },
            { id: 8, email: 'carmensilva@instituto.edu', nombre: 'Carmen', apellido: 'Silva', telefono: '1234-5685', rol: 3 }
        ];
        for (const u of usuarios) {
            await connection.execute(`INSERT INTO usuarios (id, email, password, nombre, apellido, telefono, rol_id, activo) VALUES (?, ?, ?, ?, ?, ?, ?, 1)`, [u.id, u.email, hashedPassword, u.nombre, u.apellido, u.telefono, u.rol]);
        }

        // 4. EMPLEADOS
        const empleados = [
            { id: 1, cod: 'EMP-001', fecha: '2023-01-15', tipo: 'MEDIO_TIEMPO', sal: 25000.00, depto: 'Recursos Humanos', puesto: 'Administrador de RRHH', uid: 1 },
            { id: 2, cod: 'EMP-002', fecha: '2022-03-10', tipo: 'TIEMPO_COMPLETO', sal: 35000.00, depto: 'Dirección', puesto: 'Directora General', uid: 2 },
            { id: 3, cod: 'EMP-003', fecha: '2023-08-20', tipo: 'TIEMPO_COMPLETO', sal: 18000.00, depto: 'Académico', puesto: 'Profesor de Matemáticas', uid: 3 },
            { id: 4, cod: 'EMP-004', fecha: '2023-05-10', tipo: 'MEDIO_TIEMPO', sal: 12000.00, depto: 'Administración', puesto: 'Asistente Administrativo', uid: 4 },
            { id: 5, cod: 'EMP-005', fecha: '2023-11-08', tipo: 'TIEMPO_COMPLETO', sal: 18000.00, depto: 'Académico', puesto: 'Profesor de Química', uid: 5 },
            { id: 6, cod: 'EMP-006', fecha: '2024-02-15', tipo: 'TIEMPO_COMPLETO', sal: 18000.00, depto: 'Académico', puesto: 'Profesora de Español', uid: 6 },
            { id: 7, cod: 'EMP-007', fecha: '2024-02-15', tipo: 'TIEMPO_COMPLETO', sal: 18000.00, depto: 'Académico', puesto: 'Profesor de Física', uid: 7 },
            { id: 8, cod: 'EMP-008', fecha: '2025-01-10', tipo: 'MEDIO_TIEMPO', sal: 14000.00, depto: 'Académico', puesto: 'Profesora de Inglés', uid: 8 }
        ];
        for (const e of empleados) {
            await connection.execute(`INSERT INTO empleados (id, codigo_empleado, fecha_contratacion, tipo_contrato, salario_base, departamento, puesto, usuario_id, activo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`, [e.id, e.cod, e.fecha, e.tipo, e.sal, e.depto, e.puesto, e.uid]);
        }



        // 6. HORARIOS
        const dias = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES'];
        for (const dia of dias) {
            await connection.execute(`INSERT INTO horarios (empleado_id, dia_semana, hora_entrada, hora_salida, activo) VALUES (1, ?, '08:00:00', '12:00:00', 1)`, [dia]);
            await connection.execute(`INSERT INTO horarios (empleado_id, dia_semana, hora_entrada, hora_salida, activo) VALUES (2, ?, '07:30:00', '16:00:00', 1)`, [dia]);
            // Docentes
            for (let i = 3; i <= 8; i++) {
                await connection.execute(`INSERT INTO horarios (empleado_id, dia_semana, hora_entrada, hora_salida, activo) VALUES (?, ?, '07:00:00', '15:00:00', 1)`, [i, dia]);
            }
        }

        // 7. ASISTENCIAS (Historial más denso reciente)
        const asistencias = [
            { emp: 3, fecha: '2026-08-25', ent: '06:55:00', sal: '15:05:00', tipo: 'NORMAL', just: null },
            { emp: 3, fecha: '2026-08-26', ent: '07:02:00', sal: '15:00:00', tipo: 'NORMAL', just: null },
            { emp: 6, fecha: '2026-08-25', ent: '06:50:00', sal: '15:10:00', tipo: 'NORMAL', just: null },
            { emp: 6, fecha: '2026-08-26', ent: null, sal: null, tipo: 'JUSTIFICADO', just: 'Cita médica' },
            { emp: 7, fecha: '2026-08-25', ent: '07:15:00', sal: '15:00:00', tipo: 'NORMAL', just: 'Retraso por tráfico' },
            { emp: 8, fecha: '2026-09-01', ent: '07:00:00', sal: '12:00:00', tipo: 'NORMAL', just: null },
            { emp: 3, fecha: '2026-09-02', ent: null, sal: null, tipo: 'INASISTENCIA', just: 'Sin reporte' }
        ];
        for (const a of asistencias) {
            await connection.execute(`INSERT INTO asistencia (empleado_id, fecha, hora_entrada, hora_salida, tipo_registro, justificacion) VALUES (?, ?, ?, ?, ?, ?)`, [a.emp, a.fecha, a.ent, a.sal, a.tipo, a.just]);
        }

        // 8. CAPACITACIONES (Nuevas y completadas)
        await connection.execute(`INSERT INTO capacitaciones (id, nombre, descripcion, fecha_inicio, fecha_fin, estado, instructor, ubicacion, duracion_horas) VALUES (1, 'Uso de TICs en el Aula', 'Herramientas digitales básicas', '2025-11-05', '2025-11-10', 'COMPLETADA', 'Externo', 'Laboratorio Computación', 30)`);
        await connection.execute(`INSERT INTO capacitaciones (id, nombre, descripcion, fecha_inicio, fecha_fin, estado, instructor, ubicacion, duracion_horas) VALUES (2, 'Primeros Auxilios', 'Atención de emergencias', '2026-04-15', '2026-04-16', 'COMPLETADA', 'Cruz Roja', 'Cancha Principal', 10)`);
        await connection.execute(`INSERT INTO capacitaciones (id, nombre, descripcion, fecha_inicio, fecha_fin, estado, instructor, ubicacion, duracion_horas) VALUES (3, 'Liderazgo y Gestión Directiva', 'Capacitación para personal directivo', '2026-10-10', '2026-10-14', 'PLANIFICADA', 'Externo', 'Aula Magna', 20)`);

        // Participantes TICs (Completada)
        await connection.execute(`INSERT INTO empleados_capacitaciones (empleado_id, capacitacion_id, progreso, asistio, calificacion) VALUES (3, 1, 100, 1, 95.5)`);
        await connection.execute(`INSERT INTO empleados_capacitaciones (empleado_id, capacitacion_id, progreso, asistio, calificacion) VALUES (5, 1, 100, 1, 88.0)`);
        await connection.execute(`INSERT INTO empleados_capacitaciones (empleado_id, capacitacion_id, progreso, asistio, calificacion) VALUES (6, 1, 100, 1, 100)`);

        // Participantes Primeros Auxilios (Completada)
        await connection.execute(`INSERT INTO empleados_capacitaciones (empleado_id, capacitacion_id, progreso, asistio, calificacion) VALUES (2, 2, 100, 1, 100)`);
        await connection.execute(`INSERT INTO empleados_capacitaciones (empleado_id, capacitacion_id, progreso, asistio, calificacion) VALUES (7, 2, 100, 1, 90.0)`);
        await connection.execute(`INSERT INTO empleados_capacitaciones (empleado_id, capacitacion_id, progreso, asistio, calificacion) VALUES (8, 2, 50, 0, null)`); // No completó

        // 9. EVALUACIONES (Historial más amplio)
        const evals = [
            { empId: 2, periodo: '2025-Q4', fecha: '2025-12-15', puntos: 92.50, com: 'Excelente liderazgo anual' },
            { empId: 3, periodo: '2025-Q4', fecha: '2025-12-16', puntos: 88.00, com: 'Buen manejo de grupo, debe mejorar puntualidad' },
            { empId: 6, periodo: '2025-Q4', fecha: '2025-12-16', puntos: 95.00, com: 'Resultados destacados en literatura' },
            { empId: 7, periodo: '2026-Q1', fecha: '2026-03-20', puntos: 82.00, com: 'Cumple expectativas' },
            { empId: 3, periodo: '2026-Q2', fecha: '2026-06-15', puntos: 90.00, com: 'Mejora notable en puntualidad' },
            { empId: 8, periodo: '2026-Q2', fecha: '2026-06-15', puntos: 89.50, com: 'Buena integración al equipo docente' }
        ];
        for (const ev of evals) {
            await connection.execute(`INSERT INTO evaluaciones (empleado_id, evaluador_id, periodo_evaluacion, fecha_evaluacion, criterios, puntuacion_total, comentarios) VALUES (?, 2, ?, ?, '{"puntualidad": 8, "calidad_trabajo": 9}', ?, ?)`, [ev.empId, ev.periodo, ev.fecha, ev.puntos, ev.com]);
        }

        // 10. NÓMINAS (Generación automatizada desde Enero 2025 hasta Agosto 2026)
        console.log('💰 Generando historial de nóminas (Ene 2025 - Ago 2026)...');
        const años = [2025, 2026];

        for (const año of años) {
            const limiteMes = año === 2026 ? 8 : 12; // Hasta Agosto de 2026
            for (let mes = 1; mes <= limiteMes; mes++) {
                const periodo = `${año}-${String(mes).padStart(2, '0')}`;
                const fechaPago = `${año}-${String(mes).padStart(2, '0')}-28`;

                for (const emp of empleados) {
                    // Evitar pagar a empleados antes de su fecha de contratación
                    const fechaContrato = new Date(emp.fecha);
                    const fechaNomina = new Date(`${año}-${String(mes).padStart(2, '0')}-01`);
                    if (fechaContrato > fechaNomina) continue;

                    // Cálculos estándar de Nicaragua (Inss 6.25%, Patronal 15.5%, Inatec 2%) - Aproximado
                    const inss = emp.sal * 0.0625;
                    const ir = emp.sal > 20000 ? (emp.sal * 0.10) : 0; // Simplificado
                    const neto = emp.sal - inss - ir;
                    const inssPatronal = emp.sal * 0.155;
                    const inatec = emp.sal * 0.02;
                    const deduccionesJSON = JSON.stringify({ inss: inss.toFixed(2), ir: ir.toFixed(2) });

                    await connection.execute(
                        `INSERT INTO nominas (empleado_id, codigo_empleado, periodo_pago, fecha_pago, salario_bruto, deducciones, salario_neto, estado, horas_trabajadas, horas_extras, inss_patronal, inatec, salario_minimo_sector, cumplimiento_legal) VALUES (?, ?, ?, ?, ?, ?, ?, 'PAGADO', 160, 0, ?, ?, 8000.00, 1)`,
                        [emp.id, emp.cod, periodo, fechaPago, emp.sal, deduccionesJSON, neto, inssPatronal, inatec]
                    );
                }
            }
        }

        console.log('✅ Todos los datos vinculados se insertaron correctamente. Nóminas generadas hasta la fecha actual.');

    } catch (error) {
        console.error('❌ Error en el seed:', error);
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 Conexión cerrada.');
        }
    }
}

seedDatabase();