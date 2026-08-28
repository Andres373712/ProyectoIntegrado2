import { eq, and, desc } from 'drizzle-orm';
import { db } from '../db/client.js';
import { inscripciones, talleres } from '../db/schema.js';

export const inscripcionesRepository = {
  // Se ejecuta con `.run()` (sin await) para poder usarse tanto suelta como
  // dentro de un `db.transaction(...)` síncrono de better-sqlite3 — un
  // insert sin `.run()`/await nunca llega a ejecutarse si nadie lo espera.
  crear: ({ clienteId, tallerId }) =>
    db.insert(inscripciones).values({ cliente_id: clienteId, taller_id: tallerId }).run(),

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

  // Trae la inscripción solo si pertenece al cliente dado — así el service
  // puede devolver 404 tanto si el id no existe como si existe pero es de
  // otra persona, sin filtrar cuál es el caso.
  getPorIdYCliente: async (id, clienteId) => {
    const filas = await db
      .select({ id: inscripciones.id, tallerId: inscripciones.taller_id })
      .from(inscripciones)
      .where(and(eq(inscripciones.id, id), eq(inscripciones.cliente_id, clienteId)));
    return filas[0];
  },

  // Igual que `crear`: `.run()` para ejecutar síncronamente dentro de la
  // transacción que también decrementa cupos_inscritos del taller.
  eliminarPorId: (id) => db.delete(inscripciones).where(eq(inscripciones.id, id)).run(),
};
