import { productosRepository } from '../repositories/productosRepository.js';
import { HttpError } from '../utils/httpError.js';

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

  // Mismo caso que talleresService.eliminar: un producto que ya está en algún
  // pedido no se puede borrar por la FK (pedido_items.producto_id ->
  // productos.id, sin ON DELETE). Sin este catch, SQLITE_CONSTRAINT_FOREIGNKEY
  // subía tal cual hasta el errorHandler y respondía 500 genérico.
  eliminar: async (id) => {
    try {
      await productosRepository.eliminar(id);
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
        throw new HttpError(500, 'No se puede eliminar (tiene pedidos asociados)');
      }
      throw error;
    }
  },
};
