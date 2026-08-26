import { talleresRepository } from '../repositories/talleresRepository.js';

const conFormaDeRespuesta = (t) => ({
  ...t,
  imageUrl: t.imageurl,
  cupos_totales: t.cupos_totales || 10,
  cupos_inscritos: t.cupos_inscritos || 0,
});

export const talleresService = {
  getActivos: async () => (await talleresRepository.getActivos()).map(conFormaDeRespuesta),

  getTodos: async () => (await talleresRepository.getTodos()).map(conFormaDeRespuesta),

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

  eliminar: (id) => talleresRepository.eliminar(id),
};
