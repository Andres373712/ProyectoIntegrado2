import { Router } from 'express';
import { clienteController } from '../controllers/clienteController.js';
import { protegerRutas, esCliente } from '../middlewares/auth.js';

const router = Router();

// NOTA: no se agrega GET /cliente/mis-pedidos — no existe ninguna
// funcionalidad de pedidos en el backend hoy (la tabla "pedidos" está
// declarada en el schema de Drizzle pero sin repositorio/servicio/ruta que la
// use; el frontend ya documenta en pedidosService.ts que POST /api/pedido
// "todavía no existe en el backend"). Agregar mis-pedidos ahora implicaría
// inventar un sistema de pedidos completo, fuera del alcance de esta tarea.
router.get('/cliente/mis-inscripciones', protegerRutas, esCliente, clienteController.getMisInscripciones);

export default router;
