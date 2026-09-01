import { eq, and, or, like, gte, lte, inArray, desc, sql } from 'drizzle-orm';
import { db } from '../db/client.js';
import { clientes, inscripciones } from '../db/schema.js';

// Columnas seguras para exponer fuera del backend (admin/CRM, "Mi Cuenta"):
// nunca password_hash, token_verificacion ni token_recuperacion.
const CAMPOS_PUBLICOS = {
  id: clientes.id,
  nombre: clientes.nombre,
  email: clientes.email,
  telefono: clientes.telefono,
  intereses: clientes.intereses,
  fecha_registro: clientes.fecha_registro,
};

export const clientesRepository = {
  getByEmail: async (email) => {
    const filas = await db.select().from(clientes).where(eq(clientes.email, email));
    return filas[0];
  },

  // Antes seleccionaba todas las columnas (incluidas password_hash y los
  // tokens) — sin callers hasta ahora, así que no había fuga real, pero
  // exponerlo tal cual al CRM de admin sí lo sería. Restringido a los campos
  // públicos del cliente.
  getById: async (id) => {
    const filas = await db.select(CAMPOS_PUBLICOS).from(clientes).where(eq(clientes.id, id));
    return filas[0];
  },

  // Listado del CRM de admin con filtros todos opcionales. tallerId filtra a
  // quienes tienen alguna inscripción en ese taller; total_inscripciones
  // siempre cuenta TODAS las inscripciones de cada clienta devuelta (no solo
  // las del taller filtrado) — es una cifra de contexto general, no del
  // filtro aplicado.
  getConFiltros: async ({ buscar, fechaInicio, fechaFin, tallerId } = {}) => {
    const condiciones = [];
    if (buscar) {
      const patron = `%${buscar}%`;
      condiciones.push(or(like(clientes.nombre, patron), like(clientes.email, patron)));
    }
    if (fechaInicio) condiciones.push(gte(clientes.fecha_registro, fechaInicio));
    if (fechaFin) condiciones.push(lte(clientes.fecha_registro, fechaFin));

    if (tallerId) {
      const inscritas = await db
        .select({ clienteId: inscripciones.cliente_id })
        .from(inscripciones)
        .where(eq(inscripciones.taller_id, Number(tallerId)));
      const idsInscritas = [...new Set(inscritas.map((f) => f.clienteId))];
      if (idsInscritas.length === 0) return [];
      condiciones.push(inArray(clientes.id, idsInscritas));
    }

    let consulta = db.select(CAMPOS_PUBLICOS).from(clientes).orderBy(desc(clientes.id));
    if (condiciones.length > 0) consulta = consulta.where(and(...condiciones));
    const filasClientes = await consulta;
    if (filasClientes.length === 0) return [];

    const idsClientes = filasClientes.map((c) => c.id);
    const conteos = await db
      .select({ clienteId: inscripciones.cliente_id, total: sql`COUNT(*)` })
      .from(inscripciones)
      .where(inArray(inscripciones.cliente_id, idsClientes))
      .groupBy(inscripciones.cliente_id);
    const totalPorCliente = new Map(conteos.map((c) => [c.clienteId, c.total]));

    return filasClientes.map((c) => ({ ...c, total_inscripciones: totalPorCliente.get(c.id) || 0 }));
  },

  // Campos editables desde la ficha de la clienta en el CRM de admin. Email
  // tiene UNIQUE en la tabla — un duplicado sube como
  // SQLITE_CONSTRAINT_UNIQUE, lo traduce clientesAdminService.
  actualizarDatosAdmin: (id, { nombre, email, telefono, intereses }) =>
    db.update(clientes).set({ nombre, email, telefono, intereses }).where(eq(clientes.id, id)),

  getByTokenVerificacion: async (token) => {
    const filas = await db
      .select({ id: clientes.id })
      .from(clientes)
      .where(eq(clientes.token_verificacion, token));
    return filas[0];
  },

  // fecha_registro se fija acá explícitamente (igual que pedidosRepository.crear
  // con fecha_pedido): el default de schema.js es la cadena literal
  // 'CURRENT_TIMESTAMP', no la función SQL homónima, así que sin esto la
  // columna queda con ese texto en vez de una fecha real.
  crearDesdeInscripcion: async ({ nombre, email, telefono, intereses }) => {
    const resultado = await db
      .insert(clientes)
      .values({ nombre, email, telefono, intereses, fecha_registro: new Date().toISOString() })
      .returning({ id: clientes.id });
    return resultado[0];
  },

  crearParaRegistro: ({ nombre, email, telefono, passwordHash, tokenVerificacion }) =>
    db.insert(clientes).values({
      nombre,
      email,
      telefono,
      password_hash: passwordHash,
      token_verificacion: tokenVerificacion,
      verificado: 0,
      acepta_terminos: 1,
      rol: 'cliente',
      fecha_registro: new Date().toISOString(),
    }),

  actualizarParaRegistro: (id, { nombre, telefono, passwordHash, tokenVerificacion }) =>
    db
      .update(clientes)
      .set({
        nombre,
        telefono,
        password_hash: passwordHash,
        token_verificacion: tokenVerificacion,
        verificado: 0,
        acepta_terminos: 1,
      })
      .where(eq(clientes.id, id)),

  marcarVerificado: (id) =>
    db.update(clientes).set({ verificado: 1, token_verificacion: null }).where(eq(clientes.id, id)),

  getByTokenRecuperacion: async (token) => {
    const filas = await db.select().from(clientes).where(eq(clientes.token_recuperacion, token));
    return filas[0];
  },

  guardarTokenRecuperacion: (id, { token, expiracion }) =>
    db
      .update(clientes)
      .set({ token_recuperacion: token, expiracion_recuperacion: expiracion })
      .where(eq(clientes.id, id)),

  actualizarPassword: (id, passwordHash) =>
    db
      .update(clientes)
      .set({ password_hash: passwordHash, token_recuperacion: null, expiracion_recuperacion: null })
      .where(eq(clientes.id, id)),
};
