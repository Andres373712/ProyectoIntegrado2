import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { loginLimiter, registroLimiter } from '../middlewares/rateLimit.js';
import { validate } from '../middlewares/validate.js';
import { loginSchema, registroClienteSchema, forgotPasswordSchema, resetPasswordSchema } from '../validators/auth.schema.js';

const router = Router();

// Nota: "/login" (admin) vive fuera de "/auth/*", igual que en el server.js
// original — no es un error, es el contrato existente.
router.post('/login', loginLimiter, validate(loginSchema), authController.loginAdmin);

router.post(
  '/auth/register-cliente',
  registroLimiter,
  validate(registroClienteSchema),
  authController.registrarCliente,
);
// Mismo body que /login (email+password) — reusa loginSchema en vez de
// duplicarlo. Antes era la única ruta de auth sin validate(): un body vacío
// llegaba hasta bcrypt.compare(undefined, ...) y tiraba 500 en vez de 400.
router.post('/auth/login-cliente', loginLimiter, validate(loginSchema), authController.loginCliente);
router.get('/auth/verificar/:token', registroLimiter, authController.verificarToken);

// Mismo limiter que el login: son los endpoints más golpeables por fuerza
// bruta / spam de correos de todo el módulo de auth.
router.post(
  '/auth/forgot-password',
  loginLimiter,
  validate(forgotPasswordSchema),
  authController.forgotPassword,
);
router.post(
  '/auth/reset-password',
  loginLimiter,
  validate(resetPasswordSchema),
  authController.resetPassword,
);

export default router;
