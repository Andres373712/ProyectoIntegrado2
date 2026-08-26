import { Router } from 'express';
import { productosController } from '../controllers/productosController.js';
import { protegerRutas, esAdmin } from '../middlewares/auth.js';
import { upload } from '../middlewares/upload.js';
import { validate } from '../middlewares/validate.js';
import { productoCrearSchema } from '../validators/producto.schema.js';

const router = Router();

router.get('/productos/activos', productosController.getActivos);
router.get('/productos/todos', protegerRutas, esAdmin, productosController.getTodos);

router.post(
  '/productos',
  protegerRutas,
  esAdmin,
  upload.single('imagen'),
  validate(productoCrearSchema),
  productosController.crear
);

router.delete('/productos/:id', protegerRutas, esAdmin, productosController.eliminar);

export default router;
