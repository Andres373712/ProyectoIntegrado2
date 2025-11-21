import nodemailer from 'nodemailer';
import 'dotenv/config';

// 1. Configurar el "transportador" (quién envía el correo)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// 2. Función para enviar el email de confirmación
export async function enviarEmailConfirmacion(datosClienta, datosTaller) {
    try {
        const mailOptions = {
            from: `"TMM Bienestar y Conexión" <${process.env.EMAIL_USER}>`,
            to: datosClienta.email,
            subject: `¡Confirmación de tu cupo para ${datosTaller.nombre}!`,
            
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <h1 style="color: #333;">¡Hola, ${datosClienta.nombre}!</h1>
                    <p>¡Tu inscripción al taller <strong>${datosTaller.nombre}</strong> ha sido confirmada con éxito!</p>
                    
                    <h3 style="color: #FFB6C1;">Detalles del Taller:</h3>
                    <ul>
                        <li><strong>Taller:</strong> ${datosTaller.nombre}</li>
                        <li><strong>Fecha:</strong> ${new Date(datosTaller.fecha).toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</li>
                        ${datosTaller.lugar ? `<li><strong>Lugar:</strong> ${datosTaller.lugar}</li>` : ''}
                        <li><strong>Precio:</strong> $${datosTaller.precio.toLocaleString('es-CL')}</li>
                    </ul>
                    
                    <p>¡Muchas gracias por unirte! Estamos felices de compartir este espacio de bienestar y conexión contigo.</p>
                    <p>Nos vemos pronto,</p>
                    <p><strong>Carolina López<br>TMM Bienestar y Conexión</strong></p>
                </div>
            `,
        };

        // 3. Enviar el correo
        await transporter.sendMail(mailOptions);
        console.log(`Email de confirmación enviado a ${datosClienta.email}`);

    } catch (error) {
        console.error(`Error al enviar email a ${datosClienta.email}:`, error);
    }
}

// 3. --- NUEVA FUNCIÓN PARA ENVIAR EL EMAIL DE VERIFICACIÓN ---
export async function enviarEmailVerificacion(datosClienta, verificationToken) {
    // Nota: La URL 5000 es la ruta del servidor (backend)
    const verificationURL = `http://localhost:5000/api/auth/verificar/${verificationToken}`; 

    try {
        const mailOptions = {
            from: `"TMM Bienestar y Conexión" <${process.env.EMAIL_USER}>`,
            to: datosClienta.email,
            subject: `¡Confirma tu correo para activar tu cuenta de TMM Bienestar!`,
            
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; text-align: center;">
                    <h1 style="color: #333;">¡Ya casi estás lista, ${datosClienta.nombre}!</h1>
                    <p>Para activar tu cuenta y poder iniciar sesión en TMM Bienestar y Conexión, por favor haz clic en el siguiente botón:</p>
                    
                    <div style="margin: 20px 0;">
                        <a href="${verificationURL}" 
                           style="background-color: #E4007C; 
                                  color: white; 
                                  padding: 12px 25px; 
                                  text-decoration: none; 
                                  border-radius: 6px; 
                                  font-weight: bold; 
                                  display: inline-block;">
                            ACTIVAR MI CUENTA
                        </a>
                    </div>
                    
                    <p style="font-size: 0.8em; color: #777;">Si no solicitaste este registro, por favor ignora este correo.</p>
                    <p><strong>El equipo de TMM Bienestar y Conexión</strong></p>
                </div>
            `,
        };
        await transporter.sendMail(mailOptions);
        console.log(`Email de verificación enviado a ${datosClienta.email}`);

    } catch (error) {
        console.error(`Error al enviar email de verificación a ${datosClienta.email}:`, error);
    }
}

// 4. --- NUEVA FUNCIÓN PARA RECUPERAR CONTRASEÑA ---
export async function enviarEmailRecuperacion(email, token) {
    // Nota: La URL 5173 es la ruta del frontend donde se ingresa la nueva clave
    const resetURL = `http://localhost:5173/reset-password/${token}`; 

    try {
        const mailOptions = {
            from: `"TMM Soporte" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `Recuperación de contraseña - TMM Bienestar`,
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <h2>¿Olvidaste tu contraseña?</h2>
                    <p>No te preocupes, puedes restablecerla haciendo clic en el siguiente enlace:</p>
                    <p>
                        <a href="${resetURL}" style="background-color: #E4007C; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
                            Restablecer mi contraseña
                        </a>
                    </p>
                    <p>Este enlace expirará en 1 hora.</p>
                    <p>Si no solicitaste esto, ignora este correo.</p>
                </div>
            `,
        };
        await transporter.sendMail(mailOptions);
        console.log(`Email de recuperación enviado a ${email}`);
    } catch (error) {
        console.error(`Error enviando email de recuperación a ${email}:`, error);
    }
}