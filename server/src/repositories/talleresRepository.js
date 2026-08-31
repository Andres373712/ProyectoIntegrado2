import { eq, desc, asc, sql, and } from 'drizzle-orm';
import { db } from '../db/client.js';
import { talleres } from '../db/schema.js';

// Misma regla de "hay cupo" que ya aplica el service (cupos_totales||10 -
// cupos_inscritos > 0), expresada en SQL para poder filtrar sin traer todo.
const condicionConCupos = sql`(COALESCE(NULLIF(${talleres.cupos_totales}, 0), 10) - COALESCE(${talleres.cupos_inscritos}, 0)) > 0`;

const condicionesActivos = (filtros) => {
  const condiciones = [eq(talleres.activo, 1)];
  if (filtros?.tipo) condiciones.push(eq(talleres.tipo, filtros.tipo));
  if (filtros?.soloConCupos) condiciones.push(condicionConCupos);
  return and(...condiciones);
};

export const talleresRepository = {
  getActivos: (paginacion, filtros) => {
    let q = db.select().from(talleres).where(condicionesActivos(filtros)).orderBy(asc(talleres.fecha));
    if (paginacion) q = q.limit(paginacion.limit).offset(paginacion.offset);
    return q;
  },

  contarActivos: async (filtros) => {
    const filas = await db.select({ total: sql`COUNT(*)` }).from(talleres).where(condicionesActivos(filtros));
    return filas[0].total;
  },

  getTodos: (paginacion) => {
    let q = db.select().from(talleres).orderBy(desc(talleres.fecha));
    if (paginacion) q = q.limit(paginacion.limit).offset(paginacion.offset);
    return q;
  },

  contarTodos: async () => {
    const filas = await db.select({ total: sql`COUNT(*)` }).from(talleres);
    return filas[0].total;
  },

  getById: async (id) => {
    const filas = await db.select().from(talleres).where(eq(talleres.id, id));
    return filas[0];
  },

  crear: (datos) =>
    db.insert(talleres).values({
      nombre: datos.nombre,
      descripcion: datos.descripcion || '',
      fecha: datos.fecha,
      tipo: datos.tipo,
      precio: datos.precio,
      activo: 1,
      imageurl: datos.imageUrl,
      lugar: datos.lugar || '',
      cupos_totales: datos.cupos_totales,
      cupos_inscritos: 0,
    }),

  actualizar: (id, datos) =>
    db
      .update(talleres)
      .set({
        nombre: datos.nombre,
        descripcion: datos.descripcion,
        fecha: datos.fecha,
        tipo: datos.tipo,
        precio: datos.precio,
        // datos.activo ya llega normalizado a 0/1 desde tallerActualizarSchema
        // (ver taller.schema.js) — nunca el string crudo "true"/"false".
        activo: datos.activo,
        imageurl: datos.imageUrl,
        lugar: datos.lugar,
        cupos_totales: datos.cupos_totales,
      })
      .where(eq(talleres.id, id)),

  eliminar: (id) => db.delete(talleres).where(eq(talleres.id, id)),

  // Incrementa cupos_inscritos en una única sentencia UPDATE atómica: el
  // WHERE reevalúa "hay cupo" contra el estado actual de la fila en el mismo
  // paso que el incremento, así que dos inscripciones concurrentes para el
  // último cupo no pueden pasar ambas — SQLite serializa los UPDATE sobre la
  // misma fila. Se ejecuta con `.run()` (no se awaitea) para que funcione
  // tanto suelta como dentro de un `db.transaction(...)` síncrono de
  // better-sqlite3. Devuelve true solo si la fila realmente cambió
  // (`changes > 0`) — esa es la señal real de "quedaba cupo", no el chequeo
  // previo con getById (que puede quedar desactualizado entre el chequeo y
  // el incremento).
  incrementarCuposInscritos: (id) => {
    const resultado = db
      .update(talleres)
      .set({ cupos_inscritos: sql`${talleres.cupos_inscritos} + 1` })
      .where(and(eq(talleres.id, id), condicionConCupos))
      .run();
    return resultado.changes > 0;
  },

  // Simétrico al anterior: decrementa sin bajar de 0 (MAX(...,0) es la forma
  // escalar de MAX en SQLite cuando se le pasan 2+ argumentos, no la
  // agregada). También síncrono vía `.run()` para poder usarse dentro de una
  // transacción de better-sqlite3.
  decrementarCuposInscritos: (id) => {
    const resultado = db
      .update(talleres)
      .set({ cupos_inscritos: sql`MAX(${talleres.cupos_inscritos} - 1, 0)` })
      .where(eq(talleres.id, id))
      .run();
    return resultado.changes > 0;
  },
};
