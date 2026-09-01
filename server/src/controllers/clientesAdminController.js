import { clientesAdminService } from '../services/clientesAdminService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const clientesAdminController = {
  getTodos: asyncHandler(async (req, res) => {
    const { buscar, fechaInicio, fechaFin, tallerId } = req.query;
    res.json(await clientesAdminService.getConFiltros({ buscar, fechaInicio, fechaFin, tallerId }));
  }),

  getById: asyncHandler(async (req, res) => {
    const cliente = await clientesAdminService.getById(req.params.id);
    if (!cliente) return res.status(404).json({ message: 'Clienta no encontrada' });
    res.json(cliente);
  }),

  actualizar: asyncHandler(async (req, res) => {
    await clientesAdminService.actualizar(req.params.id, req.body);
    res.json({ message: 'Datos actualizados' });
  }),

  getHistorial: asyncHandler(async (req, res) => {
    res.json(await clientesAdminService.getHistorial(req.params.id));
  }),

  getNotas: asyncHandler(async (req, res) => {
    res.json(await clientesAdminService.getNotas(req.params.id));
  }),

  crearNota: asyncHandler(async (req, res) => {
    await clientesAdminService.crearNota(req.params.id, req.body.nota);
    res.status(201).json({ message: 'Nota guardada' });
  }),
};
