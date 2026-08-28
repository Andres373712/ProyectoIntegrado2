import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../repositories/inscripcionesRepository.js', () => ({
  inscripcionesRepository: { getPorClienteId: vi.fn() },
}));

const { inscripcionesRepository } = await import('../repositories/inscripcionesRepository.js');
const { clienteService } = await import('./clienteService.js');

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
