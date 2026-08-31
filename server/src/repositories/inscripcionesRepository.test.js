import { describe, it, expect, vi } from 'vitest';

// Mismo patrón que talleresRepository.test.js. inscripcionesRepository
// importa también talleresRepository (para cancelarInscripcionAtomica), que
// a su vez importa el mismo '../db/client.js' — el mock aplica a los dos
// porque ambos resuelven al mismo módulo.
let db;
vi.mock('../db/client.js', async () => {
  const { crearDbDePrueba } = await import('./testDb.js');
  ({ db } = crearDbDePrueba());
  return { db: new Proxy({}, { get: (_t, prop) => db[prop] }) };
});

const { inscripcionesRepository } = await import('./inscripcionesRepository.js');
const { talleresRepository } = await import('./talleresRepository.js');
const { talleres, clientes } = await import('../db/schema.js');

async function crearTaller(overrides = {}) {
  const resultado = await db
    .insert(talleres)
    .values({ nombre: 'Taller de prueba', activo: 1, cupos_totales: 5, cupos_inscritos: 0, ...overrides })
    .returning({ id: talleres.id });
  return resultado[0].id;
}

async function crearCliente(overrides = {}) {
  const resultado = await db
    .insert(clientes)
    .values({ nombre: 'Clienta de prueba', email: `clienta-${Math.random()}@test.cl`, ...overrides })
    .returning({ id: clientes.id });
  return resultado[0].id;
}

describe('inscripcionesRepository — contra SQLite real', () => {
  it('crear devuelve el id insertado', async () => {
    const tallerId = await crearTaller();
    const clienteId = await crearCliente();
    const id = inscripcionesRepository.crear({ clienteId, tallerId });
    expect(id).toBeGreaterThan(0);
  });

  // El chequeo previo en el service (existeInscripcion) cubre el caso normal;
  // este índice único es la garantía real contra dos inserciones concurrentes
  // con el mismo cliente_id+taller_id — acá se prueba que el índice existe de
  // verdad en la base (migración 0003), no solo en el schema.js.
  it('el índice único (cliente_id, taller_id) rechaza una inscripción duplicada', async () => {
    const tallerId = await crearTaller();
    const clienteId = await crearCliente();
    inscripcionesRepository.crear({ clienteId, tallerId });

    expect(() => inscripcionesRepository.crear({ clienteId, tallerId })).toThrow(
      /UNIQUE constraint failed/,
    );
  });

  it('el mismo cliente sí puede inscribirse a dos talleres distintos', async () => {
    const clienteId = await crearCliente();
    const tallerA = await crearTaller({ nombre: 'Taller A' });
    const tallerB = await crearTaller({ nombre: 'Taller B' });

    expect(() => inscripcionesRepository.crear({ clienteId, tallerId: tallerA })).not.toThrow();
    expect(() => inscripcionesRepository.crear({ clienteId, tallerId: tallerB })).not.toThrow();
  });

  describe('cancelarInscripcionAtomica', () => {
    it('borra la inscripción y decrementa cupos_inscritos del taller, juntos', async () => {
      const tallerId = await crearTaller({ cupos_inscritos: 1 });
      const clienteId = await crearCliente();
      const inscripcionId = inscripcionesRepository.crear({ clienteId, tallerId });

      inscripcionesRepository.cancelarInscripcionAtomica(inscripcionId, tallerId);

      const inscripcion = await inscripcionesRepository.getPorIdYCliente(inscripcionId, clienteId);
      expect(inscripcion).toBeUndefined();

      const taller = await talleresRepository.getById(tallerId);
      expect(taller.cupos_inscritos).toBe(0);
    });
  });
});
