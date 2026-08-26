import { productosRepository } from '../repositories/productosRepository.js';

const conFormaDeRespuesta = (p) => ({ ...p, imageUrl: p.imageurl });

export const productosService = {
  getActivos: async (paginacion) =>
    (await productosRepository.getActivos(paginacion)).map(conFormaDeRespuesta),

  contarActivos: () => productosRepository.contarActivos(),

  getTodos: async (paginacion) =>
    (await productosRepository.getTodos(paginacion)).map(conFormaDeRespuesta),

  contarTodos: () => productosRepository.contarTodos(),

  crear: (datos, archivo) => {
    const imageUrl = archivo ? `/uploads/${archivo.filename}` : null;
    return productosRepository.crear({ ...datos, imageUrl });
  },

  eliminar: (id) => productosRepository.eliminar(id),
};
