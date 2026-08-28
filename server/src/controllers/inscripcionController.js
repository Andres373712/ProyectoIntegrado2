import { inscripcionService } from '../services/inscripcionService.js';
import { HttpError } from '../utils/httpError.js';

export const inscripcionController = {
  inscribir: async (req, res) => {
    try {
      await inscripcionService.inscribir(req.body, req.user);
      res.status(201).json({ message: 'Inscripción exitosa' });
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.status).json({ message: error.message });
      }
      console.error('Error inscripción:', error);
      res.status(500).json({ message: 'Error al inscribir' });
    }
  },
};
