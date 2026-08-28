import { talleresService } from '../services/talleresService.js';
import { parsePaginacion } from '../utils/pagination.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Ambos son opcionales: sin ?tipo/?disponible, se comporta igual que antes.
const parseFiltros = (query) => {
  const filtros = {};
  if (query.tipo) filtros.tipo = query.tipo;
  if (query.disponible === 'true') filtros.soloConCupos = true;
  return Object.keys(filtros).length ? filtros : undefined;
};

export const talleresController = {
  // Sin ?page/?pageSize: mismo comportamiento de siempre (array completo).
  // Con ambos: LIMIT/OFFSET en la consulta + header X-Total-Count.
  getActivos: asyncHandler(async (req, res) => {
    const paginacion = parsePaginacion(req.query);
    const filtros = parseFiltros(req.query);
    if (paginacion) res.set('X-Total-Count', String(await talleresService.contarActivos(filtros)));
    res.json(await talleresService.getActivos(paginacion, filtros));
  }),

  getTodos: asyncHandler(async (req, res) => {
    const paginacion = parsePaginacion(req.query);
    if (paginacion) res.set('X-Total-Count', String(await talleresService.contarTodos()));
    res.json(await talleresService.getTodos(paginacion));
  }),

  getById: asyncHandler(async (req, res) => {
    const taller = await talleresService.getById(req.params.id);
    if (!taller) return res.status(404).json({ message: 'Taller no encontrado' });
    res.json(taller);
  }),

  crear: asyncHandler(async (req, res) => {
    await talleresService.crear(req.body, req.file);
    res.status(201).json({ message: 'Taller creado con éxito' });
  }),

  actualizar: asyncHandler(async (req, res) => {
    await talleresService.actualizar(req.params.id, req.body, req.file);
    res.json({ message: 'Taller actualizado' });
  }),

  eliminar: asyncHandler(async (req, res) => {
    await talleresService.eliminar(req.params.id);
    res.json({ message: 'Taller eliminado' });
  }),
};
