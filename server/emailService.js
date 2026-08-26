import nodemailer from 'nodemailer';
import 'dotenv/config';

// Configuración del transportador (Gmail)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Asegúrate de usar App Password si tienes 2FA
  },
  // Sin esto, un SMTP inalcanzable cuelga la petición HTTP indefinidamente
  // en vez de fallar rápido (los envíos son fire-and-forget con .catch, pero
  // eso no ayuda si la promesa nunca se resuelve ni se rechaza).
  connectionTimeout: 10_000,
  greetingTimeout: 10_000,
  socketTimeout: 10_000,
});

// Verificar conexión al iniciar (opcional pero recomendado)
transporter.verify((error, success) => {
  if (error) {
    console.error('Error de configuración de email:', error);
  } else {
    console.log('Servidor de correo listo (Gmail)');
  }
});

// 1. Confirmación de inscripción
export async function enviarEmailConfirmacion(datosClienta, datosTaller) {
  try {
    const mailOptions = {
      from: `"TMM Bienestar" <${process.env.EMAIL_USER}>`,
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
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Confirmación enviada a ${datosClienta.email}`);
  } catch (error) {
    console.error('Error enviando confirmación:', error);
  }
}

// 2. Verificación de cuenta
export async function enviarEmailVerificacion(datosClienta, verificationToken) {
  const verificationURL = `http://localhost:5173/verificar-cuenta/${verificationToken}`;

  try {
    await transporter.sendMail({
      from: `"TMM Bienestar" <${process.env.EMAIL_USER}>`,
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
    console.error('Error verificación:', error);
  }
}

// 3. Recuperación de contraseña
export async function enviarEmailRecuperacion(email, token) {
  const resetURL = `http://localhost:5173/reset-password/${token}`;

  try {
    await transporter.sendMail({
      from: `"TMM Soporte" <${process.env.EMAIL_USER}>`,
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
    console.error('Error recuperación:', error);
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
    await transporter.sendMail({
      from: `"TMM Bienestar" <${process.env.EMAIL_USER}>`,
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
    console.error('Error email pedido:', error);
  }
}

// 5. FORMULARIO DE CONTACTO (CORREGIDA Y MEJORADA)
export async function enviarEmailContacto(datosFormulario) {
  const { nombre, email, telefono, mensaje } = datosFormulario;

  try {
    // Email al administrador (tú)
    await transporter.sendMail({
      from: `"Web Contacto" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Tu correo
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
    await transporter.sendMail({
      from: `"TMM Bienestar" <${process.env.EMAIL_USER}>`,
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
    console.error('Error crítico en enviarEmailContacto:', error);
    throw error; // Importante: propagar el error para que el backend lo capture
  }
}