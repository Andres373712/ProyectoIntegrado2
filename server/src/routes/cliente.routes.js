import { Router } from 'express';
import { clienteController } from '../controllers/clienteController.js';
import { protegerRutas, esCliente } from '../middlewares/auth.js';

const router = Router();

// NOTA: no se agrega GET /cliente/mis-pedidos — la funcionalidad de pedidos
// ya existe (POST /api/pedido para checkout, GET /api/pedidos/todos del lado
// admin en pedido.routes.js), pero todavía no hay un endpoint para que un
// cliente autenticado liste sus propios pedidos.
router.get('/cliente/mis-inscripciones', protegerRutas, esCliente, clienteController.getMisInscripciones);
router.delete(
  '/cliente/mis-inscripciones/:id',
  protegerRutas,
  esCliente,
  clienteController.cancelarInscripcion,
);

export default router;
