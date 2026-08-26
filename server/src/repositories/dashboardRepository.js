import { eq, sql } from 'drizzle-orm';
import { db } from '../db/client.js';
import { talleres, clientes } from '../db/schema.js';

export const dashboardRepository = {
  getEventosCalendario: () =>
    db
      .select({ title: talleres.nombre, date: talleres.fecha })
      .from(talleres)
      .where(eq(talleres.activo, 1)),

  getTotalClientas: async () => {
    const filas = await db.select({ total: sql`COUNT(${clientes.id})` }).from(clientes);
    return filas[0].total;
  },

  getTotalTalleresActivos: async () => {
    const filas = await db
      .select({ total: sql`COUNT(${talleres.id})` })
      .from(talleres)
      .where(eq(talleres.activo, 1));
    return filas[0].total;
  },
};
