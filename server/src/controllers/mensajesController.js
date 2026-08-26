import { mensajesService } from '../services/mensajesService.js';
import { parsePaginacion } from '../utils/pagination.js';

export const mensajesController = {
  crearContacto: async (req, res) => {
    try {
      await mensajesService.crear(req.body);
      res.json({ message: 'Mensaje enviado correctamente' });
    } catch (error) {
      console.error('Error contacto:', error);
      res.status(500).json({ message: 'Error enviando mensaje' });
    }
  },

  getTodos: async (req, res) => {
    try {
      const paginacion = parsePaginacion(req.query);
      if (paginacion) res.set('X-Total-Count', String(await mensajesService.contarTodos()));
      res.json(await mensajesService.getTodos(paginacion));
    } catch (error) {
      console.error('Error cargando mensajes:', error);
      res.status(500).json({ message: 'Error al cargar mensajes' });
    }
  },
};
