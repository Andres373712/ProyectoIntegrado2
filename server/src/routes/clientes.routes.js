import { Router } from 'express';
import { clientesAdminController } from '../controllers/clientesAdminController.js';
import { protegerRutas, esAdmin } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { clienteActualizarSchema, notaCrearSchema } from '../validators/cliente.schema.js';

const router = Router();

// CRM de clientas del panel de admin — distinto de cliente.routes.js
// (self-service de "Mi Cuenta"). Todo admin-only.
router.get('/clientes', protegerRutas, esAdmin, clientesAdminController.getTodos);
router.get('/cliente/:id', protegerRutas, esAdmin, clientesAdminController.getById);
router.put(
  '/cliente/:id',
  protegerRutas,
  esAdmin,
  validate(clienteActualizarSchema),
  clientesAdminController.actualizar,
);
router.get('/cliente/:id/historial', protegerRutas, esAdmin, clientesAdminController.getHistorial);
router.get('/cliente/:id/notas', protegerRutas, esAdmin, clientesAdminController.getNotas);
router.post(
  '/cliente/:id/notas',
  protegerRutas,
  esAdmin,
  validate(notaCrearSchema),
  clientesAdminController.crearNota,
);

export default router;
