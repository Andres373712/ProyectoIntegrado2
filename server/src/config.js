export const PORT = process.env.PORT || 5000;
export const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// URL pública del propio backend (para links que el backend maneja
// directamente, como la verificación de cuenta). Railway inyecta
// RAILWAY_PUBLIC_DOMAIN automáticamente en servicios con dominio público;
// si no está definida, se puede fijar API_URL a mano.
export const API_URL =
  process.env.API_URL ||
  (process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : `http://localhost:${PORT}`);
