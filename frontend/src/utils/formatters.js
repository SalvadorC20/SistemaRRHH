export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '-';
  const num = typeof amount === 'number' ? amount : parseFloat(amount);
  if (isNaN(num)) return '-';
  return new Intl.NumberFormat('es-NI', {
    style: 'currency',
    currency: 'NIO'
  }).format(num);
};

export const formatDate = (dateString) => {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleDateString('es-NI');
  } catch (error) {
    return 'Fecha inválida';
  }
};

export const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleString('es-NI');
  } catch (error) {
    return 'Fecha inválida';
  }
};

export const getStatusColor = (status) => {
  const colors = {
    PENDIENTE: 'warning',
    APROBADO: 'success',
    RECHAZADO: 'error',
    ACTIVO: 'success',
    INACTIVO: 'error',
    PLANIFICADA: 'info',
    EN_CURSO: 'warning',
    COMPLETADA: 'success',
    CANCELADA: 'error',
    FINALIZADA: 'success'
  };
  return colors[status] || 'default';
};

export const getProgressColor = (progress) => {
  if (progress >= 90) return 'success';
  if (progress >= 70) return 'warning';
  if (progress >= 50) return 'info';
  return 'error';
};

export const getProgressLabel = (progress) => {
  if (progress >= 90) return 'Excelente';
  if (progress >= 70) return 'Bueno';
  if (progress >= 50) return 'En progreso';
  if (progress >= 25) return 'Comenzado';
  return 'Sin iniciar';
};

export const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const calculateDaysBetween = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
    
    const differenceMs = end.getTime() - start.getTime();
    const days = Math.ceil(differenceMs / (1000 * 60 * 60 * 24)) + 1;
    
    return Math.max(0, days);
  } catch (error) {
    return 0;
  }
};

export const getDaysUntil = (targetDate) => {
  if (!targetDate) return null;
  
  try {
    const target = new Date(targetDate);
    const today = new Date();
    
    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);
    
    const differenceMs = target.getTime() - today.getTime();
    const days = Math.ceil(differenceMs / (1000 * 60 * 60 * 24));
    
    return days;
  } catch (error) {
    return null;
  }
};

export const formatDaysUntil = (days) => {
  if (days === 0) return 'Hoy';
  if (days === 1) return 'Mañana';
  if (days > 1) return `En ${days} días`;
  if (days === -1) return 'Ayer';
  if (days < -1) return `Hace ${Math.abs(days)} días`;
  return 'Fecha inválida';
};

// Nueva función para validar estado de capacitación
export const getEstadoCapacitacion = (fechaInicio, fechaFin) => {
  if (!fechaInicio || !fechaFin) return 'PLANIFICADA';
  
  try {
    const hoy = new Date();
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    
    if (hoy < inicio) return 'PLANIFICADA';
    if (hoy >= inicio && hoy <= fin) return 'EN_CURSO';
    if (hoy > fin) return 'COMPLETADA';
    
    return 'PLANIFICADA';
  } catch (error) {
    return 'PLANIFICADA';
  }

  
};

export const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  } catch (error) {
    return '';
  }
};