import { eq, and, gte, desc, sql } from 'drizzle-orm';
import { db } from '../db/client.js';
import { productos } from '../db/schema.js';

export const productosRepository = {
  getById: async (id) => {
    const filas = await db.select().from(productos).where(eq(productos.id, id));
    return filas[0];
  },

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

  // UPDATE atómico: la condición "stock >= cantidad" va en el propio WHERE,
  // así que si dos pedidos concurrentes descuentan el mismo producto, como
  // mucho uno de los dos ve "changes: 0" (sin importar el orden en que
  // lleguen) — misma clase de condición de carrera que ya se resuelve para
  // cupos de talleres. Se usa .run() (sync) en vez de await para poder
  // llamarse dentro del callback síncrono de db.transaction() de
  // better-sqlite3; recibe "tx" para poder pasarle la transacción activa.
  descontarStock: (id, cantidad, tx = db) =>
    tx
      .update(productos)
      .set({ stock: sql`${productos.stock} - ${cantidad}` })
      .where(and(eq(productos.id, id), gte(productos.stock, cantidad)))
      .run(),
};
