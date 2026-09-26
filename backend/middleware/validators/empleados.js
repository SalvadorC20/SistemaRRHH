import Joi from 'joi';

export const validarEmpleado = (req, res, next) => {
    const schema = Joi.object({
        codigo_empleado: Joi.string().min(3).max(20).required(),
        fecha_contratacion: Joi.date().max('now').required(),
        tipo_contrato: Joi.string().valid('TIEMPO_COMPLETO', 'MEDIO_TIEMPO', 'TEMPORAL').required(),
        salario_base: Joi.number().min(0).max(1000000).required(),
        departamento: Joi.string().min(2).max(100).required(),
        puesto: Joi.string().min(2).max(100).required(),
        usuario_id: Joi.number().integer().min(1).required(),
        activo: Joi.boolean().optional().default(true)
    });

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ success: false, error: error.details[0].message });

    next();
};

