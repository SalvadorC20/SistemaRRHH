import Joi from 'joi';

export const validarCapacitacion = (req, res, next) => {
  const schema = Joi.object({
    nombre: Joi.string().min(3).max(200).required().messages({
      'string.min': 'El nombre debe tener al menos 3 caracteres',
      'string.max': 'El nombre no puede exceder los 200 caracteres',
      'any.required': 'El nombre es requerido'
    }),
    descripcion: Joi.string().min(10).max(1000).required().messages({
      'string.min': 'La descripción debe tener al menos 10 caracteres',
      'string.max': 'La descripción no puede exceder los 1000 caracteres',
      'any.required': 'La descripción es requerida'
    }),
    fecha_inicio: Joi.date().required().messages({ // QUITAR .min('now')
      'any.required': 'La fecha de inicio es requerida'
    }),
    fecha_fin: Joi.date().min(Joi.ref('fecha_inicio')).required().messages({
      'date.min': 'La fecha de fin debe ser posterior a la fecha de inicio',
      'any.required': 'La fecha de fin es requerida'
    }),
    estado: Joi.string().valid('PLANIFICADA', 'EN_CURSO', 'COMPLETADA', 'CANCELADA')
      .optional().default('PLANIFICADA'),
    instructor: Joi.string().max(100).optional().allow(''),
    ubicacion: Joi.string().max(200).optional().allow(''),
    duracion_horas: Joi.number().min(1).max(1000).optional(),
    material_url: Joi.string().uri().optional().allow('')
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      success: false, 
      error: error.details[0].message 
    });
  }

  next();
};

export const validarAsignacionEmpleados = (req, res, next) => {
  const schema = Joi.object({
    empleados: Joi.array().items(
      Joi.number().integer().min(1)
    ).min(1).required().messages({
      'array.min': 'Debe seleccionar al menos un empleado',
      'any.required': 'La lista de empleados es requerida'
    }),
    notificar: Joi.boolean().optional().default(false)
    // QUITAR: id: Joi.any().forbidden() - esto no es necesario
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      success: false, 
      error: error.details[0].message 
    });
  }

  next();
};

export const validarProgreso = (req, res, next) => {
  const schema = Joi.object({
    progreso: Joi.number().min(0).max(100).optional(),
    asistio: Joi.boolean().optional(),
    calificacion: Joi.number().min(0).max(100).optional().allow(null)
  }).or('progreso', 'asistio', 'calificacion').messages({
    'object.missing': 'Debe proporcionar al menos un campo para actualizar'
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      success: false, 
      error: error.details[0].message 
    });
  }

  next();
};

export const validarActualizacionCapacitacion = (req, res, next) => {
  const schema = Joi.object({
    nombre: Joi.string().min(3).max(200).optional(),
    descripcion: Joi.string().min(10).max(1000).optional(),
    fecha_inicio: Joi.date().optional(),
    fecha_fin: Joi.date().min(Joi.ref('fecha_inicio')).optional().messages({
      'date.min': 'La fecha de fin debe ser posterior a la fecha de inicio'
    }),
    estado: Joi.string().valid('PLANIFICADA', 'EN_CURSO', 'COMPLETADA', 'CANCELADA').optional(),
    instructor: Joi.string().max(100).optional().allow(''),
    ubicacion: Joi.string().max(200).optional().allow(''),
    duracion_horas: Joi.number().min(1).max(1000).optional()
  }).min(1).messages({
    'object.min': 'Debe proporcionar al menos un campo para actualizar'
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      success: false, 
      error: error.details[0].message 
    });
  }

  next();
};

// Validador para parámetros de ID
export const validarIdCapacitacion = (req, res, next) => {
  const { id } = req.params;
  const idNum = parseInt(id);
  
  if (isNaN(idNum) || idNum <= 0) {
    return res.status(400).json({
      success: false,
      error: 'ID de capacitación inválido'
    });
  }
  
  next();
};