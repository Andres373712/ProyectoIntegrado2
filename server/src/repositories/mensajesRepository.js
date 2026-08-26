import { desc, sql } from 'drizzle-orm';
import { db } from '../db/client.js';
import { mensajesContacto } from '../db/schema.js';

export const mensajesRepository = {
  crear: ({ nombre, email, telefono, mensaje }) =>
    db.insert(mensajesContacto).values({ nombre, email, telefono: telefono || null, mensaje }),

  getTodos: (paginacion) => {
    let q = db.select().from(mensajesContacto).orderBy(desc(mensajesContacto.fecha_creacion));
    if (paginacion) q = q.limit(paginacion.limit).offset(paginacion.offset);
    return q;
  },

  contarTodos: async () => {
    const filas = await db.select({ total: sql`COUNT(*)` }).from(mensajesContacto);
    return filas[0].total;
  },
};
