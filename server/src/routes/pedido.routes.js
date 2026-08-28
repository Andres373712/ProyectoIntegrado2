import { Router } from 'express';
import { pedidoController } from '../controllers/pedidoController.js';
import { validate } from '../middlewares/validate.js';
import { pedidoSchema } from '../validators/pedido.schema.js';
import { usuarioOpcional } from '../middlewares/auth.js';

const router = Router();

// Checkout del carrito es anónimo, igual que la inscripción a talleres:
// usuarioOpcional adjunta req.user solo si viene un JWT válido de cliente,
// para poder ligar el pedido a esa cuenta sin bloquear el flujo sin login.
router.post('/pedido', usuarioOpcional, validate(pedidoSchema), pedidoController.crear);

export default router;
