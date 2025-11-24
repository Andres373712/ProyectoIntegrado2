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

// 3. --- FUNCIÓN PARA ENVIAR EL EMAIL DE VERIFICACIÓN ---
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

// 4. --- FUNCIÓN PARA RECUPERAR CONTRASEÑA ---
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

// 5. --- NUEVA FUNCIÓN PARA CONFIRMACIÓN DE PEDIDOS ---
export async function enviarEmailPedido(cliente, productos, total, pedidoId) {
    const listaProductos = productos.map(p => 
        `<li style="padding: 8px 0; border-bottom: 1px solid #eee;">
            <strong>${p.nombre}</strong><br>
            Cantidad: ${p.cantidad} × $${p.precio.toLocaleString('es-CL')} = $${(p.cantidad * p.precio).toLocaleString('es-CL')}
        </li>`
    ).join('');

    try {
        const mailOptions = {
            from: `"TMM Bienestar y Conexión" <${process.env.EMAIL_USER}>`,
            to: cliente.email,
            subject: `✅ Pedido Recibido #${pedidoId} - TMM Bienestar`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                    <h2 style="color: #E4007C;">¡Gracias por tu pedido, ${cliente.nombre}!</h2>
                    <p>Hemos recibido tu pedido correctamente. A continuación el detalle:</p>
                    
                    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #333; margin-top: 0;">Pedido #${pedidoId}</h3>
                        <ul style="list-style: none; padding: 0; margin: 0;">
                            ${listaProductos}
                        </ul>
                        <hr style="margin: 20px 0; border: none; border-top: 2px solid #E4007C;">
                        <p style="font-size: 20px; font-weight: bold; text-align: right; color: #E4007C; margin: 0;">
                            Total: $${total.toLocaleString('es-CL')}
                        </p>
                    </div>

                    <p style="background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; border-radius: 4px;">
                        📞 <strong>Nos pondremos en contacto contigo pronto</strong> para coordinar el pago y envío.
                    </p>
                    
                    <p>Cualquier consulta, responde a este correo.</p>
                    
                    <p style="margin-top: 30px; color: #666;">
                        Saludos cordiales,<br>
                        <strong>Carolina López<br>TMM Bienestar y Conexión</strong>
                    </p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email de pedido enviado a ${cliente.email}`);

    } catch (error) {
        console.error(`Error al enviar email de pedido a ${cliente.email}:`, error);
    }
}