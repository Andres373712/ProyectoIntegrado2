import { Router } from 'express';
import { reportesController } from '../controllers/reportesController.js';
import { protegerRutas, esAdmin } from '../middlewares/auth.js';

const router = Router();

router.get('/reportes/ventas', protegerRutas, esAdmin, reportesController.getVentas);
router.get('/reportes/clientas-recurrentes', protegerRutas, esAdmin, reportesController.getClientasRecurrentes);
router.get('/reportes/productos-top', protegerRutas, esAdmin, reportesController.getProductosTop);

export default router;
