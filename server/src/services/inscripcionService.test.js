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
// db.transaction de better-sqlite3 es síncrono: ejecuta el callback y
// devuelve su resultado directamente (sin promesa). El mock reproduce eso
// para que el service pueda probarse sin una base de datos real.
vi.mock('../db/client.js', () => ({
  db: { transaction: vi.fn((cb) => cb()) },
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
    // Por defecto "hay cupo": la mayoría de los tests no ejercitan la
    // condición de carrera y esperan que la inscripción se cree.
    talleresRepository.incrementarCuposInscritos.mockReturnValue(true);
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

  it('con un cliente autenticado (req.user), liga la inscripción a su id sin resolver por email', async () => {
    talleresRepository.getById.mockResolvedValue({ id: 1, cupos_inscritos: 0, cupos_totales: 5 });

    await inscripcionService.inscribir(DATOS, { id: 77, email: 'otro@correo.com', rol: 'cliente' });

    expect(clientesRepository.getByEmail).not.toHaveBeenCalled();
    expect(clientesRepository.crearDesdeInscripcion).not.toHaveBeenCalled();
    expect(inscripcionesRepository.crear).toHaveBeenCalledWith({ clienteId: 77, tallerId: 1 });
  });

  it('ignora req.user si su rol no es "cliente" (ej. un admin) y sigue el flujo por email', async () => {
    talleresRepository.getById.mockResolvedValue({ id: 1, cupos_inscritos: 0, cupos_totales: 5 });
    clientesRepository.getByEmail.mockResolvedValue({ id: 5 });

    await inscripcionService.inscribir(DATOS, { id: 1, rol: 'admin' });

    expect(clientesRepository.getByEmail).toHaveBeenCalledWith(DATOS.email);
    expect(inscripcionesRepository.crear).toHaveBeenCalledWith({ clienteId: 5, tallerId: 1 });
  });

  it('llena el último cupo exacto: el UPDATE atómico se aplica y crea la inscripción', async () => {
    // Un cupo libre según el chequeo previo (fast-path) Y según el UPDATE
    // atómico (fuente de verdad) — caso normal de "queda justo un cupo".
    talleresRepository.getById.mockResolvedValue({ id: 1, cupos_inscritos: 4, cupos_totales: 5 });
    clientesRepository.getByEmail.mockResolvedValue({ id: 1 });
    talleresRepository.incrementarCuposInscritos.mockReturnValue(true);

    await expect(inscripcionService.inscribir(DATOS)).resolves.toBeUndefined();

    expect(talleresRepository.incrementarCuposInscritos).toHaveBeenCalledWith(1);
    expect(inscripcionesRepository.crear).toHaveBeenCalledWith({ clienteId: 1, tallerId: 1 });
  });

  it('condición de carrera: si el UPDATE atómico no afecta filas (ya no había cupo real) lanza 409 y no crea la inscripción, aunque el chequeo previo con getById haya visto cupo libre', async () => {
    // Simula dos inscripciones concurrentes que "vieron" el mismo taller con
    // cupo libre antes de que cualquiera incrementara: el chequeo previo
    // pasa, pero la sentencia UPDATE atómica (mockeada para devolver "no se
    // aplicó ninguna fila", como pasaría si otra inscripción ya se quedó con
    // el último cupo) es la que realmente decide.
    talleresRepository.getById.mockResolvedValue({ id: 1, cupos_inscritos: 4, cupos_totales: 5 });
    clientesRepository.getByEmail.mockResolvedValue({ id: 1 });
    talleresRepository.incrementarCuposInscritos.mockReturnValue(false);

    await expect(inscripcionService.inscribir(DATOS)).rejects.toMatchObject({
      status: 409,
      message: 'Sin cupos',
    });
    expect(inscripcionesRepository.crear).not.toHaveBeenCalled();
  });

  it('crear-inscripción e incrementar-cupos corren dentro de db.transaction', async () => {
    const { db } = await import('../db/client.js');
    talleresRepository.getById.mockResolvedValue({ id: 1, cupos_inscritos: 0, cupos_totales: 5 });
    clientesRepository.getByEmail.mockResolvedValue({ id: 1 });

    await inscripcionService.inscribir(DATOS);

    expect(db.transaction).toHaveBeenCalledTimes(1);
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
