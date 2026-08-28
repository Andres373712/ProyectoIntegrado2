import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../repositories/inscripcionesRepository.js', () => ({
  inscripcionesRepository: {
    getPorClienteId: vi.fn(),
    getPorIdYCliente: vi.fn(),
    eliminarPorId: vi.fn(),
  },
}));
vi.mock('../repositories/talleresRepository.js', () => ({
  talleresRepository: { decrementarCuposInscritos: vi.fn() },
}));
// db.transaction de better-sqlite3 es síncrono: ejecuta el callback y
// devuelve su resultado directamente.
vi.mock('../db/client.js', () => ({
  db: { transaction: vi.fn((cb) => cb()) },
}));

const { inscripcionesRepository } = await import('../repositories/inscripcionesRepository.js');
const { talleresRepository } = await import('../repositories/talleresRepository.js');
const { db } = await import('../db/client.js');
const { clienteService } = await import('./clienteService.js');
const { HttpError } = await import('../utils/httpError.js');

describe('clienteService.getMisInscripciones', () => {
  beforeEach(() => vi.clearAllMocks());

  it('pide al repositorio las inscripciones del cliente autenticado', async () => {
    inscripcionesRepository.getPorClienteId.mockResolvedValue([]);

    await clienteService.getMisInscripciones(42);

    expect(inscripcionesRepository.getPorClienteId).toHaveBeenCalledWith(42);
  });

  it('mapea cada fila a la forma pública (id, taller, fecha, lugar, estado)', async () => {
    inscripcionesRepository.getPorClienteId.mockResolvedValue([
      {
        id: 1,
        tallerId: 10,
        taller: 'Yoga restaurativo',
        fecha: '2099-01-01',
        lugar: 'Sala 1',
        fechaInscripcion: '2026-01-01 10:00:00',
        tallerActivo: 1,
      },
    ]);

    const [resultado] = await clienteService.getMisInscripciones(1);

    expect(resultado).toEqual({
      id: 1,
      tallerId: 10,
      taller: 'Yoga restaurativo',
      fecha: '2099-01-01',
      lugar: 'Sala 1',
      estado: 'proximo',
      fechaInscripcion: '2026-01-01 10:00:00',
    });
  });

  it('marca como "realizado" un taller cuya fecha ya pasó', async () => {
    inscripcionesRepository.getPorClienteId.mockResolvedValue([
      { id: 2, tallerId: 11, taller: 'Meditación', fecha: '2000-01-01', lugar: 'Sala 2', fechaInscripcion: null },
    ]);

    const [resultado] = await clienteService.getMisInscripciones(1);

    expect(resultado.estado).toBe('realizado');
  });

  it('trata un taller sin fecha cargada como "proximo"', async () => {
    inscripcionesRepository.getPorClienteId.mockResolvedValue([
      { id: 3, tallerId: 12, taller: 'Pilates', fecha: null, lugar: 'Sala 3', fechaInscripcion: null },
    ]);

    const [resultado] = await clienteService.getMisInscripciones(1);

    expect(resultado.estado).toBe('proximo');
  });

  it('devuelve un arreglo vacío si el cliente no tiene inscripciones', async () => {
    inscripcionesRepository.getPorClienteId.mockResolvedValue([]);

    await expect(clienteService.getMisInscripciones(999)).resolves.toEqual([]);
  });
});

describe('clienteService.cancelarInscripcion', () => {
  beforeEach(() => vi.clearAllMocks());

  it('lanza 404 si la inscripción no existe o no pertenece al cliente', async () => {
    inscripcionesRepository.getPorIdYCliente.mockResolvedValue(undefined);

    await expect(clienteService.cancelarInscripcion(1, 55)).rejects.toMatchObject({
      status: 404,
      message: 'Inscripción no encontrada',
    });
    expect(inscripcionesRepository.eliminarPorId).not.toHaveBeenCalled();
    expect(talleresRepository.decrementarCuposInscritos).not.toHaveBeenCalled();
  });

  it('busca la inscripción filtrando por el cliente autenticado (no por id solo)', async () => {
    inscripcionesRepository.getPorIdYCliente.mockResolvedValue({ id: 55, tallerId: 10 });

    await clienteService.cancelarInscripcion(1, 55);

    expect(inscripcionesRepository.getPorIdYCliente).toHaveBeenCalledWith(55, 1);
  });

  it('borra la inscripción y decrementa cupos_inscritos del taller dentro de una transacción', async () => {
    inscripcionesRepository.getPorIdYCliente.mockResolvedValue({ id: 55, tallerId: 10 });

    await clienteService.cancelarInscripcion(1, 55);

    expect(db.transaction).toHaveBeenCalledTimes(1);
    expect(inscripcionesRepository.eliminarPorId).toHaveBeenCalledWith(55);
    expect(talleresRepository.decrementarCuposInscritos).toHaveBeenCalledWith(10);
  });
});

describe('HttpError', () => {
  it('expone status y message', () => {
    const err = new HttpError(404, 'no encontrado');
    expect(err.status).toBe(404);
    expect(err.message).toBe('no encontrado');
  });
});
