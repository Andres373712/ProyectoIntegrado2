import { reportesService } from '../services/reportesService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const reportesController = {
  getVentas: asyncHandler(async (req, res) => {
    const { desde, hasta } = req.query;
    res.json(await reportesService.getVentas({ desde, hasta }));
  }),

  getClientasRecurrentes: asyncHandler(async (req, res) => {
    const { desde, hasta, limite } = req.query;
    res.json(await reportesService.getClientasRecurrentes({ desde, hasta, limite: Number(limite) || 10 }));
  }),

  getProductosTop: asyncHandler(async (req, res) => {
    const { desde, hasta, limite } = req.query;
    res.json(await reportesService.getProductosTop({ desde, hasta, limite: Number(limite) || 10 }));
  }),
};
