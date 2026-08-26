import { productosService } from '../services/productosService.js';
import { parsePaginacion } from '../utils/pagination.js';

export const productosController = {
  getActivos: async (req, res) => {
    try {
      const paginacion = parsePaginacion(req.query);
      if (paginacion) res.set('X-Total-Count', String(await productosService.contarActivos()));
      res.json(await productosService.getActivos(paginacion));
    } catch (error) {
      res.status(500).json({ message: 'Error productos públicos' });
    }
  },

  getTodos: async (req, res) => {
    try {
      const paginacion = parsePaginacion(req.query);
      if (paginacion) res.set('X-Total-Count', String(await productosService.contarTodos()));
      res.json(await productosService.getTodos(paginacion));
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
