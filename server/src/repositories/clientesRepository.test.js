import { describe, it, expect, vi } from 'vitest';

let db;
vi.mock('../db/client.js', async () => {
  const { crearDbDePrueba } = await import('./testDb.js');
  ({ db } = crearDbDePrueba());
  return { db: new Proxy({}, { get: (_t, prop) => db[prop] }) };
});

const { clientesRepository } = await import('./clientesRepository.js');
const { clientes, talleres, inscripciones } = await import('../db/schema.js');

async function crearCliente(overrides = {}) {
  const resultado = await db
    .insert(clientes)
    .values({
      nombre: 'Clienta de prueba',
      email: `clienta-${Math.random()}@test.cl`,
      fecha_registro: new Date().toISOString(),
      password_hash: 'hash-secreto-no-debe-salir',
      // token_verificacion tiene UNIQUE en la tabla: cada fila necesita un
      // valor propio (o ninguno) para no chocar entre tests.
      token_verificacion: `token-${Math.random()}`,
      ...overrides,
    })
    .returning({ id: clientes.id });
  return resultado[0].id;
}

async function crearTaller(overrides = {}) {
  const resultado = await db
    .insert(talleres)
    .values({ nombre: 'Taller de prueba', activo: 1, ...overrides })
    .returning({ id: talleres.id });
  return resultado[0].id;
}

describe('clientesRepository — contra SQLite real', () => {
  it('getById nunca devuelve password_hash ni tokens', async () => {
    const id = await crearCliente({ nombre: 'Ana' });
    const cliente = await clientesRepository.getById(id);
    expect(cliente.nombre).toBe('Ana');
    expect(cliente).not.toHaveProperty('password_hash');
    expect(cliente).not.toHaveProperty('token_verificacion');
    expect(cliente).not.toHaveProperty('token_recuperacion');
  });

  describe('getConFiltros', () => {
    it('buscar matchea por nombre o email, sin distinguir mayúsculas', async () => {
      await crearCliente({ nombre: 'Camila Rojas', email: 'camila@test.cl' });
      await crearCliente({ nombre: 'Beatriz Soto', email: 'beatriz@test.cl' });

      const porNombre = await clientesRepository.getConFiltros({ buscar: 'camila' });
      expect(porNombre.map((c) => c.nombre)).toEqual(['Camila Rojas']);

      const porEmail = await clientesRepository.getConFiltros({ buscar: 'BEATRIZ@TEST' });
      expect(porEmail.map((c) => c.nombre)).toEqual(['Beatriz Soto']);
    });

    it('filtra por rango de fecha_registro (inclusivo en ambos extremos)', async () => {
      await crearCliente({ nombre: 'Fuera de rango (antes)', fecha_registro: '2026-01-01T00:00:00.000Z' });
      await crearCliente({ nombre: 'Dentro de rango', fecha_registro: '2026-06-15T12:00:00.000Z' });
      await crearCliente({ nombre: 'Fuera de rango (después)', fecha_registro: '2026-12-31T00:00:00.000Z' });

      const resultado = await clientesRepository.getConFiltros({
        fechaInicio: '2026-06-01',
        // El service (clientesAdminService) es quien extiende fechaFin al
        // final del día — acá se prueba el repositorio con el valor ya
        // extendido, tal como lo recibe en producción.
        fechaFin: '2026-06-30T23:59:59.999Z',
      });
      expect(resultado.map((c) => c.nombre)).toEqual(['Dentro de rango']);
    });

    it('tallerId filtra a las clientas inscritas en ese taller', async () => {
      const tallerA = await crearTaller({ nombre: 'Resina' });
      const tallerB = await crearTaller({ nombre: 'Yoga' });
      const idInscritaEnA = await crearCliente({ nombre: 'Inscrita en A' });
      const idInscritaEnB = await crearCliente({ nombre: 'Inscrita en B' });
      await db.insert(inscripciones).values({ cliente_id: idInscritaEnA, taller_id: tallerA });
      await db.insert(inscripciones).values({ cliente_id: idInscritaEnB, taller_id: tallerB });

      const resultado = await clientesRepository.getConFiltros({ tallerId: String(tallerA) });
      expect(resultado.map((c) => c.nombre)).toEqual(['Inscrita en A']);
    });

    it('total_inscripciones cuenta TODAS las inscripciones, no solo las del taller filtrado', async () => {
      const tallerA = await crearTaller({ nombre: 'Resina' });
      const tallerB = await crearTaller({ nombre: 'Yoga' });
      const clienteId = await crearCliente({ nombre: 'Clienta con dos talleres' });
      await db.insert(inscripciones).values({ cliente_id: clienteId, taller_id: tallerA });
      await db.insert(inscripciones).values({ cliente_id: clienteId, taller_id: tallerB });

      const resultado = await clientesRepository.getConFiltros({ tallerId: String(tallerA) });
      expect(resultado).toHaveLength(1);
      expect(resultado[0].total_inscripciones).toBe(2);
    });

    it('sin ningún filtro, devuelve (entre otras) a las clientas recién creadas', async () => {
      // No se asume que la tabla esté vacía: los demás tests del archivo
      // comparten la misma base en memoria y ya insertaron sus propias filas.
      const idA = await crearCliente({ nombre: 'Sin filtro A' });
      const idB = await crearCliente({ nombre: 'Sin filtro B' });
      const resultado = await clientesRepository.getConFiltros({});
      const ids = resultado.map((c) => c.id);
      expect(ids).toEqual(expect.arrayContaining([idA, idB]));
    });
  });

  describe('actualizarDatosAdmin', () => {
    it('actualiza los campos editables', async () => {
      const id = await crearCliente({ nombre: 'Nombre viejo' });
      await clientesRepository.actualizarDatosAdmin(id, {
        nombre: 'Nombre nuevo',
        email: 'nuevo@test.cl',
        telefono: '912345678',
        intereses: 'resina, velas',
      });
      const actualizado = await clientesRepository.getById(id);
      expect(actualizado.nombre).toBe('Nombre nuevo');
      expect(actualizado.email).toBe('nuevo@test.cl');
    });

    it('un email duplicado dispara la restricción UNIQUE real de la tabla', async () => {
      await crearCliente({ email: 'ocupado@test.cl' });
      const id2 = await crearCliente({ email: 'libre@test.cl' });

      await expect(
        clientesRepository.actualizarDatosAdmin(id2, {
          nombre: 'Da igual',
          email: 'ocupado@test.cl',
          telefono: '',
          intereses: '',
        }),
      ).rejects.toThrow(/UNIQUE constraint failed/);
    });
  });
});
