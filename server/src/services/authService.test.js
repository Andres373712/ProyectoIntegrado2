import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcryptjs';

process.env.JWT_SECRET = 'clave-de-test-no-usar-en-produccion';

vi.mock('../repositories/adminRepository.js', () => ({
  adminRepository: { getByEmail: vi.fn() },
}));
vi.mock('../repositories/clientesRepository.js', () => ({
  clientesRepository: {
    getByEmail: vi.fn(),
    crearParaRegistro: vi.fn(),
    actualizarParaRegistro: vi.fn(),
    getByTokenVerificacion: vi.fn(),
    marcarVerificado: vi.fn(),
    getByTokenRecuperacion: vi.fn(),
    guardarTokenRecuperacion: vi.fn(),
    actualizarPassword: vi.fn(),
  },
}));
vi.mock('../../emailService.js', () => ({
  enviarEmailVerificacion: vi.fn().mockResolvedValue(undefined),
  enviarEmailRecuperacion: vi.fn().mockResolvedValue(undefined),
}));

const { adminRepository } = await import('../repositories/adminRepository.js');
const { clientesRepository } = await import('../repositories/clientesRepository.js');
const { authService } = await import('./authService.js');
const { HttpError } = await import('../utils/httpError.js');
const { enviarEmailRecuperacion } = await import('../../emailService.js');

describe('authService.loginAdmin', () => {
  beforeEach(() => vi.clearAllMocks());

  it('lanza 401 si el email no existe', async () => {
    adminRepository.getByEmail.mockResolvedValue(undefined);
    await expect(authService.loginAdmin({ email: 'x@x.com', password: 'y' })).rejects.toMatchObject({
      status: 401,
      message: 'Credenciales inválidas',
    });
  });

  it('lanza 401 si la contraseña no coincide', async () => {
    adminRepository.getByEmail.mockResolvedValue({
      id: 1,
      email: 'admin@tmm.cl',
      password_hash: await bcrypt.hash('correcta', 10),
    });
    await expect(
      authService.loginAdmin({ email: 'admin@tmm.cl', password: 'incorrecta' }),
    ).rejects.toMatchObject({ status: 401 });
  });

  it('devuelve un JWT válido con las credenciales correctas', async () => {
    adminRepository.getByEmail.mockResolvedValue({
      id: 7,
      email: 'admin@tmm.cl',
      password_hash: await bcrypt.hash('correcta', 10),
    });
    const token = await authService.loginAdmin({ email: 'admin@tmm.cl', password: 'correcta' });
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3); // header.payload.signature
  });
});

describe('authService.loginCliente', () => {
  beforeEach(() => vi.clearAllMocks());

  it('lanza 401 genérico si el correo no está registrado (sin filtrar existencia)', async () => {
    clientesRepository.getByEmail.mockResolvedValue(undefined);
    await expect(authService.loginCliente({ email: 'x@x.com', password: 'y' })).rejects.toMatchObject({
      status: 401,
      message: 'Credenciales inválidas',
    });
  });

  it('lanza el mismo 401 genérico si la cuenta no tiene contraseña (nunca se registró)', async () => {
    clientesRepository.getByEmail.mockResolvedValue({ id: 1, password_hash: null, verificado: 0 });
    await expect(authService.loginCliente({ email: 'x@x.com', password: 'y' })).rejects.toMatchObject({
      status: 401,
      message: 'Credenciales inválidas',
    });
  });

  it('lanza el mismo 401 genérico con la contraseña incorrecta', async () => {
    clientesRepository.getByEmail.mockResolvedValue({
      id: 1,
      password_hash: await bcrypt.hash('correcta', 10),
      verificado: 1,
    });
    await expect(
      authService.loginCliente({ email: 'x@x.com', password: 'incorrecta' }),
    ).rejects.toMatchObject({ status: 401, message: 'Credenciales inválidas' });
  });

  it('los tres casos "malos" (sin correo, sin password_hash, password incorrecta) dan exactamente el mismo status y mensaje', async () => {
    clientesRepository.getByEmail.mockResolvedValueOnce(undefined);
    const errSinCorreo = await authService
      .loginCliente({ email: 'x@x.com', password: 'y' })
      .catch((e) => e);

    clientesRepository.getByEmail.mockResolvedValueOnce({ id: 1, password_hash: null, verificado: 0 });
    const errSinPassword = await authService
      .loginCliente({ email: 'x@x.com', password: 'y' })
      .catch((e) => e);

    clientesRepository.getByEmail.mockResolvedValueOnce({
      id: 1,
      password_hash: await bcrypt.hash('correcta', 10),
      verificado: 1,
    });
    const errPasswordIncorrecta = await authService
      .loginCliente({ email: 'x@x.com', password: 'incorrecta' })
      .catch((e) => e);

    for (const err of [errSinCorreo, errSinPassword, errPasswordIncorrecta]) {
      expect(err.status).toBe(401);
      expect(err.message).toBe('Credenciales inválidas');
    }
  });

  it('lanza 403 "Verifica tu correo primero" SOLO cuando la contraseña es correcta y la cuenta no está verificada', async () => {
    clientesRepository.getByEmail.mockResolvedValue({
      id: 1,
      password_hash: await bcrypt.hash('correcta', 10),
      verificado: 0,
    });
    await expect(
      authService.loginCliente({ email: 'x@x.com', password: 'correcta' }),
    ).rejects.toMatchObject({
      status: 403,
      message: 'Verifica tu correo primero.',
    });
  });

  it('NO revela "verifica tu correo" si la contraseña es incorrecta en una cuenta no verificada (evita enumeración)', async () => {
    clientesRepository.getByEmail.mockResolvedValue({
      id: 1,
      password_hash: await bcrypt.hash('correcta', 10),
      verificado: 0,
    });
    await expect(
      authService.loginCliente({ email: 'x@x.com', password: 'incorrecta' }),
    ).rejects.toMatchObject({
      status: 401,
      message: 'Credenciales inválidas',
    });
  });

  it('devuelve token con credenciales válidas y cuenta verificada', async () => {
    clientesRepository.getByEmail.mockResolvedValue({
      id: 5,
      email: 'cliente@test.com',
      password_hash: await bcrypt.hash('correcta', 10),
      verificado: 1,
    });
    const token = await authService.loginCliente({ email: 'cliente@test.com', password: 'correcta' });
    expect(token.split('.')).toHaveLength(3);
  });
});

describe('authService.registrarCliente', () => {
  beforeEach(() => vi.clearAllMocks());

  it('lanza 409 si ya existe una cuenta verificada con ese email', async () => {
    clientesRepository.getByEmail.mockResolvedValue({ id: 1, password_hash: 'algo' });
    await expect(
      authService.registrarCliente({ nombre: 'A', email: 'a@a.com', telefono: '1', password: 'X' }),
    ).rejects.toMatchObject({ status: 409 });
    expect(clientesRepository.crearParaRegistro).not.toHaveBeenCalled();
  });

  it('completa una cuenta a medias (existe por inscripción, sin password) en vez de crear otra', async () => {
    clientesRepository.getByEmail.mockResolvedValue({ id: 1, password_hash: null });
    const resultado = await authService.registrarCliente({
      nombre: 'A',
      email: 'a@a.com',
      telefono: '1',
      password: 'X',
    });
    expect(resultado).toEqual({ actualizada: true });
    expect(clientesRepository.actualizarParaRegistro).toHaveBeenCalledWith(1, expect.any(Object));
    expect(clientesRepository.crearParaRegistro).not.toHaveBeenCalled();
  });

  it('crea una cuenta nueva cuando el email no existe', async () => {
    clientesRepository.getByEmail.mockResolvedValue(undefined);
    const resultado = await authService.registrarCliente({
      nombre: 'A',
      email: 'nueva@a.com',
      telefono: '1',
      password: 'X',
    });
    expect(resultado).toEqual({ actualizada: false });
    expect(clientesRepository.crearParaRegistro).toHaveBeenCalled();
  });
});

describe('authService.forgotPassword', () => {
  beforeEach(() => vi.clearAllMocks());

  it('no hace nada (ni envía correo) si el email no está registrado', async () => {
    clientesRepository.getByEmail.mockResolvedValue(undefined);
    await authService.forgotPassword('nadie@x.com');
    expect(clientesRepository.guardarTokenRecuperacion).not.toHaveBeenCalled();
    expect(enviarEmailRecuperacion).not.toHaveBeenCalled();
  });

  it('no hace nada si la cuenta existe pero nunca se registró (sin password)', async () => {
    clientesRepository.getByEmail.mockResolvedValue({ id: 1, email: 'x@x.com', password_hash: null });
    await authService.forgotPassword('x@x.com');
    expect(clientesRepository.guardarTokenRecuperacion).not.toHaveBeenCalled();
    expect(enviarEmailRecuperacion).not.toHaveBeenCalled();
  });

  it('genera token, lo guarda y envía el correo si la cuenta tiene password', async () => {
    clientesRepository.getByEmail.mockResolvedValue({ id: 5, email: 'x@x.com', password_hash: 'hash' });
    await authService.forgotPassword('x@x.com');
    expect(clientesRepository.guardarTokenRecuperacion).toHaveBeenCalledWith(
      5,
      expect.objectContaining({ token: expect.any(String), expiracion: expect.any(String) }),
    );
    expect(enviarEmailRecuperacion).toHaveBeenCalledWith('x@x.com', expect.any(String));
  });
});

describe('authService.resetPassword', () => {
  beforeEach(() => vi.clearAllMocks());

  it('lanza 400 si el token no existe', async () => {
    clientesRepository.getByTokenRecuperacion.mockResolvedValue(undefined);
    await expect(authService.resetPassword('token-falso', 'Nueva123!')).rejects.toMatchObject({ status: 400 });
    expect(clientesRepository.actualizarPassword).not.toHaveBeenCalled();
  });

  it('lanza 400 si el token ya expiró', async () => {
    clientesRepository.getByTokenRecuperacion.mockResolvedValue({
      id: 1,
      expiracion_recuperacion: new Date(Date.now() - 1000).toISOString(),
    });
    await expect(authService.resetPassword('token-viejo', 'Nueva123!')).rejects.toMatchObject({ status: 400 });
    expect(clientesRepository.actualizarPassword).not.toHaveBeenCalled();
  });

  it('actualiza la contraseña si el token es válido y no ha expirado', async () => {
    clientesRepository.getByTokenRecuperacion.mockResolvedValue({
      id: 9,
      expiracion_recuperacion: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    });
    await authService.resetPassword('token-valido', 'Nueva123!');
    expect(clientesRepository.actualizarPassword).toHaveBeenCalledWith(9, expect.any(String));
  });
});
