import Joi from 'joi';

export const validarRegistro = (req, res, next) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(8).required(),
        nombre: Joi.string().min(2).max(100).required(),
        apellido: Joi.string().min(2).max(100).required(),
        telefono: Joi.string().pattern(/^[0-9-+() ]+$/).optional().allow(''),
        rol_id: Joi.number().integer().min(1).required()
    });

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ success: false, error: error.details[0].message });

    next();
};

export const validarLogin = (req, res, next) => {
    const schema = Joi.object({
        email: Joi.string()
            .email({ tlds: { allow: false } })
            .required()
            .messages({
                'string.email': 'Email inválido',
                'string.empty': 'El email es obligatorio',
                'any.required': 'El email es obligatorio'
            }),

        password: Joi.string()
            .required()
            .messages({
                'string.empty': 'La contraseña es obligatoria',
                'any.required': 'La contraseña es obligatoria'
            })
    });

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ success: false, error: error.details[0].message });

    next();
};

