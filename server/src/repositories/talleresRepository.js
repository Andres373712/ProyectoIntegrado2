import { eq, desc, asc, sql } from 'drizzle-orm';
import { db } from '../db/client.js';
import { talleres } from '../db/schema.js';

export const talleresRepository = {
  getActivos: () => db.select().from(talleres).where(eq(talleres.activo, 1)).orderBy(asc(talleres.fecha)),

  getTodos: () => db.select().from(talleres).orderBy(desc(talleres.fecha)),

  getById: async (id) => {
    const filas = await db.select().from(talleres).where(eq(talleres.id, id));
    return filas[0];
  },

  crear: (datos) =>
    db.insert(talleres).values({
      nombre: datos.nombre,
      descripcion: datos.descripcion || '',
      fecha: datos.fecha,
      tipo: datos.tipo,
      precio: datos.precio,
      activo: 1,
      imageurl: datos.imageUrl,
      lugar: datos.lugar || '',
      cupos_totales: datos.cupos_totales,
      cupos_inscritos: 0,
    }),

  actualizar: (id, datos) =>
    db
      .update(talleres)
      .set({
        nombre: datos.nombre,
        descripcion: datos.descripcion,
        fecha: datos.fecha,
        tipo: datos.tipo,
        precio: datos.precio,
        // Se mantiene el mismo comportamiento que antes: se guarda el valor
        // crudo recibido (string "true"/"false" desde FormData), sin normalizar.
        activo: datos.activo,
        imageurl: datos.imageUrl,
        lugar: datos.lugar,
        cupos_totales: datos.cupos_totales,
      })
      .where(eq(talleres.id, id)),

  eliminar: (id) => db.delete(talleres).where(eq(talleres.id, id)),

  incrementarCuposInscritos: (id) =>
    db
      .update(talleres)
      .set({ cupos_inscritos: sql`${talleres.cupos_inscritos} + 1` })
      .where(eq(talleres.id, id)),
};
