import nodemailer from 'nodemailer';
import 'dotenv/config';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export async function enviarEmailConfirmacion(datosClienta, datosTaller, tokenCancelacion) {
    try {
        const urlCancelacion = `http://localhost:5173/cancelar-inscripcion/${tokenCancelacion}`;
        
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
                        <li><strong>Precio:</strong> $${datosTaller.precio.toLocaleString('es-CL')}</li>
                    </ul>

                    <p>¡Muchas gracias por unirte! Estamos felices de compartir este espacio de bienestar y conexión contigo.</p>
                    
                    <div style="margin: 30px 0; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
                        <p style="margin-bottom: 10px;">Si por alguna razón no puedes asistir, puedes cancelar tu inscripción:</p>
                        <a href="${urlCancelacion}" 
                           style="display: inline-block; background-color: #FF6B6B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                            Cancelar mi Inscripción
                        </a>
                    </div>

                    <p>Nos vemos pronto,</p>
                    <p><strong>Carolina López<br>TMM Bienestar y Conexión</strong></p>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email de confirmación enviado a ${datosClienta.email}`);

    } catch (error) {
        console.error(`Error al enviar email a ${datosClienta.email}:`, error);
    }
}