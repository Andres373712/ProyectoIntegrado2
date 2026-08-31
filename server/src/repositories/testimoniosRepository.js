import { eq, desc, sql } from 'drizzle-orm';
import { db } from '../db/client.js';
import { testimonios } from '../db/schema.js';

export const testimoniosRepository = {
  getActivos: (paginacion) => {
    let q = db.select().from(testimonios).where(eq(testimonios.activo, 1)).orderBy(desc(testimonios.id));
    if (paginacion) q = q.limit(paginacion.limit).offset(paginacion.offset);
    return q;
  },

  contarActivos: async () => {
    const filas = await db.select({ total: sql`COUNT(*)` }).from(testimonios).where(eq(testimonios.activo, 1));
    return filas[0].total;
  },

  getTodos: (paginacion) => {
    let q = db.select().from(testimonios).orderBy(desc(testimonios.id));
    if (paginacion) q = q.limit(paginacion.limit).offset(paginacion.offset);
    return q;
  },

  contarTodos: async () => {
    const filas = await db.select({ total: sql`COUNT(*)` }).from(testimonios);
    return filas[0].total;
  },

  getById: async (id) => {
    const filas = await db.select().from(testimonios).where(eq(testimonios.id, id));
    return filas[0];
  },

  // fecha_creacion se fija acá explícitamente (mismo motivo que
  // pedidosRepository.crear con fecha_pedido): el default de schema.js es la
  // cadena literal 'CURRENT_TIMESTAMP', no la función SQL homónima.
  crear: (datos) =>
    db.insert(testimonios).values({
      nombre: datos.nombre,
      curso: datos.curso || '',
      comentario: datos.comentario,
      calificacion: datos.calificacion,
      activo: 1,
      fecha_creacion: new Date().toISOString(),
    }),

  actualizar: (id, datos) =>
    db
      .update(testimonios)
      .set({
        nombre: datos.nombre,
        curso: datos.curso,
        comentario: datos.comentario,
        calificacion: datos.calificacion,
        activo: datos.activo,
      })
      .where(eq(testimonios.id, id)),

  eliminar: (id) => db.delete(testimonios).where(eq(testimonios.id, id)),
};
