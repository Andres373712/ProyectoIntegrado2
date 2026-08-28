import pino from 'pino';

// Logger mínimo con niveles (en vez de console.log/console.error sueltos).
// Nivel 'debug' fuera de producción para tener más detalle en desarrollo;
// 'info' en producción para no inundar los logs. Se deja el formato JSON
// por defecto de pino (sin pino-pretty) para no sumar una dependencia más:
// es perfectamente legible con `| npx pino-pretty` en desarrollo si hace falta.
export const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
});
