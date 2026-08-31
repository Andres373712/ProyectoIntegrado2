import { Router } from 'express';
import { mensajesController } from '../controllers/mensajesController.js';
import { protegerRutas, esAdmin } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { contactoSchema } from '../validators/contacto.schema.js';
import { publicoLimiter } from '../middlewares/rateLimit.js';

const router = Router();

router.post('/contacto', publicoLimiter, validate(contactoSchema), mensajesController.crearContacto);
router.get('/mensajes-contacto', protegerRutas, esAdmin, mensajesController.getTodos);

export default router;
