import { Router } from 'express';
import { talleresController } from '../controllers/talleresController.js';
import { protegerRutas, esAdmin } from '../middlewares/auth.js';
import { upload } from '../middlewares/upload.js';
import { validate } from '../middlewares/validate.js';
import { tallerCrearSchema, tallerActualizarSchema } from '../validators/taller.schema.js';

const router = Router();

// Nota: la ruta pública de detalle es singular ("/taller/:id"), igual que en
// el server.js original — no es un error, es el contrato existente.
router.get('/talleres/activos', talleresController.getActivos);
router.get('/talleres/todos', protegerRutas, esAdmin, talleresController.getTodos);
router.get('/taller/:id', talleresController.getById);

router.post(
  '/talleres',
  protegerRutas,
  esAdmin,
  upload.single('imagen'),
  validate(tallerCrearSchema),
  talleresController.crear
);

router.put(
  '/talleres/:id',
  protegerRutas,
  esAdmin,
  upload.single('imagen'),
  validate(tallerActualizarSchema),
  talleresController.actualizar
);

router.delete('/talleres/:id', protegerRutas, esAdmin, talleresController.eliminar);

export default router;
