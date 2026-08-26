import { Router } from 'express';
import { testimoniosController } from '../controllers/testimoniosController.js';
import { protegerRutas, esAdmin } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { testimonioCrearSchema, testimonioActualizarSchema } from '../validators/testimonio.schema.js';

const router = Router();

router.get('/testimonios/activos', testimoniosController.getActivos);
router.get('/testimonios/todos', protegerRutas, esAdmin, testimoniosController.getTodos);

router.post(
  '/testimonios',
  protegerRutas,
  esAdmin,
  validate(testimonioCrearSchema),
  testimoniosController.crear,
);

router.put(
  '/testimonios/:id',
  protegerRutas,
  esAdmin,
  validate(testimonioActualizarSchema),
  testimoniosController.actualizar,
);

router.delete('/testimonios/:id', protegerRutas, esAdmin, testimoniosController.eliminar);

export default router;
