import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../repositories/clientesRepository.js', () => ({
  clientesRepository: {
    getConFiltros: vi.fn(),
    getById: vi.fn(),
    actualizarDatosAdmin: vi.fn(),
  },
}));
vi.mock('../repositories/inscripcionesRepository.js', () => ({
  inscripcionesRepository: { getPorClienteId: vi.fn() },
}));
vi.mock('../repositories/notasFidelizacionRepository.js', () => ({
  notasFidelizacionRepository: { getPorClienteId: vi.fn(), crear: vi.fn() },
}));

const { clientesRepository } = await import('../repositories/clientesRepository.js');
const { inscripcionesRepository } = await import('../repositories/inscripcionesRepository.js');
const { notasFidelizacionRepository } = await import('../repositories/notasFidelizacionRepository.js');
const { clientesAdminService } = await import('./clientesAdminService.js');
const { HttpError } = await import('../utils/httpError.js');

describe('clientesAdminService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('getConFiltros extiende fechaFin al final del día antes de pasarla al repositorio', async () => {
    clientesRepository.getConFiltros.mockResolvedValue([]);
    await clientesAdminService.getConFiltros({ buscar: 'ana', fechaFin: '2026-08-31' });
    expect(clientesRepository.getConFiltros).toHaveBeenCalledWith({
      buscar: 'ana',
      fechaFin: '2026-08-31T23:59:59.999Z',
    });
  });

  it('getConFiltros no toca fechaFin si no viene', async () => {
    clientesRepository.getConFiltros.mockResolvedValue([]);
    await clientesAdminService.getConFiltros({ buscar: 'ana' });
    expect(clientesRepository.getConFiltros).toHaveBeenCalledWith({ buscar: 'ana', fechaFin: undefined });
  });

  it('actualizar reenvía datos al repositorio en el caso normal', async () => {
    const datos = { nombre: 'Ana', email: 'ana@test.cl', telefono: '', intereses: '' };
    await clientesAdminService.actualizar(5, datos);
    expect(clientesRepository.actualizarDatosAdmin).toHaveBeenCalledWith(5, datos);
  });

  it('actualizar traduce SQLITE_CONSTRAINT_UNIQUE (email duplicado) a un 409 claro', async () => {
    const error = new Error('UNIQUE constraint failed: clientes.email');
    error.code = 'SQLITE_CONSTRAINT_UNIQUE';
    clientesRepository.actualizarDatosAdmin.mockRejectedValue(error);

    await expect(clientesAdminService.actualizar(5, {})).rejects.toBeInstanceOf(HttpError);
    await expect(clientesAdminService.actualizar(5, {})).rejects.toMatchObject({ status: 409 });
  });

  it('getHistorial remapea taller/fechaInscripcion a nombre/fecha_inscripcion', async () => {
    inscripcionesRepository.getPorClienteId.mockResolvedValue([
      { id: 1, taller: 'Resina', fecha: '2026-09-01', fechaInscripcion: '2026-08-20T10:00:00.000Z' },
    ]);
    const resultado = await clientesAdminService.getHistorial(5);
    expect(resultado).toEqual([
      { nombre: 'Resina', fecha: '2026-09-01', fecha_inscripcion: '2026-08-20T10:00:00.000Z' },
    ]);
  });

  it('crearNota reenvía id y texto al repositorio', async () => {
    await clientesAdminService.crearNota(5, 'Le encantó el taller');
    expect(notasFidelizacionRepository.crear).toHaveBeenCalledWith({
      clienteId: 5,
      nota: 'Le encantó el taller',
    });
  });
});
