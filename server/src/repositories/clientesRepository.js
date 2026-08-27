import { eq } from 'drizzle-orm';
import { db } from '../db/client.js';
import { clientes } from '../db/schema.js';

export const clientesRepository = {
  getByEmail: async (email) => {
    const filas = await db.select().from(clientes).where(eq(clientes.email, email));
    return filas[0];
  },

  getById: async (id) => {
    const filas = await db.select().from(clientes).where(eq(clientes.id, id));
    return filas[0];
  },

  getByTokenVerificacion: async (token) => {
    const filas = await db
      .select({ id: clientes.id })
      .from(clientes)
      .where(eq(clientes.token_verificacion, token));
    return filas[0];
  },

  crearDesdeInscripcion: async ({ nombre, email, telefono, intereses }) => {
    const resultado = await db
      .insert(clientes)
      .values({ nombre, email, telefono, intereses })
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
