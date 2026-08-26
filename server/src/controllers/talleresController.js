import { talleresService } from '../services/talleresService.js';

export const talleresController = {
  getActivos: async (req, res) => {
    try {
      res.json(await talleresService.getActivos());
    } catch (error) {
      console.error('Error talleres activos:', error);
      res.status(500).json({ message: 'Error al cargar talleres' });
    }
  },

  getTodos: async (req, res) => {
    try {
      res.json(await talleresService.getTodos());
    } catch (error) {
      console.error('Error talleres admin:', error);
      res.status(500).json({ message: 'Error' });
    }
  },

  getById: async (req, res) => {
    try {
      const taller = await talleresService.getById(req.params.id);
      if (!taller) return res.status(404).json({ message: 'Taller no encontrado' });
      res.json(taller);
    } catch (error) {
      res.status(500).json({ message: 'Error' });
    }
  },

  crear: async (req, res) => {
    try {
      await talleresService.crear(req.body, req.file);
      res.status(201).json({ message: 'Taller creado con éxito' });
    } catch (error) {
      console.error('Error creando taller:', error);
      res.status(500).json({ message: 'Error al crear taller' });
    }
  },

  actualizar: async (req, res) => {
    try {
      await talleresService.actualizar(req.params.id, req.body, req.file);
      res.json({ message: 'Taller actualizado' });
    } catch (error) {
      console.error('Error actualizando taller:', error);
      res.status(500).json({ message: 'Error' });
    }
  },

  eliminar: async (req, res) => {
    try {
      await talleresService.eliminar(req.params.id);
      res.json({ message: 'Taller eliminado' });
    } catch (error) {
      res.status(500).json({ message: 'No se puede eliminar (tiene inscripciones)' });
    }
  },
};
