import { testimoniosRepository } from '../repositories/testimoniosRepository.js';

export const testimoniosService = {
  getActivos: (paginacion) => testimoniosRepository.getActivos(paginacion),
  contarActivos: () => testimoniosRepository.contarActivos(),

  getTodos: (paginacion) => testimoniosRepository.getTodos(paginacion),
  contarTodos: () => testimoniosRepository.contarTodos(),

  getById: (id) => testimoniosRepository.getById(id),

  crear: (datos) => testimoniosRepository.crear(datos),
  actualizar: (id, datos) => testimoniosRepository.actualizar(id, datos),
  eliminar: (id) => testimoniosRepository.eliminar(id),
};
