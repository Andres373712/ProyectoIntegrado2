import { Router } from 'express';
import { inscripcionController } from '../controllers/inscripcionController.js';
import { validate } from '../middlewares/validate.js';
import { inscripcionSchema } from '../validators/inscripcion.schema.js';

const router = Router();

router.post('/inscripcion', validate(inscripcionSchema), inscripcionController.inscribir);

export default router;
