import { clienteService } from '../services/clienteService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const clienteController = {
  getMisInscripciones: asyncHandler(async (req, res) => {
    const inscripciones = await clienteService.getMisInscripciones(req.user.id);
    res.json(inscripciones);
  }),

  cancelarInscripcion: asyncHandler(async (req, res) => {
    await clienteService.cancelarInscripcion(req.user.id, Number(req.params.id));
    res.status(200).json({ message: 'Inscripción cancelada' });
  }),
};
