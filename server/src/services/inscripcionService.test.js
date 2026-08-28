import { describe, it, expect, vi, beforeEach } from 'vitest';

process.env.JWT_SECRET = 'clave-de-test-no-usar-en-produccion';

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
  inscripcionesRepository: {
    crear: vi.fn(),
    existeInscripcion: vi.fn(),
    getPorId: vi.fn(),
    cancelarInscripcionAtomica: vi.fn(),
  },
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
const jwt = (await import('jsonwebtoken')).default;

const DATOS = { tallerId: 1, nombre: 'Ana', email: 'ana@test.com', telefono: '123', intereses: 'B2C' };

describe('inscripcionService.inscribir', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Por defecto "hay cupo" y "todavía no está inscrito": la mayoría de los
    // tests no ejercitan la condición de carrera ni el chequeo de duplicado,
    // y esperan que la inscripción se cree.
    talleresRepository.incrementarCuposInscritos.mockReturnValue(true);
    inscripcionesRepository.existeInscripcion.mockResolvedValue(false);
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

  it('lanza 409 y no crea nada si el cliente ya está inscrito en ese taller', async () => {
    talleresRepository.getById.mockResolvedValue({ id: 1, cupos_inscritos: 0, cupos_totales: 5 });
    clientesRepository.getByEmail.mockResolvedValue({ id: 42 });
    inscripcionesRepository.existeInscripcion.mockResolvedValue(true);

    await expect(inscripcionService.inscribir(DATOS)).rejects.toMatchObject({
      status: 409,
      message: 'Ya estás inscrito en este taller',
    });

    expect(inscripcionesRepository.existeInscripcion).toHaveBeenCalledWith(42, 1);
    expect(inscripcionesRepository.crear).not.toHaveBeenCalled();
    expect(talleresRepository.incrementarCuposInscritos).not.toHaveBeenCalled();
    expect(enviarEmailConfirmacion).not.toHaveBeenCalled();
  });

  it('el chequeo de duplicado corre DESPUÉS de resolver el clienteId (por email), no antes', async () => {
    talleresRepository.getById.mockResolvedValue({ id: 1, cupos_inscritos: 0, cupos_totales: 5 });
    clientesRepository.getByEmail.mockResolvedValue(undefined);
    clientesRepository.crearDesdeInscripcion.mockResolvedValue({ id: 99 });

    await inscripcionService.inscribir(DATOS);

    expect(inscripcionesRepository.existeInscripcion).toHaveBeenCalledWith(99, 1);
  });

  it('permite inscribirse a un taller distinto aunque ya esté inscrito en otro (mismo cliente)', async () => {
    talleresRepository.getById.mockResolvedValue({ id: 2, cupos_inscritos: 0, cupos_totales: 5 });
    clientesRepository.getByEmail.mockResolvedValue({ id: 42 });
    inscripcionesRepository.existeInscripcion.mockResolvedValue(false);

    await expect(inscripcionService.inscribir({ ...DATOS, tallerId: 2 })).resolves.toBeUndefined();

    expect(inscripcionesRepository.existeInscripcion).toHaveBeenCalledWith(42, 2);
    expect(inscripcionesRepository.crear).toHaveBeenCalledWith({ clienteId: 42, tallerId: 2 });
  });

  it('si el INSERT falla igual por el índice único (condición de carrera), traduce el error a 409 en vez de un 500', async () => {
    talleresRepository.getById.mockResolvedValue({ id: 1, cupos_inscritos: 0, cupos_totales: 5 });
    clientesRepository.getByEmail.mockResolvedValue({ id: 42 });
    inscripcionesRepository.existeInscripcion.mockResolvedValue(false);
    const errorConstraint = new Error('UNIQUE constraint failed: inscripciones.cliente_id, inscripciones.taller_id');
    errorConstraint.code = 'SQLITE_CONSTRAINT_UNIQUE';
    inscripcionesRepository.crear.mockImplementation(() => {
      throw errorConstraint;
    });

    await expect(inscripcionService.inscribir(DATOS)).rejects.toMatchObject({
      status: 409,
      message: 'Ya estás inscrito en este taller',
    });
    expect(enviarEmailConfirmacion).not.toHaveBeenCalled();
  });

  it('propaga cualquier otro error de la transacción sin traducirlo a 409', async () => {
    talleresRepository.getById.mockResolvedValue({ id: 1, cupos_inscritos: 0, cupos_totales: 5 });
    clientesRepository.getByEmail.mockResolvedValue({ id: 42 });
    inscripcionesRepository.existeInscripcion.mockResolvedValue(false);
    inscripcionesRepository.crear.mockImplementation(() => {
      throw new Error('fallo inesperado de disco');
    });

    await expect(inscripcionService.inscribir(DATOS)).rejects.toThrow('fallo inesperado de disco');
  });

  it('firma un token de cancelación con el id de la inscripción recién creada y lo pasa al email de confirmación', async () => {
    talleresRepository.getById.mockResolvedValue({ id: 1, cupos_inscritos: 0, cupos_totales: 5 });
    clientesRepository.getByEmail.mockResolvedValue({ id: 42 });
    inscripcionesRepository.crear.mockReturnValue(777);

    await inscripcionService.inscribir(DATOS);

    expect(enviarEmailConfirmacion).toHaveBeenCalledTimes(1);
    const [, , tokenCancelacion] = enviarEmailConfirmacion.mock.calls[0];
    expect(typeof tokenCancelacion).toBe('string');
    const payload = jwt.verify(tokenCancelacion, process.env.JWT_SECRET);
    expect(payload).toMatchObject({ tipo: 'cancelar-inscripcion', inscripcionId: 777 });
  });
});

describe('inscripcionService.cancelarPorToken', () => {
  beforeEach(() => vi.clearAllMocks());

  const firmar = (payload, opciones) => jwt.sign(payload, process.env.JWT_SECRET, opciones);

  it('lanza 400 si el token es inválido', async () => {
    await expect(inscripcionService.cancelarPorToken('token-basura')).rejects.toMatchObject({ status: 400 });
    expect(inscripcionesRepository.getPorId).not.toHaveBeenCalled();
  });

  it('lanza 400 si el token está expirado', async () => {
    const token = firmar({ tipo: 'cancelar-inscripcion', inscripcionId: 1 }, { expiresIn: -1 });

    await expect(inscripcionService.cancelarPorToken(token)).rejects.toMatchObject({ status: 400 });
    expect(inscripcionesRepository.getPorId).not.toHaveBeenCalled();
  });

  it('lanza 400 si el token es válido pero de otro propósito (tipo distinto)', async () => {
    const token = firmar({ tipo: 'otra-cosa', inscripcionId: 1 });

    await expect(inscripcionService.cancelarPorToken(token)).rejects.toMatchObject({ status: 400 });
    expect(inscripcionesRepository.getPorId).not.toHaveBeenCalled();
  });

  it('cancela la inscripción y devuelve nombre y taller cuando el token es válido', async () => {
    const token = firmar({ tipo: 'cancelar-inscripcion', inscripcionId: 55 });
    inscripcionesRepository.getPorId.mockResolvedValue({
      id: 55,
      tallerId: 10,
      taller: 'Yoga restaurativo',
      nombreCliente: 'Ana',
    });

    const resultado = await inscripcionService.cancelarPorToken(token);

    expect(inscripcionesRepository.getPorId).toHaveBeenCalledWith(55);
    expect(inscripcionesRepository.cancelarInscripcionAtomica).toHaveBeenCalledWith(55, 10);
    expect(resultado).toEqual({
      message: 'Inscripción cancelada correctamente',
      nombre: 'Ana',
      taller: 'Yoga restaurativo',
    });
  });

  it('responde con un mensaje claro (no un 500) si el token ya fue usado antes (la inscripción ya no existe)', async () => {
    const token = firmar({ tipo: 'cancelar-inscripcion', inscripcionId: 55 });
    inscripcionesRepository.getPorId.mockResolvedValue(undefined);

    await expect(inscripcionService.cancelarPorToken(token)).rejects.toMatchObject({ status: 404 });
    expect(inscripcionesRepository.cancelarInscripcionAtomica).not.toHaveBeenCalled();
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
