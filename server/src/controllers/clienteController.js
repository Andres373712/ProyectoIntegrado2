import { clienteService } from '../services/clienteService.js';

export const clienteController = {
  getMisInscripciones: async (req, res) => {
    try {
      const inscripciones = await clienteService.getMisInscripciones(req.user.id);
      res.json(inscripciones);
    } catch (error) {
      console.error('Error obteniendo inscripciones del cliente:', error);
      res.status(500).json({ message: 'Error al obtener tus inscripciones' });
    }
  },
};
