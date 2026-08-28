import { Router } from 'express';
import { inscripcionController } from '../controllers/inscripcionController.js';
import { validate } from '../middlewares/validate.js';
import { inscripcionSchema } from '../validators/inscripcion.schema.js';
import { usuarioOpcional } from '../middlewares/auth.js';

const router = Router();

router.post(
  '/inscripcion',
  usuarioOpcional,
  validate(inscripcionSchema),
  inscripcionController.inscribir,
);

// Pública, sin auth: se llega acá haciendo clic en el link del email de
// confirmación (ver emailService.enviarEmailConfirmacion), no desde una
// sesión iniciada — la identidad la garantiza la firma del token, no un JWT
// de sesión.
router.get('/cancelar-inscripcion/:token', inscripcionController.cancelarPorToken);

export default router;
