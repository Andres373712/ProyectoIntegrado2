import rateLimit from 'express-rate-limit';

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Demasiados intentos. Intenta de nuevo en unos minutos.' },
});

// Límite más laxo que loginLimiter: para registro y verificación de cuenta,
// donde el riesgo no es fuerza bruta de contraseña sino spam de envío de
// correos (registro dispara un email de verificación). Se usa una ventana
// igual pero con un tope más alto, para no molestar a usuarios legítimos que
// se equivocan al registrarse o reintentan verificar.
export const registroLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Demasiados intentos. Intenta de nuevo en unos minutos.' },
});
