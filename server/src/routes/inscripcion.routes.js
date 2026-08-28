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

export default router;
