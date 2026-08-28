import { mensajesService } from '../services/mensajesService.js';
import { parsePaginacion } from '../utils/pagination.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const mensajesController = {
  crearContacto: asyncHandler(async (req, res) => {
    await mensajesService.crear(req.body);
    res.json({ message: 'Mensaje enviado correctamente' });
  }),

  getTodos: asyncHandler(async (req, res) => {
    const paginacion = parsePaginacion(req.query);
    if (paginacion) res.set('X-Total-Count', String(await mensajesService.contarTodos()));
    res.json(await mensajesService.getTodos(paginacion));
  }),
};
