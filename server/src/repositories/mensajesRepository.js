import { desc, sql } from 'drizzle-orm';
import { db } from '../db/client.js';
import { mensajesContacto } from '../db/schema.js';

export const mensajesRepository = {
  // fecha_creacion se fija acá explícitamente (mismo motivo que
  // pedidosRepository.crear con fecha_pedido): el default de schema.js es la
  // cadena literal 'CURRENT_TIMESTAMP', no la función SQL homónima. Antes de
  // este fix, todas las filas quedaban con ese mismo texto, lo que además
  // hacía inútil el orderBy(desc(fecha_creacion)) de getTodos.
  crear: ({ nombre, email, telefono, mensaje }) =>
    db.insert(mensajesContacto).values({
      nombre,
      email,
      telefono: telefono || null,
      mensaje,
      fecha_creacion: new Date().toISOString(),
    }),

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
