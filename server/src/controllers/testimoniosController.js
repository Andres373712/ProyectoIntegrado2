import { testimoniosService } from '../services/testimoniosService.js';
import { parsePaginacion } from '../utils/pagination.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const testimoniosController = {
  getActivos: asyncHandler(async (req, res) => {
    const paginacion = parsePaginacion(req.query);
    if (paginacion) res.set('X-Total-Count', String(await testimoniosService.contarActivos()));
    res.json(await testimoniosService.getActivos(paginacion));
  }),

  getTodos: asyncHandler(async (req, res) => {
    const paginacion = parsePaginacion(req.query);
    if (paginacion) res.set('X-Total-Count', String(await testimoniosService.contarTodos()));
    res.json(await testimoniosService.getTodos(paginacion));
  }),

  crear: asyncHandler(async (req, res) => {
    await testimoniosService.crear(req.body);
    res.status(201).json({ message: 'Testimonio creado con éxito' });
  }),

  actualizar: asyncHandler(async (req, res) => {
    const testimonio = await testimoniosService.getById(req.params.id);
    if (!testimonio) return res.status(404).json({ message: 'Testimonio no encontrado' });
    await testimoniosService.actualizar(req.params.id, req.body);
    res.json({ message: 'Testimonio actualizado' });
  }),

  eliminar: asyncHandler(async (req, res) => {
    await testimoniosService.eliminar(req.params.id);
    res.json({ message: 'Testimonio eliminado' });
  }),
};
