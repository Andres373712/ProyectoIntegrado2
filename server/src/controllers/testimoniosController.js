import { testimoniosService } from '../services/testimoniosService.js';
import { parsePaginacion } from '../utils/pagination.js';

export const testimoniosController = {
  getActivos: async (req, res) => {
    try {
      const paginacion = parsePaginacion(req.query);
      if (paginacion) res.set('X-Total-Count', String(await testimoniosService.contarActivos()));
      res.json(await testimoniosService.getActivos(paginacion));
    } catch (error) {
      console.error('Error testimonios activos:', error);
      res.status(500).json({ message: 'Error al cargar testimonios' });
    }
  },

  getTodos: async (req, res) => {
    try {
      const paginacion = parsePaginacion(req.query);
      if (paginacion) res.set('X-Total-Count', String(await testimoniosService.contarTodos()));
      res.json(await testimoniosService.getTodos(paginacion));
    } catch (error) {
      console.error('Error testimonios admin:', error);
      res.status(500).json({ message: 'Error' });
    }
  },

  crear: async (req, res) => {
    try {
      await testimoniosService.crear(req.body);
      res.status(201).json({ message: 'Testimonio creado con éxito' });
    } catch (error) {
      console.error('Error creando testimonio:', error);
      res.status(500).json({ message: 'Error al crear testimonio' });
    }
  },

  actualizar: async (req, res) => {
    try {
      const testimonio = await testimoniosService.getById(req.params.id);
      if (!testimonio) return res.status(404).json({ message: 'Testimonio no encontrado' });
      await testimoniosService.actualizar(req.params.id, req.body);
      res.json({ message: 'Testimonio actualizado' });
    } catch (error) {
      console.error('Error actualizando testimonio:', error);
      res.status(500).json({ message: 'Error' });
    }
  },

  eliminar: async (req, res) => {
    try {
      await testimoniosService.eliminar(req.params.id);
      res.json({ message: 'Testimonio eliminado' });
    } catch (error) {
      res.status(500).json({ message: 'Error al eliminar' });
    }
  },
};
