import { eq, desc } from 'drizzle-orm';
import { db } from '../db/client.js';
import { productos } from '../db/schema.js';

export const productosRepository = {
  getActivos: () => db.select().from(productos).where(eq(productos.activo, 1)).orderBy(desc(productos.id)),

  getTodos: () => db.select().from(productos).orderBy(desc(productos.id)),

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
