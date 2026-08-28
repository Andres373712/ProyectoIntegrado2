import { eq, desc } from 'drizzle-orm';
import { db } from '../db/client.js';
import { inscripciones, talleres } from '../db/schema.js';

export const inscripcionesRepository = {
  crear: ({ clienteId, tallerId }) =>
    db.insert(inscripciones).values({ cliente_id: clienteId, taller_id: tallerId }),

  getPorClienteId: (clienteId) =>
    db
      .select({
        id: inscripciones.id,
        fechaInscripcion: inscripciones.fecha_inscripcion,
        tallerId: talleres.id,
        taller: talleres.nombre,
        fecha: talleres.fecha,
        lugar: talleres.lugar,
        tallerActivo: talleres.activo,
      })
      .from(inscripciones)
      .innerJoin(talleres, eq(inscripciones.taller_id, talleres.id))
      .where(eq(inscripciones.cliente_id, clienteId))
      .orderBy(desc(talleres.fecha)),
};
