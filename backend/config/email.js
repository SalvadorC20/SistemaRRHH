import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

export const sendPasswordResetEmail = async (email, token) => {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
    
    const mailOptions = {
        from: `"Sistema RRHH - Instituto Dr. Carlos Vega Bolaños" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Restablecimiento de Contraseña',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #0A3D62 0%, #3C6382 100%); padding: 30px; text-align: center; color: white;">
                    <h1 style="margin: 0;">Sistema de Recursos Humanos</h1>
                    <p style="margin: 10px 0 0 0; opacity: 0.9;">Instituto Dr. Carlos Vega Bolaños</p>
                </div>
                
                <div style="padding: 30px; background: #f9fafb;">
                    <h2 style="color: #0A3D62;">Restablecer Contraseña</h2>
                    <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta.</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" 
                           style="background: linear-gradient(135deg, #0A3D62 0%, #3C6382 100%); 
                                  color: white; 
                                  padding: 12px 30px; 
                                  text-decoration: none; 
                                  border-radius: 5px; 
                                  font-weight: bold;
                                  display: inline-block;">
                            Restablecer Contraseña
                        </a>
                    </div>
                    
                    <p style="color: #666; font-size: 14px;">
                        <strong>¿No solicitaste este cambio?</strong><br>
                        Si no solicitaste restablecer tu contraseña, puedes ignorar este mensaje.
                    </p>
                    
                    <p style="color: #999; font-size: 12px; margin-top: 30px;">
                        Este enlace expirará en 1 hora.<br>
                        Si tienes problemas, copia y pega esta URL en tu navegador:<br>
                        <span style="color: #0A3D62;">${resetUrl}</span>
                    </p>
                </div>
                
                <div style="background: #e9ecef; padding: 20px; text-align: center; color: #666; font-size: 12px;">
                    <p>© 2025 Instituto Dr. Carlos Vega Bolaños. Todos los derechos reservados.</p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Error enviando email:', error);
        return false;
    }
};

export const sendPasswordChangedEmail = async (email, userName) => {
    const mailOptions = {
        from: `"Sistema RRHH - Instituto Dr. Carlos Vega Bolaños" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Contraseña Actualizada Exitosamente',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #2e7d32 0%, #4caf50 100%); padding: 30px; text-align: center; color: white;">
                    <h1 style="margin: 0;">Contraseña Actualizada</h1>
                </div>
                
                <div style="padding: 30px; background: #f9fafb;">
                    <h2 style="color: #2e7d32;">Hola ${userName},</h2>
                    <p>Tu contraseña ha sido actualizada exitosamente.</p>
                    
                    <div style="background: #e8f5e8; padding: 15px; border-radius: 5px; border-left: 4px solid #2e7d32;">
                        <p style="margin: 0; color: #2e7d32;">
                            <strong>Fecha de cambio:</strong> ${new Date().toLocaleString('es-ES')}
                        </p>
                    </div>
                    
                    <p style="color: #666; margin-top: 20px;">
                        Si no realizaste este cambio, por favor contacta inmediatamente al administrador del sistema.
                    </p>
                </div>
                
                <div style="background: #e9ecef; padding: 20px; text-align: center; color: #666; font-size: 12px;">
                    <p>© 2025 Instituto Dr. Carlos Vega Bolaños. Todos los derechos reservados.</p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Error enviando email de confirmación:', error);
        return false;
    }
};