import { talleresRepository } from '../repositories/talleresRepository.js';
import { HttpError } from '../utils/httpError.js';

const conFormaDeRespuesta = (t) => ({
  ...t,
  imageUrl: t.imageurl,
  cupos_totales: t.cupos_totales || 10,
  cupos_inscritos: t.cupos_inscritos || 0,
});

export const talleresService = {
  getActivos: async (paginacion, filtros) =>
    (await talleresRepository.getActivos(paginacion, filtros)).map(conFormaDeRespuesta),

  contarActivos: (filtros) => talleresRepository.contarActivos(filtros),

  getTodos: async (paginacion) =>
    (await talleresRepository.getTodos(paginacion)).map(conFormaDeRespuesta),

  contarTodos: () => talleresRepository.contarTodos(),

  getById: async (id) => {
    const taller = await talleresRepository.getById(id);
    return taller ? conFormaDeRespuesta(taller) : undefined;
  },

  crear: (datos, archivo) => {
    const imageUrl = archivo ? `/uploads/${archivo.filename}` : null;
    return talleresRepository.crear({ ...datos, imageUrl });
  },

  actualizar: (id, datos, archivo) => {
    let imageUrl = datos.imageUrlActual || null;
    if (archivo) imageUrl = `/uploads/${archivo.filename}`;
    return talleresRepository.actualizar(id, { ...datos, imageUrl });
  },

  // Un taller con inscripciones existentes no se puede borrar por la FK
  // (inscripciones.taller_id -> talleres.id, sin ON DELETE). Se traduce ese
  // caso puntual a un HttpError de negocio (mismo status/mensaje que ya
  // devolvía el controller); cualquier otro error se deja subir tal cual.
  eliminar: async (id) => {
    try {
      await talleresRepository.eliminar(id);
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
        throw new HttpError(500, 'No se puede eliminar (tiene inscripciones)');
      }
      throw error;
    }
  },
};
