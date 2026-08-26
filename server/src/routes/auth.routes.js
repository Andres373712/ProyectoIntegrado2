import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { loginLimiter } from '../middlewares/rateLimit.js';
import { validate } from '../middlewares/validate.js';
import { registroClienteSchema } from '../validators/auth.schema.js';

const router = Router();

// Nota: "/login" (admin) vive fuera de "/auth/*", igual que en el server.js
// original — no es un error, es el contrato existente.
router.post('/login', loginLimiter, authController.loginAdmin);

router.post('/auth/register-cliente', validate(registroClienteSchema), authController.registrarCliente);
router.post('/auth/login-cliente', loginLimiter, authController.loginCliente);
router.get('/auth/verificar/:token', authController.verificarToken);

export default router;
