import { mensajesService } from '../services/mensajesService.js';

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
      res.json(await mensajesService.getTodos());
    } catch (error) {
      console.error('Error cargando mensajes:', error);
      res.status(500).json({ message: 'Error al cargar mensajes' });
    }
  },
};
