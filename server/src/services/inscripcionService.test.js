import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../repositories/talleresRepository.js', () => ({
  talleresRepository: {
    getById: vi.fn(),
    incrementarCuposInscritos: vi.fn(),
  },
}));
vi.mock('../repositories/clientesRepository.js', () => ({
  clientesRepository: {
    getByEmail: vi.fn(),
    crearDesdeInscripcion: vi.fn(),
  },
}));
vi.mock('../repositories/inscripcionesRepository.js', () => ({
  inscripcionesRepository: { crear: vi.fn() },
}));
vi.mock('../../emailService.js', () => ({
  enviarEmailConfirmacion: vi.fn().mockResolvedValue(undefined),
}));

const { talleresRepository } = await import('../repositories/talleresRepository.js');
const { clientesRepository } = await import('../repositories/clientesRepository.js');
const { inscripcionesRepository } = await import('../repositories/inscripcionesRepository.js');
const { enviarEmailConfirmacion } = await import('../../emailService.js');
const { inscripcionService } = await import('./inscripcionService.js');
const { HttpError } = await import('../utils/httpError.js');

const DATOS = { tallerId: 1, nombre: 'Ana', email: 'ana@test.com', telefono: '123', intereses: 'B2C' };

describe('inscripcionService.inscribir', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lanza 404 si el taller no existe', async () => {
    talleresRepository.getById.mockResolvedValue(undefined);

    await expect(inscripcionService.inscribir(DATOS)).rejects.toMatchObject({
      status: 404,
      message: 'Taller no encontrado',
    });
    expect(inscripcionesRepository.crear).not.toHaveBeenCalled();
  });

  it('lanza 409 si no quedan cupos', async () => {
    talleresRepository.getById.mockResolvedValue({ id: 1, cupos_inscritos: 5, cupos_totales: 5 });

    await expect(inscripcionService.inscribir(DATOS)).rejects.toMatchObject({
      status: 409,
      message: 'Sin cupos',
    });
    expect(inscripcionesRepository.crear).not.toHaveBeenCalled();
  });

  it('reutiliza un cliente existente por email en vez de crear uno nuevo', async () => {
    talleresRepository.getById.mockResolvedValue({ id: 1, cupos_inscritos: 0, cupos_totales: 5 });
    clientesRepository.getByEmail.mockResolvedValue({ id: 42, email: DATOS.email });

    await inscripcionService.inscribir(DATOS);

    expect(clientesRepository.crearDesdeInscripcion).not.toHaveBeenCalled();
    expect(inscripcionesRepository.crear).toHaveBeenCalledWith({ clienteId: 42, tallerId: 1 });
    expect(talleresRepository.incrementarCuposInscritos).toHaveBeenCalledWith(1);
  });

  it('crea un cliente nuevo cuando el email no existe todavía', async () => {
    talleresRepository.getById.mockResolvedValue({ id: 1, cupos_inscritos: 0, cupos_totales: 5 });
    clientesRepository.getByEmail.mockResolvedValue(undefined);
    clientesRepository.crearDesdeInscripcion.mockResolvedValue({ id: 99 });

    await inscripcionService.inscribir(DATOS);

    expect(clientesRepository.crearDesdeInscripcion).toHaveBeenCalledWith({
      nombre: DATOS.nombre,
      email: DATOS.email,
      telefono: DATOS.telefono,
      intereses: DATOS.intereses,
    });
    expect(inscripcionesRepository.crear).toHaveBeenCalledWith({ clienteId: 99, tallerId: 1 });
  });

  it('dispara el email de confirmación sin bloquear la respuesta si falla', async () => {
    talleresRepository.getById.mockResolvedValue({ id: 1, cupos_inscritos: 0, cupos_totales: 5 });
    clientesRepository.getByEmail.mockResolvedValue({ id: 1 });
    enviarEmailConfirmacion.mockRejectedValueOnce(new Error('smtp caído'));

    await expect(inscripcionService.inscribir(DATOS)).resolves.toBeUndefined();
    expect(enviarEmailConfirmacion).toHaveBeenCalled();
  });
});

describe('HttpError', () => {
  it('expone status y message', () => {
    const err = new HttpError(404, 'no encontrado');
    expect(err.status).toBe(404);
    expect(err.message).toBe('no encontrado');
    expect(err).toBeInstanceOf(Error);
  });
});
