import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL 
  ? (import.meta.env.VITE_API_BASE_URL.endsWith('/api') ? import.meta.env.VITE_API_BASE_URL : `${import.meta.env.VITE_API_BASE_URL}/api`)
  : (import.meta.env.PROD ? '/api' : 'http://localhost:3001/api');

// Configuración mejorada de axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor mejorado para manejo de errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      
      const currentPath = window.location.pathname;
      if (currentPath !== '/login') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }

    const errorMessage = getErrorMessage(error);
    console.error('Error en petición API:', errorMessage);

    return Promise.reject({
      message: errorMessage,
      status: error.response?.status,
      code: error.code,
      data: error.response?.data,
      response: error.response 
    });
  }
);
// Función auxiliar para mensajes de error
const getErrorMessage = (error) => {
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.code === 'NETWORK_ERROR') {
    return 'Error de conexión. Verifique su internet.';
  }
  if (error.code === 'TIMEOUT_ERROR') {
    return 'Tiempo de espera agotado. Intente nuevamente.';
  }
  if (error.message) {
    return error.message;
  }
  return 'Error interno del sistema. Contacte al administrador.';
};

// Validador de fechas
const validateDates = (fechaInicio, fechaFin) => {
  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  if (inicio > fin) {
    return 'La fecha de inicio no puede ser posterior a la fecha fin';
  }
  if (inicio < hoy) {
    return 'La fecha de inicio no puede ser anterior al día actual';
  }
  return null;
};

// Validador de progreso
const validateProgress = (progreso) => {
  if (progreso < 0 || progreso > 100) {
    return 'El progreso debe estar entre 0 y 100';
  }
  return null;
};

// Validador de email
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'El email debe tener un formato válido';
  }
  return null;
};
// Servicio de autenticación
export const authService = {
  login: async (email, password) => {
    // CORRECCIÓN: Mejorar validación de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      
      const error = new Error('El formato del email es inválido');
      error.response = {
        status: 400,
        data: { error: 'El formato del email es inválido' }
      };
      throw error;
    }

    if (!email || !password) {
      const error = new Error('Email y contraseña son requeridos');
      error.response = {
        status: 400,
        data: { error: 'Email y contraseña son requeridos' }
      };
      throw error;
    }

    if (password.length < 1) {
      const error = new Error('La contraseña es requerida');
      error.response = {
        status: 400,
        data: { error: 'La contraseña es requerida' }
      };
      throw error;
    }

    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  register: async (userData) => {
    const emailError = validateEmail(userData.email);
    if (emailError) {
      throw new Error(emailError);
    }

    if (!userData.password || userData.password.length < 8) {
      throw new Error('La contraseña debe tener al menos 8 caracteres');
    }

    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Error al registrar usuario');
    }
  },

  getProfile: async () => {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Error al obtener perfil');
    }
  },

  forgotPassword: async (email) => {
    const emailError = validateEmail(email);
    if (emailError) {
      throw new Error(emailError);
    }

    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Error al solicitar recuperación');
    }
  },

  resetPassword: async (data) => {
    if (!data.token || !data.password) {
      throw new Error('Token y nueva contraseña son requeridos');
    }

    if (data.password.length < 8) {
      throw new Error('La nueva contraseña debe tener al menos 8 caracteres');
    }

    try {
      const response = await api.post('/auth/reset-password', data);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Error al restablecer contraseña');
    }
  },

  changePassword: async (data) => {
    if (!data.currentPassword || !data.newPassword) {
      throw new Error('Contraseña actual y nueva contraseña son requeridas');
    }

    if (data.newPassword.length < 8) {
      throw new Error('La nueva contraseña debe tener al menos 8 caracteres');
    }

    try {
      const response = await api.post('/auth/change-password', data);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Error al cambiar contraseña');
    }
  },

  validateResetToken: async (token) => {
    if (!token) {
      throw new Error('Token es requerido');
    }

    try {
      const response = await api.get(`/auth/validate-reset-token/${token}`);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Error al validar token');
    }
  },

  getRoles: async () => {
    try {
      const response = await api.get('/auth/roles');
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Error al obtener roles');
    }
  },

  getUsers: async () => {
    try {
      const response = await api.get('/auth/users');
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Error al obtener usuarios');
    }
  }
};

// Servicio de empleados
export const empleadosService = {
  getAll: async () => {
    try {
      const response = await api.get('/empleados');
      return response.data;
    } catch (error) {
      throw new Error(`Error al obtener empleados: ${error.message}`);
    }
  },

  getById: async (id) => {
    if (!id) throw new Error('ID de empleado es requerido');

    try {
      const response = await api.get(`/empleados/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(`Error al obtener empleado: ${error.message}`);
    }
  },

  create: async (data) => {
    if (!data.codigo_empleado || !data.puesto || !data.departamento) {
      throw new Error('Código, puesto y departamento son requeridos');
    }

    if (!data.salario_base || data.salario_base < 0) {
      throw new Error('Salario base debe ser un número positivo');
    }

    try {
      const response = await api.post('/empleados', data);
      return response.data;
    } catch (error) {
      throw new Error(`Error al crear empleado: ${error.message}`);
    }
  },

  update: async (id, data) => {
    if (!id) throw new Error('ID de empleado es requerido');

    try {
      const response = await api.put(`/empleados/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error(`Error al actualizar empleado: ${error.message}`);
    }
  },

  getMiPerfil: async () => {
    try {
      const response = await api.get('/empleados/mi-perfil');
      return response.data;
    } catch (error) {
      throw new Error(`Error al obtener perfil: ${error.message}`);
    }
  }
};

// Servicio de capacitaciones (CORREGIDO)
export const capacitacionesService = {
  // Obtener todas las capacitaciones
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/capacitaciones', { params });
      return response.data;
    } catch (error) {
      throw new Error(`Error al obtener capacitaciones: ${error.response?.data?.error || error.message}`);
    }
  },

  // Obtener capacitación por ID (CORREGIDO)
  getById: async (id) => {
    if (!id || isNaN(id)) throw new Error('ID de capacitación válido es requerido');

    try {
      const response = await api.get(`/capacitaciones/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(`Error al obtener capacitación: ${error.response?.data?.error || error.message}`);
    }
  },

  // Crear nueva capacitación
  create: async (data) => {
    try {
      const response = await api.post('/capacitaciones', data);
      return response.data;
    } catch (error) {
      throw new Error(`Error al crear capacitación: ${error.response?.data?.error || error.message}`);
    }
  },

  // Actualizar capacitación (CORREGIDO)
  update: async (id, data) => {
    if (!id || isNaN(id)) throw new Error('ID de capacitación válido es requerido');

    try {
      const response = await api.put(`/capacitaciones/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error(`Error al actualizar capacitación: ${error.response?.data?.error || error.message}`);
    }
  },

  // Eliminar capacitación (CORREGIDO)
  delete: async (id) => {
    if (!id || isNaN(id)) throw new Error('ID de capacitación válido es requerido');

    try {
      const response = await api.delete(`/capacitaciones/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(`Error al eliminar capacitación: ${error.response?.data?.error || error.message}`);
    }
  },

  // Asignar empleados (CORREGIDO)
  asignarEmpleados: async (id, data) => {
    if (!id || isNaN(id)) throw new Error('ID de capacitación válido es requerido');

    try {
      const response = await api.post(`/capacitaciones/${id}/asignar`, data);
      return response.data;
    } catch (error) {
      throw new Error(`Error al asignar empleados: ${error.response?.data?.error || error.message}`);
    }
  },

  // Desasignar empleado (CORREGIDO)
  desasignarEmpleado: async (id, empleadoId) => {
    if (!id || isNaN(id) || !empleadoId || isNaN(empleadoId)) {
      throw new Error('ID de capacitación y empleado válidos son requeridos');
    }

    try {
      const response = await api.delete(`/capacitaciones/${id}/empleados/${empleadoId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Error al desasignar empleado: ${error.response?.data?.error || error.message}`);
    }
  },

  // Actualizar progreso (CORREGIDO - CONVERSIÓN EXPLÍCITA A BOOLEAN)
  actualizarProgreso: async (id, empleadoId, data) => {
    if (!id || isNaN(id) || !empleadoId || isNaN(empleadoId)) {
      throw new Error('ID de capacitación y empleado válidos son requeridos');
    }

    // CORRECCIÓN: Convertir explícitamente asistio a boolean
    const datosCorregidos = {
      ...data,
      asistio: data.asistio === true || data.asistio === 'true' // Convierte a boolean
    };

    try {
      const response = await api.put(
        `/capacitaciones/${id}/empleados/${empleadoId}/progreso`,
        datosCorregidos // Usar datos corregidos
      );
      return response.data;
    } catch (error) {
      throw new Error(`Error al actualizar progreso: ${error.response?.data?.error || error.message}`);
    }
  },


  // Obtener mis capacitaciones
  getMisCapacitaciones: async () => {
    try {
      const response = await api.get('/capacitaciones/mis-capacitaciones');
      return response.data;
    } catch (error) {
      throw new Error(`Error al obtener mis capacitaciones: ${error.response?.data?.error || error.message}`);
    }
  },

  // Obtener estadísticas
  getEstadisticas: async () => {
    try {
      const response = await api.get('/capacitaciones/estadisticas');
      return response.data;
    } catch (error) {
      throw new Error(`Error al obtener estadísticas: ${error.response?.data?.error || error.message}`);
    }
  },

  // Obtener capacitaciones próximas (NUEVO)
  getProximas: async (dias = 7) => {
    try {
      const response = await api.get('/capacitaciones/proximas', { params: { dias } });
      return response.data;
    } catch (error) {
      throw new Error(`Error al obtener capacitaciones próximas: ${error.response?.data?.error || error.message}`);
    }
  },

  // Obtener reporte de participación (NUEVO)
  getReporteParticipacion: async () => {
    try {
      const response = await api.get('/capacitaciones/reporte-participacion');
      return response.data;
    } catch (error) {
      throw new Error(`Error al obtener reporte de participación: ${error.response?.data?.error || error.message}`);
    }
  }
};

export const validateCapacitacion = (data, isEdit = false) => {
  const errors = {};

  if (!data.nombre || data.nombre.length < 3) {
    errors.nombre = 'El nombre debe tener al menos 3 caracteres';
  }

  if (!data.descripcion || data.descripcion.length < 10) {
    errors.descripcion = 'La descripción debe tener al menos 10 caracteres';
  }

  if (!data.fecha_inicio) {
    errors.fecha_inicio = 'La fecha de inicio es requerida';
  }

  if (!data.fecha_fin) {
    errors.fecha_fin = 'La fecha de fin es requerida';
  }

  if (data.fecha_inicio && data.fecha_fin) {
    const inicio = new Date(data.fecha_inicio);
    const fin = new Date(data.fecha_fin);

    if (inicio >= fin) {
      errors.fecha_fin = 'La fecha de fin debe ser posterior a la fecha de inicio';
    }

    // Solo validar fecha futura para creación, no para edición
    if (!isEdit && inicio < new Date()) {
      errors.fecha_inicio = 'La fecha de inicio debe ser futura';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Servicio de horarios
export const horariosService = {
  getByEmpleado: async (empleadoId) => {
    if (!empleadoId) throw new Error('ID de empleado es requerido');

    try {
      const response = await api.get(`/horarios/empleado/${empleadoId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Error al obtener horarios: ${error.message}`);
    }
  },

  getMisHorarios: async () => {
    try {
      const response = await api.get('/horarios/mis-horarios');
      return response.data;
    } catch (error) {
      throw new Error(`Error al obtener mis horarios: ${error.message}`);
    }
  },

  guardarHorarios: async (empleadoId, horarios) => {
    if (!empleadoId) throw new Error('ID de empleado es requerido');
    if (!horarios || !Array.isArray(horarios)) {
      throw new Error('Los horarios deben ser un array válido');
    }

    try {
      const response = await api.post(`/horarios/empleado/${empleadoId}`, { horarios });
      return response.data;
    } catch (error) {
      throw new Error(`Error al guardar horarios: ${error.message}`);
    }
  },

  validarDisponibilidad: async (empleadoId, horarios) => {
    if (!empleadoId) throw new Error('ID de empleado es requerido');

    try {
      const response = await api.post(`/horarios/validar-disponibilidad`, { empleadoId, horarios });
      return response.data;
    } catch (error) {
      throw new Error(`Error al validar disponibilidad: ${error.message}`);
    }
  },

  getAll: async (params) => {
    try {
      const response = await api.get('/horarios', { params });
      return response.data;
    } catch (error) {
      throw new Error(`Error al obtener horarios: ${error.message}`);
    }
  }
};

// Servicio de permisos
export const permisosService = {
  solicitar: async (data) => {
    if (!data.tipo_permiso || !data.fecha_inicio || !data.fecha_fin || !data.motivo) {
      throw new Error('Todos los campos son requeridos');
    }

    const inicio = new Date(data.fecha_inicio);
    const fin = new Date(data.fecha_fin);
    if (inicio > fin) {
      throw new Error('La fecha de inicio no puede ser posterior a la fecha fin');
    }

    try {
      const response = await api.post('/permisos/solicitar', data);
      return response.data;
    } catch (error) {
      throw new Error(`Error al solicitar permiso: ${error.message}`);
    }
  },

  getMisPermisos: async () => {
    try {
      const response = await api.get('/permisos/mis-permisos');
      return response.data;
    } catch (error) {
      throw new Error(`Error al obtener mis permisos: ${error.message}`);
    }
  },

  getPendientes: async () => {
    try {
      const response = await api.get('/permisos/pendientes');
      return response.data;
    } catch (error) {
      throw new Error(`Error al obtener permisos pendientes: ${error.message}`);
    }
  },

  getAll: async (params) => {
    try {
      const response = await api.get('/permisos', { params });
      return response.data;
    } catch (error) {
      throw new Error(`Error al obtener permisos: ${error.message}`);
    }
  },

  aprobarRechazar: async (id, data) => {
    if (!id) throw new Error('ID de permiso es requerido');
    if (!data.estado) throw new Error('Estado es requerido');

    try {
      const response = await api.put(`/permisos/${id}/aprobar`, data);
      return response.data;
    } catch (error) {
      throw new Error(`Error al actualizar permiso: ${error.message}`);
    }
  }
};

// Servicio de evaluaciones
export const evaluacionesService = {
  crear: async (data) => {
    if (!data.empleado_id || !data.periodo_evaluacion || !data.criterios) {
      throw new Error('Empleado, periodo y criterios son requeridos');
    }

    try {
      const response = await api.post('/evaluaciones', data);
      return response.data;
    } catch (error) {
      throw new Error(`Error al crear evaluación: ${error.message}`);
    }
  },

  getMisEvaluaciones: async () => {
    try {
      const response = await api.get('/evaluaciones/mis-evaluaciones');
      return response.data;
    } catch (error) {
      throw new Error(`Error al obtener mis evaluaciones: ${error.message}`);
    }
  },

  getRealizadas: async () => {
    try {
      const response = await api.get('/evaluaciones/realizadas');
      return response.data;
    } catch (error) {
      throw new Error(`Error al obtener evaluaciones realizadas: ${error.message}`);
    }
  },

  getAll: async (params) => {
    try {
      const response = await api.get('/evaluaciones', { params });
      return response.data;
    } catch (error) {
      throw new Error(`Error al obtener evaluaciones: ${error.message}`);
    }
  },

  update: async (id, data) => {
    if (!id) throw new Error('ID de evaluación es requerido');

    try {
      const response = await api.put(`/evaluaciones/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error(`Error al actualizar evaluación: ${error.message}`);
    }
  }
};

// Servicio de nóminas
export const nominasService = {
  getMisNominas: async () => {
    try {
      const response = await api.get('/nominas/mis-nominas');
      return response.data;
    } catch (error) {
      throw new Error(`Error al obtener mis nóminas: ${error.message}`);
    }
  },

  getAll: async (params) => {
    try {
      const response = await api.get('/nominas', { params });
      return response.data;
    } catch (error) {
      throw new Error(`Error al obtener nóminas: ${error.message}`);
    }
  },

  generar: async (data) => {
    if (!data.periodo_pago || (!data.empleado_id && !data.empleados)) {
      throw new Error('Periodo y empleado son requeridos');
    }

    try {
      const response = await api.post('/nominas', data);
      return response.data;
    } catch (error) {
      throw new Error(`Error al generar nómina: ${error.message}`);
    }
  },

  getResumen: async (periodo) => {
    if (!periodo) throw new Error('Periodo es requerido');

    try {
      const response = await api.get(`/nominas/resumen/${periodo}`);
      return response.data;
    } catch (error) {
      throw new Error(`Error al obtener resumen: ${error.message}`);
    }
  },

  actualizarEstado: async (id, data) => {
    if (!id) throw new Error('ID de nómina es requerido');
    if (!data.estado) throw new Error('Estado es requerido');

    try {
      const response = await api.put(`/nominas/${id}/estado`, data);
      return response.data;
    } catch (error) {
      throw new Error(`Error al actualizar estado: ${error.message}`);
    }
  },

  calcularDeducciones: async (salarioBruto) => {
    if (!salarioBruto || salarioBruto < 0) {
      throw new Error('Salario bruto debe ser un número positivo');
    }

    try {
      const response = await api.post('/nominas/calcular-deducciones', { salario_bruto: salarioBruto });
      return response.data;
    } catch (error) {
      throw new Error(`Error al calcular deducciones: ${error.message}`);
    }
  },

  getTasasActuales: async () => {
    try {
      const response = await api.get('/nominas/tasas-actuales');
      return response.data;
    } catch (error) {
      throw new Error(`Error al obtener tasas: ${error.message}`);
    }
  },

  validarNomina: async (data) => {
    try {
      const response = await api.post('/nominas/validar', data);
      return response.data;
    } catch (error) {
      throw new Error(`Error al validar nómina: ${error.message}`);
    }
  },

  generarReporteLegal: async (periodo) => {
    if (!periodo) throw new Error('Periodo es requerido');

    try {
      const response = await api.get(`/nominas/reporte-legal/${periodo}`);
      return response.data;
    } catch (error) {
      throw new Error(`Error al generar reporte legal: ${error.message}`);
    }
  },

  getEstadisticas: async () => {
    try {
      const response = await api.get('/nominas/estadisticas/generales');
      return response.data;
    } catch (error) {
      throw new Error(`Error al obtener estadísticas: ${error.message}`);
    }
  }
};

// Servicio de asistencia
export const asistenciaService = {
  registrar: async (data) => {
    if (!data.empleado_id || !data.fecha) {
      throw new Error('Empleado y fecha son requeridos');
    }

    try {
      const response = await api.post('/asistencia/registrar', data);
      return response.data;
    } catch (error) {
      throw new Error(`Error al registrar asistencia: ${error.message}`);
    }
  },

  getMiAsistencia: async (params) => {
    try {
      const response = await api.get('/asistencia/mi-asistencia', { params });
      return response.data;
    } catch (error) {
      throw new Error(`Error al obtener mi asistencia: ${error.message}`);
    }
  },

  justificar: async (id, data) => {
    if (!id) throw new Error('ID de asistencia es requerido');
    if (!data.justificacion) throw new Error('Justificación es requerida');

    try {
      const response = await api.put(`/asistencia/${id}/justificar`, data);
      return response.data;
    } catch (error) {
      throw new Error(`Error al justificar asistencia: ${error.message}`);
    }
  },

  getReporte: async (params) => {
    try {
      const response = await api.get('/asistencia/reporte', { params });
      return response.data;
    } catch (error) {
      throw new Error(`Error al obtener reporte: ${error.message}`);
    }
  },

  getMiInformacion: async () => {
    try {
      const response = await api.get('/empleados/mi-perfil');
      return response.data;
    } catch (error) {
      throw new Error(`Error al obtener mi información: ${error.message}`);
    }
  }
};

// Servicio de reportes
export const reportesService = {
  getDashboard: async () => {
    try {
      const response = await api.get('/reportes/dashboard');
      return response.data;
    } catch (error) {
      throw new Error(`Error al obtener dashboard: ${error.message}`);
    }
  },

  getReporteAsistencia: async (params) => {
    try {
      const response = await api.get('/reportes/asistencia', { params });
      return response.data;
    } catch (error) {
      throw new Error(`Error al obtener reporte de asistencia: ${error.message}`);
    }
  },

  getReporteNomina: async (params) => {
    try {
      const response = await api.get('/reportes/nomina', { params });
      return response.data;
    } catch (error) {
      throw new Error(`Error al obtener reporte de nómina: ${error.message}`);
    }
  },

  getReporteDesempeno: async (params) => {
    try {
      const response = await api.get('/reportes/desempeno', { params });
      return response.data;
    } catch (error) {
      throw new Error(`Error al obtener reporte de desempeño: ${error.message}`);
    }
  }
};

// Servicio de Demostración
export const demoService = {
  getDemoRoles: async () => {
    try {
      const response = await api.get('/demo/roles');
      return response.data;
    } catch (error) {
      console.warn('Usando roles demo de respaldo local:', error);
      // Fallback local si el servidor no responde
      return {
        success: true,
        data: [
          {
            roleKey: 'ADMIN_RRHH',
            roleName: 'Administrador de RRHH',
            user: { nombre: 'Carlos', apellido: 'Administrador', email: 'admin@instituto.edu', puesto: 'Administrador de RRHH', departamento: 'Recursos Humanos' },
            badgeColor: '#1976d2',
            description: 'Acceso total a la gestión del personal, nóminas, asistencias, reportes, capacitaciones y expedientes.',
            highlights: ['Gestión integral de empleados', 'Cálculo de nóminas con leyes laborales', 'Aprobaciones y reportes ejecutivos']
          },
          {
            roleKey: 'DIRECTIVO',
            roleName: 'Directivo / Dirección',
            user: { nombre: 'María', apellido: 'Directora', email: 'director@instituto.edu', puesto: 'Directora General', departamento: 'Dirección' },
            badgeColor: '#7b1fa2',
            description: 'Supervisión ejecutiva, aprobación estratégica de solicitudes, reportes de desempeño y evaluaciones.',
            highlights: ['Aprobación/Rechazo de solicitudes', 'Evaluación de desempeño global', 'Dashboard directivo']
          },
          {
            roleKey: 'DOCENTE',
            roleName: 'Personal Docente (Profesor)',
            user: { nombre: 'Juan', apellido: 'Pérez', email: 'profesor@instituto.edu', puesto: 'Profesor de Matemáticas', departamento: 'Académico' },
            badgeColor: '#2e7d32',
            description: 'Portal de autoservicio: registro de asistencia, consulta de nóminas y capacitaciones.',
            highlights: ['Marcaje de asistencia diaria', 'Consulta de recibos de pago', 'Inscripción a capacitaciones']
          },
          {
            roleKey: 'PERSONAL_APOYO',
            roleName: 'Personal de Apoyo Administrativo',
            user: { nombre: 'Ana', apellido: 'García', email: 'apoyo@instituto.edu', puesto: 'Asistente Administrativo', departamento: 'Administración' },
            badgeColor: '#ed6c02',
            description: 'Perfil de asistencia administrativa, consulta de horarios personales y registro de actividades.',
            highlights: ['Consulta de turnos y horarios', 'Marcaje y solicitudes de permisos']
          }
        ]
      };
    }
  },

  resetDemo: async () => {
    try {
      const response = await api.post('/demo/reset');
      return response.data;
    } catch (error) {
      console.error('Error al resetear datos demo en el backend:', error);
      return { success: false, error: error.message };
    }
  }
};

// Exportar utilidades y api
export {
  api,
  getErrorMessage,
  validateDates,
  validateProgress,
  validateEmail
};