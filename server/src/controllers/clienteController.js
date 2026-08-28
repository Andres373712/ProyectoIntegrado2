import { clienteService } from '../services/clienteService.js';
import { HttpError } from '../utils/httpError.js';

export const clienteController = {
  getMisInscripciones: async (req, res) => {
    try {
      const inscripciones = await clienteService.getMisInscripciones(req.user.id);
      res.json(inscripciones);
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.status).json({ message: error.message });
      }
      console.error('Error obteniendo inscripciones del cliente:', error);
      res.status(500).json({ message: 'Error al obtener tus inscripciones' });
    }
  },

  cancelarInscripcion: async (req, res) => {
    try {
      await clienteService.cancelarInscripcion(req.user.id, Number(req.params.id));
      res.status(200).json({ message: 'Inscripción cancelada' });
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.status).json({ message: error.message });
      }
      console.error('Error cancelando inscripción del cliente:', error);
      res.status(500).json({ message: 'Error al cancelar tu inscripción' });
    }
  },
};
