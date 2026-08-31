// Validación fail-fast: sin JWT_SECRET el servidor arrancaba igual y recién
// fallaba en el primer login/verificación de token, ya en producción. Se
// corta acá, antes de que app.listen() empiece a aceptar tráfico.
const JWT_SECRET_MIN_LENGTH = 16;
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < JWT_SECRET_MIN_LENGTH) {
  console.error(
    `Falta configurar JWT_SECRET (o es demasiado corto: mínimo ${JWT_SECRET_MIN_LENGTH} caracteres). ` +
      'Define la variable de entorno JWT_SECRET antes de arrancar el servidor. Ver .env.example.',
  );
  process.exit(1);
}

export const PORT = process.env.PORT || 5000;
export const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// URL pública del propio backend (para links que el backend maneja
// directamente, como la verificación de cuenta). Railway inyecta
// RAILWAY_PUBLIC_DOMAIN automáticamente en servicios con dominio público;
// si no está definida, se puede fijar API_URL a mano.
export const API_URL =
  process.env.API_URL ||
  (process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : `http://localhost:${PORT}`);

// Igual que el chequeo de JWT_SECRET, pero para las 3 variables que hasta
// ahora fallaban en SILENCIO: sin SENDGRID_API_KEY o EMAIL_USER, cada envío
// de correo fallaba dentro de un try/catch que solo logueaba (el usuario veía
// "revisa tu correo" sin que nada se hubiera enviado); sin FRONTEND_URL,
// CORS quedaba restringido a localhost:3000 y el sitio real no podía hablar
// con la API. Se limita a NODE_ENV=production o a estar corriendo en Railway
// (RAILWAY_ENVIRONMENT) para no exigir estas variables en desarrollo local
// ni en CI, donde los tests corren contra mocks.
const enProduccion = process.env.NODE_ENV === 'production' || Boolean(process.env.RAILWAY_ENVIRONMENT);
if (enProduccion) {
  const faltantes = ['SENDGRID_API_KEY', 'EMAIL_USER', 'FRONTEND_URL'].filter((clave) => !process.env[clave]);
  if (faltantes.length > 0) {
    console.error(
      `Falta configurar ${faltantes.join(', ')} en producción — el envío de correos y/o CORS ` +
        'no van a funcionar. Define estas variables antes de arrancar el servidor. Ver .env.example.',
    );
    process.exit(1);
  }
}
