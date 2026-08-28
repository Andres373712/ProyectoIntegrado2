import { eq, and, desc } from 'drizzle-orm';
import { db } from '../db/client.js';
import { inscripciones, talleres, clientes } from '../db/schema.js';
import { talleresRepository } from './talleresRepository.js';

export const inscripcionesRepository = {
  // Se ejecuta con `.run()` (sin await) para poder usarse tanto suelta como
  // dentro de un `db.transaction(...)` síncrono de better-sqlite3 — un
  // insert sin `.run()`/await nunca llega a ejecutarse si nadie lo espera.
  // Devuelve el id insertado (mismo patrón que pedidosRepository.crear) para
  // que el service pueda firmar un token de cancelación referido a esta fila.
  crear: ({ clienteId, tallerId }) => {
    const resultado = db
      .insert(inscripciones)
      .values({ cliente_id: clienteId, taller_id: tallerId })
      .run();
    return resultado.lastInsertRowid;
  },

  // Chequeo previo (no atómico) de duplicado: da un mensaje 409 claro en el
  // caso común. El índice único (cliente_id, taller_id) en la base de datos
  // es la fuente de verdad real contra dos inscripciones concurrentes al
  // mismo taller — ver el catch de SQLITE_CONSTRAINT_UNIQUE en
  // inscripcionService.inscribir.
  existeInscripcion: async (clienteId, tallerId) => {
    const filas = await db
      .select({ id: inscripciones.id })
      .from(inscripciones)
      .where(and(eq(inscripciones.cliente_id, clienteId), eq(inscripciones.taller_id, tallerId)));
    return filas.length > 0;
  },

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

  // A diferencia de getPorIdYCliente, esta busca por SOLO el id de la
  // inscripción (sin filtrar por cliente) — la usa el flujo de cancelación
  // anónima por link de correo (server/src/services/inscripcionService.js:
  // cancelarPorToken), donde quien cancela no está autenticado y la
  // identidad ya la garantizó la firma del JWT, no una sesión. Trae también
  // el nombre del taller y el nombre del cliente (vía join) porque el
  // endpoint responde ambos en el mensaje de éxito.
  getPorId: async (id) => {
    const filas = await db
      .select({
        id: inscripciones.id,
        tallerId: inscripciones.taller_id,
        taller: talleres.nombre,
        nombreCliente: clientes.nombre,
      })
      .from(inscripciones)
      .innerJoin(talleres, eq(inscripciones.taller_id, talleres.id))
      .innerJoin(clientes, eq(inscripciones.cliente_id, clientes.id))
      .where(eq(inscripciones.id, id));
    return filas[0];
  },

  // Lógica atómica compartida entre la cancelación autenticada (Mi Cuenta,
  // clienteService.cancelarInscripcion) y la cancelación anónima por link de
  // correo (inscripcionService.cancelarPorToken): borrar la fila y liberar el
  // cupo del taller tienen que ocurrir juntos o no ocurrir, para que un cupo
  // liberado siempre quede reflejado de forma consistente. Vive acá (en vez
  // de en cada service) para no duplicar el `db.transaction(...)` en los dos
  // llamadores.
  cancelarInscripcionAtomica: (id, tallerId) =>
    db.transaction(() => {
      inscripcionesRepository.eliminarPorId(id);
      talleresRepository.decrementarCuposInscritos(tallerId);
    }),
};
