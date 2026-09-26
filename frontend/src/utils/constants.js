export const ROLES = {
  ADMIN_RRHH: 'ADMIN_RRHH',
  DIRECTIVO: 'DIRECTIVO',
  DOCENTE: 'DOCENTE',
  PERSONAL_APOYO: 'PERSONAL_APOYO'
};

export const TIPOS_CONTRATO = [
  { value: 'TIEMPO_COMPLETO', label: 'Tiempo Completo' },
  { value: 'MEDIO_TIEMPO', label: 'Medio Tiempo' },
  { value: 'TEMPORAL', label: 'Temporal' }
];

export const TIPOS_PERMISO = [
  { value: 'VACACIONES', label: 'Vacaciones' },
  { value: 'ENFERMEDAD', label: 'Enfermedad' },
  { value: 'PERSONAL', label: 'Personal' },
  { value: 'MATERNIDAD', label: 'Maternidad' },
  { value: 'PATERNIDAD', label: 'Paternidad' }
];

export const ESTADOS_PERMISO = {
  PENDIENTE: 'PENDIENTE',
  APROBADO: 'APROBADO',
  RECHAZADO: 'RECHAZADO'
};

export const ESTADOS_CAPACITACION = {
  PLANIFICADA: 'Planificada',
  EN_CURSO: 'En Curso',
  COMPLETADA: 'Completada',
  CANCELADA: 'Cancelada'
};