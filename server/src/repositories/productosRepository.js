import { eq, desc, sql } from 'drizzle-orm';
import { db } from '../db/client.js';
import { productos } from '../db/schema.js';

export const productosRepository = {
  getActivos: (paginacion) => {
    let q = db.select().from(productos).where(eq(productos.activo, 1)).orderBy(desc(productos.id));
    if (paginacion) q = q.limit(paginacion.limit).offset(paginacion.offset);
    return q;
  },

  contarActivos: async () => {
    const filas = await db.select({ total: sql`COUNT(*)` }).from(productos).where(eq(productos.activo, 1));
    return filas[0].total;
  },

  getTodos: (paginacion) => {
    let q = db.select().from(productos).orderBy(desc(productos.id));
    if (paginacion) q = q.limit(paginacion.limit).offset(paginacion.offset);
    return q;
  },

  contarTodos: async () => {
    const filas = await db.select({ total: sql`COUNT(*)` }).from(productos);
    return filas[0].total;
  },

  crear: (datos) =>
    db.insert(productos).values({
      nombre: datos.nombre,
      descripcion: datos.descripcion || '',
      precio: datos.precio,
      stock: datos.stock,
      activo: 1,
      imageurl: datos.imageUrl,
    }),

  eliminar: (id) => db.delete(productos).where(eq(productos.id, id)),
};
