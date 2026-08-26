import { productosRepository } from '../repositories/productosRepository.js';

const conFormaDeRespuesta = (p) => ({ ...p, imageUrl: p.imageurl });

export const productosService = {
  getActivos: async () => (await productosRepository.getActivos()).map(conFormaDeRespuesta),

  getTodos: async () => (await productosRepository.getTodos()).map(conFormaDeRespuesta),

  crear: (datos, archivo) => {
    const imageUrl = archivo ? `/uploads/${archivo.filename}` : null;
    return productosRepository.crear({ ...datos, imageUrl });
  },

  eliminar: (id) => productosRepository.eliminar(id),
};
