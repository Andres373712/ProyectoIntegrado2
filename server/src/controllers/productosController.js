import { productosService } from '../services/productosService.js';

export const productosController = {
  getActivos: async (req, res) => {
    try {
      res.json(await productosService.getActivos());
    } catch (error) {
      res.status(500).json({ message: 'Error productos públicos' });
    }
  },

  getTodos: async (req, res) => {
    try {
      res.json(await productosService.getTodos());
    } catch (error) {
      console.error('Error productos admin:', error);
      res.status(500).json({ message: 'Error' });
    }
  },

  crear: async (req, res) => {
    try {
      await productosService.crear(req.body, req.file);
      res.status(201).json({ message: 'Producto creado' });
    } catch (error) {
      console.error('Error creando producto:', error);
      res.status(500).json({ message: 'Error' });
    }
  },

  eliminar: async (req, res) => {
    try {
      await productosService.eliminar(req.params.id);
      res.json({ message: 'Producto eliminado' });
    } catch (error) {
      res.status(500).json({ message: 'Error eliminando producto' });
    }
  },
};
