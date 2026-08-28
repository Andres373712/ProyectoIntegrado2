import sgMail from '@sendgrid/mail';
import 'dotenv/config';
import { FRONTEND_URL, API_URL } from './src/config.js';

// Antes este archivo usaba nodemailer + SMTP directo contra Gmail. Railway
// bloquea el SMTP saliente (puertos 25/465/587) por completo en los planes
// Trial/Hobby — solo se habilita desde el plan Pro (ver docs.railway.com/
// networking/outbound-networking) — así que ningún ajuste de puerto lo iba
// a arreglar. Se cambió a la API HTTP de SendGrid, que no depende de esos
// puertos.
//
// EMAIL_USER debe ser una dirección verificada como "Single Sender" en el
// dashboard de SendGrid (Settings → Sender Authentication → Single Sender
// Verification) — SendGrid rechaza el envío si el remitente no está
// verificado. Sin un dominio propio autenticado, esta es la única forma de
// enviar a destinatarios arbitrarios (no solo a la propia cuenta); SendGrid
// mismo advierte que es "solo para pruebas" — antes de depender de esto en
// serio conviene comprar un dominio y pasar a autenticación de dominio.
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const EMAIL_USER = process.env.EMAIL_USER;

async function enviar(mailOptions) {
  // sgMail.send lanza si la respuesta no es 2xx (a diferencia de nodemailer,
  // que resuelve igual con algunos errores del servidor) — el patrón
  // try/catch de cada función de abajo ya está preparado para eso.
  await sgMail.send(mailOptions);
}

// 1. Confirmación de inscripción
// "tokenCancelacion" es opcional (firmado por inscripcionService.inscribir
// con { tipo: 'cancelar-inscripcion', inscripcionId }): cuando viene, el
// email incluye un link a la página de cancelación anónima del frontend
// (client/src/app/(site)/cancelar-inscripcion/[token]/page.tsx), que resuelve
// GET /api/cancelar-inscripcion/:token sin requerir login.
export async function enviarEmailConfirmacion(datosClienta, datosTaller, tokenCancelacion) {
  try {
    const linkCancelacion = tokenCancelacion ? `${FRONTEND_URL}/cancelar-inscripcion/${tokenCancelacion}` : null;

    const mailOptions = {
      from: { email: EMAIL_USER, name: 'TMM Bienestar' },
      to: datosClienta.email,
      subject: `¡Tu cupo está confirmado! - ${datosTaller.nombre}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h1 style="color: #E4007C;">¡Hola, ${datosClienta.nombre}!</h1>
          <p>Tu inscripción al taller <strong>${datosTaller.nombre}</strong> fue exitosa</p>
          <h3>Detalles:</h3>
          <ul>
            <li><strong>Taller:</strong> ${datosTaller.nombre}</li>
            <li><strong>Fecha:</strong> ${new Date(datosTaller.fecha).toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</li>
            ${datosTaller.lugar ? `<li><strong>Lugar:</strong> ${datosTaller.lugar}</li>` : ''}
            <li><strong>Precio:</strong> $${datosTaller.precio?.toLocaleString('es-CL') || 'Gratis'}</li>
          </ul>
          <p>¡Nos vemos pronto!</p>
          <p><strong>Carolina López<br>TMM Bienestar y Conexión</strong></p>
          ${linkCancelacion ? `
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
          <p style="font-size: 13px; color: #666;">¿No puedes asistir?
            <a href="${linkCancelacion}" style="color: #E4007C;">Cancela tu inscripción aquí</a>
          </p>
          ` : ''}
        </div>
      `,
    };

    await enviar(mailOptions);
    console.log(`Confirmación enviada a ${datosClienta.email}`);
  } catch (error) {
    console.error('Error enviando confirmación:', error.response?.body || error);
  }
}

// 2. Verificación de cuenta
export async function enviarEmailVerificacion(datosClienta, verificationToken) {
  // La verificación la resuelve el backend directamente (GET /api/auth/verificar/:token
  // en server/src/routes/auth.routes.js), que luego redirige al frontend — no es
  // una ruta del frontend, así que el link debe apuntar al backend (API_URL), no a
  // "localhost:5173" (puerto de Vite que este proyecto ni usa; el frontend es Next.js).
  const verificationURL = `${API_URL}/api/auth/verificar/${verificationToken}`;

  try {
    await enviar({
      from: { email: EMAIL_USER, name: 'TMM Bienestar' },
      to: datosClienta.email,
      subject: 'Activa tu cuenta - TMM Bienestar y Conexión',
      html: `
        <div style="text-align: center; padding: 30px; font-family: Arial;">
          <h1>¡Hola, ${datosClienta.nombre}!</h1>
          <p>Ya casi tienes tu cuenta lista</p>
          <a href="${verificationURL}" style="background:#E4007C;color:white;padding:15px 30px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block;margin:20px 0;">
            ACTIVAR MI CUENTA
          </a>
          <p><small>Este enlace vence en 24 horas</small></p>
        </div>
      `,
    });
    console.log(`Verificación enviada a ${datosClienta.email}`);
  } catch (error) {
    console.error('Error verificación:', error.response?.body || error);
  }
}

// 3. Recuperación de contraseña
export async function enviarEmailRecuperacion(email, token) {
  // A diferencia de la verificación, el reset de contraseña SÍ lo resuelve una
  // página del frontend (client/src/app/(site)/reset-password/[token]/page.tsx),
  // que pide la nueva contraseña y llama a POST /api/auth/reset-password.
  // Por eso este link va a FRONTEND_URL, no a API_URL.
  const resetURL = `${FRONTEND_URL}/reset-password/${token}`;

  try {
    await enviar({
      from: { email: EMAIL_USER, name: 'TMM Soporte' },
      to: email,
      subject: 'Recupera tu contraseña - TMM Bienestar',
      html: `
        <div style="font-family: Arial; padding: 20px;">
          <h2>Restablece tu contraseña</h2>
          <p>Haz clic en el botón para crear una nueva contraseña:</p>
          <a href="${resetURL}" style="background:#E4007C;color:white;padding:12px 25px;border-radius:6px;text-decoration:none;">
            Cambiar contraseña
          </a>
          <p><small>Válido por 1 hora</small></p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Error recuperación:', error.response?.body || error);
  }
}

// 4. Confirmación de pedido
export async function enviarEmailPedido(cliente, productos, total, pedidoId) {
  const lista = productos.map(p => `
    <li style="padding: 8px 0;">
      <strong>${p.nombre}</strong> × ${p.cantidad} = $${(p.cantidad * p.precio).toLocaleString('es-CL')}
    </li>
  `).join('');

  try {
    await enviar({
      from: { email: EMAIL_USER, name: 'TMM Bienestar' },
      to: cliente.email,
      subject: `Pedido #${pedidoId} recibido - TMM`,
      html: `
        <h2>¡Gracias por tu compra, ${cliente.nombre}!</h2>
        <p>Pedido <strong>#${pedidoId}</strong></p>
        <ul>${lista}</ul>
        <h3>Total: $${total.toLocaleString('es-CL')}</h3>
        <p>Pronto te contactaremos para coordinar pago y envío</p>
      `,
    });
  } catch (error) {
    console.error('Error email pedido:', error.response?.body || error);
  }
}

// 5. FORMULARIO DE CONTACTO (CORREGIDA Y MEJORADA)
export async function enviarEmailContacto(datosFormulario) {
  const { nombre, email, telefono, mensaje } = datosFormulario;

  try {
    // Email al administrador (tú)
    await enviar({
      from: { email: EMAIL_USER, name: 'Web Contacto' },
      to: EMAIL_USER, // Tu correo
      replyTo: email, // Para que puedas responder directamente
      subject: `Nuevo mensaje de ${nombre}`,
      html: `
        <h2>Nuevo mensaje desde el formulario de contacto</h2>
        <p><strong>De:</strong> ${nombre}</p>
        <p><strong>Email:</strong> ${email}</p>
        ${telefono ? `<p><strong>Teléfono:</strong> ${telefono}</p>` : ''}
        <h3>Mensaje:</h3>
        <div style="background:#f5f5f5;padding:15px;border-radius:8px;">
          ${mensaje.replace(/\n/g, '<br>')}
        </div>
        <hr>
        <small>Enviado desde tmmbienestar.cl</small>
      `,
    });

    // Auto-respuesta al usuario
    await enviar({
      from: { email: EMAIL_USER, name: 'TMM Bienestar' },
      to: email,
      subject: '¡Recibimos tu mensaje!',
      html: `
        <div style="font-family: Arial; text-align: center; padding: 30px;">
          <h1>¡Hola, ${nombre}!</h1>
          <p>Gracias por escribirnos</p>
          <p>En breve te responderemos a <strong>${email}</strong></p>
          <p>¡Que tengas un lindo día!</p>
          <p><strong>Carolina López<br>TMM Bienestar y Conexión</strong></p>
        </div>
      `,
    });

    console.log(`Contacto: mensaje de ${nombre} (${email}) procesado correctamente`);
  } catch (error) {
    console.error('Error crítico en enviarEmailContacto:', error.response?.body || error);
    throw error; // Importante: propagar el error para que el backend lo capture
  }
}
