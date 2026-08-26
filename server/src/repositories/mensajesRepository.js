import { desc } from 'drizzle-orm';
import { db } from '../db/client.js';
import { mensajesContacto } from '../db/schema.js';

export const mensajesRepository = {
  crear: ({ nombre, email, telefono, mensaje }) =>
    db.insert(mensajesContacto).values({ nombre, email, telefono: telefono || null, mensaje }),

  getTodos: () => db.select().from(mensajesContacto).orderBy(desc(mensajesContacto.fecha_creacion)),
};
