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