import { productosService } from '../services/productosService.js';
import { parsePaginacion } from '../utils/pagination.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const productosController = {
  getActivos: asyncHandler(async (req, res) => {
    const paginacion = parsePaginacion(req.query);
    if (paginacion) res.set('X-Total-Count', String(await productosService.contarActivos()));
    res.json(await productosService.getActivos(paginacion));
  }),

  getTodos: asyncHandler(async (req, res) => {
    const paginacion = parsePaginacion(req.query);
    if (paginacion) res.set('X-Total-Count', String(await productosService.contarTodos()));
    res.json(await productosService.getTodos(paginacion));
  }),

  crear: asyncHandler(async (req, res) => {
    await productosService.crear(req.body, req.file);
    res.status(201).json({ message: 'Producto creado' });
  }),

  eliminar: asyncHandler(async (req, res) => {
    await productosService.eliminar(req.params.id);
    res.json({ message: 'Producto eliminado' });
  }),
};
