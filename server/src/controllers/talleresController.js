import { talleresService } from '../services/talleresService.js';
import { parsePaginacion } from '../utils/pagination.js';

// Ambos son opcionales: sin ?tipo/?disponible, se comporta igual que antes.
const parseFiltros = (query) => {
  const filtros = {};
  if (query.tipo) filtros.tipo = query.tipo;
  if (query.disponible === 'true') filtros.soloConCupos = true;
  return Object.keys(filtros).length ? filtros : undefined;
};

export const talleresController = {
  // Sin ?page/?pageSize: mismo comportamiento de siempre (array completo).
  // Con ambos: LIMIT/OFFSET en la consulta + header X-Total-Count.
  getActivos: async (req, res) => {
    try {
      const paginacion = parsePaginacion(req.query);
      const filtros = parseFiltros(req.query);
      if (paginacion) res.set('X-Total-Count', String(await talleresService.contarActivos(filtros)));
      res.json(await talleresService.getActivos(paginacion, filtros));
    } catch (error) {
      console.error('Error talleres activos:', error);
      res.status(500).json({ message: 'Error al cargar talleres' });
    }
  },

  getTodos: async (req, res) => {
    try {
      const paginacion = parsePaginacion(req.query);
      if (paginacion) res.set('X-Total-Count', String(await talleresService.contarTodos()));
      res.json(await talleresService.getTodos(paginacion));
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
