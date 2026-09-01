import { describe, it, expect, beforeAll, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Necesario antes de importar config.js (vía app.js): valida JWT_SECRET al
// cargarse y corta el proceso si falta — mismo patrón que authService.test.js.
process.env.JWT_SECRET = 'una-clave-de-prueba-de-al-menos-16-caracteres';

// SQLite real en memoria con el esquema real migrado, igual que los tests de
// repositorio — pero acá se ejercita la app completa (rutas + middlewares +
// controllers + services + repositories), no una capa aislada. Es lo único
// en toda la suite que prueba quién puede pegarle a qué endpoint de verdad.
let db;
vi.mock('./db/client.js', async () => {
  const { crearDbDePrueba } = await import('./repositories/testDb.js');
  ({ db } = crearDbDePrueba());
  return {
    db: new Proxy({}, { get: (_t, prop) => db[prop] }),
    ejecutarMigraciones: () => {},
    cerrarConexion: () => {},
  };
});
vi.mock('../emailService.js', () => ({
  enviarEmailConfirmacion: vi.fn().mockResolvedValue(undefined),
  enviarEmailVerificacion: vi.fn().mockResolvedValue(undefined),
  enviarEmailRecuperacion: vi.fn().mockResolvedValue(undefined),
  enviarEmailPedido: vi.fn().mockResolvedValue(undefined),
  enviarEmailContacto: vi.fn().mockResolvedValue(undefined),
}));

const { default: request } = await import('supertest');
const { app } = await import('./app.js');
const { admin, clientes, talleres, inscripciones } = await import('./db/schema.js');

const firmarToken = (payload) => jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

let tokenAdmin;
let tokenClienteA;
let tokenClienteB;
let clienteAId;

beforeAll(async () => {
  const passwordHash = await bcrypt.hash('Password123!', 10);

  const [filaAdmin] = await db
    .insert(admin)
    .values({ email: 'admin@test.cl', password_hash: passwordHash })
    .returning({ id: admin.id });
  tokenAdmin = firmarToken({ id: filaAdmin.id, email: 'admin@test.cl', rol: 'admin' });

  const [clienteA] = await db
    .insert(clientes)
    .values({
      nombre: 'Clienta A',
      email: 'clienta-a@test.cl',
      password_hash: passwordHash,
      verificado: 1,
      fecha_registro: new Date().toISOString(),
    })
    .returning({ id: clientes.id });
  clienteAId = clienteA.id;
  tokenClienteA = firmarToken({ id: clienteA.id, email: 'clienta-a@test.cl', rol: 'cliente' });

  const [clienteB] = await db
    .insert(clientes)
    .values({
      nombre: 'Clienta B',
      email: 'clienta-b@test.cl',
      password_hash: passwordHash,
      verificado: 1,
      fecha_registro: new Date().toISOString(),
    })
    .returning({ id: clientes.id });
  tokenClienteB = firmarToken({ id: clienteB.id, email: 'clienta-b@test.cl', rol: 'cliente' });
});

describe('GET /health', () => {
  it('responde 200 sin necesitar auth', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
  });
});

describe('Matriz de autorización: rutas admin-only', () => {
  const rutasAdmin = [
    ['get', '/api/talleres/todos'],
    ['get', '/api/productos/todos'],
    ['get', '/api/testimonios/todos'],
    ['get', '/api/mensajes-contacto'],
    ['get', '/api/dashboard-data'],
    ['get', '/api/pedidos/todos'],
    ['get', '/api/clientes'],
    ['get', '/api/reportes/ventas'],
    ['get', '/api/reportes/clientas-recurrentes'],
    ['get', '/api/reportes/productos-top'],
  ];

  it.each(rutasAdmin)('%s %s responde 401 sin token', async (metodo, ruta) => {
    const res = await request(app)[metodo](ruta);
    expect(res.status).toBe(401);
  });

  it.each(rutasAdmin)('%s %s responde 403 con un token de cliente (no admin)', async (metodo, ruta) => {
    const res = await request(app)[metodo](ruta).set('Authorization', `Bearer ${tokenClienteA}`);
    expect(res.status).toBe(403);
  });

  it.each(rutasAdmin)('%s %s responde 200 con un token de admin válido', async (metodo, ruta) => {
    const res = await request(app)[metodo](ruta).set('Authorization', `Bearer ${tokenAdmin}`);
    expect(res.status).toBe(200);
  });
});

describe('Matriz de autorización: rutas de cliente autenticado', () => {
  it('GET /api/cliente/mis-inscripciones responde 401 sin token', async () => {
    const res = await request(app).get('/api/cliente/mis-inscripciones');
    expect(res.status).toBe(401);
  });

  it('GET /api/cliente/mis-inscripciones responde 403 con un token de admin (no cliente)', async () => {
    const res = await request(app)
      .get('/api/cliente/mis-inscripciones')
      .set('Authorization', `Bearer ${tokenAdmin}`);
    expect(res.status).toBe(403);
  });

  it('GET /api/cliente/mis-inscripciones responde 200 con un token de cliente válido', async () => {
    const res = await request(app)
      .get('/api/cliente/mis-inscripciones')
      .set('Authorization', `Bearer ${tokenClienteA}`);
    expect(res.status).toBe(200);
  });

  // IDOR: una clienta no puede cancelar la inscripción de otra. El 404 no
  // debe distinguir "no existe" de "es de otra persona" (mismo mensaje en
  // los dos casos, ver clienteService.cancelarInscripcion). Se prueba contra
  // una inscripción que sí existe (no un id inventado), para que el 404
  // pruebe de verdad el filtro por dueño y no solo "el id no existe".
  it('una clienta no puede cancelar una inscripción real de otra clienta', async () => {
    const [taller] = await db
      .insert(talleres)
      .values({ nombre: 'Taller de A', activo: 1, cupos_totales: 5, cupos_inscritos: 1 })
      .returning({ id: talleres.id });
    const [inscripcion] = await db
      .insert(inscripciones)
      .values({ cliente_id: clienteAId, taller_id: taller.id, fecha_inscripcion: new Date().toISOString() })
      .returning({ id: inscripciones.id });

    const intentoAjeno = await request(app)
      .delete(`/api/cliente/mis-inscripciones/${inscripcion.id}`)
      .set('Authorization', `Bearer ${tokenClienteB}`);
    expect(intentoAjeno.status).toBe(404);

    const intentoPropio = await request(app)
      .delete(`/api/cliente/mis-inscripciones/${inscripcion.id}`)
      .set('Authorization', `Bearer ${tokenClienteA}`);
    expect(intentoPropio.status).toBe(200);
  });
});

describe('POST /api/auth/login-cliente — regresión de validate(loginSchema)', () => {
  it('un body vacío responde 400, no 500', async () => {
    const res = await request(app).post('/api/auth/login-cliente').send({});
    expect(res.status).toBe(400);
  });

  it('credenciales inválidas responden 401 (llega al service, pasó la validación)', async () => {
    const res = await request(app)
      .post('/api/auth/login-cliente')
      .send({ email: 'no-existe@test.cl', password: 'lo-que-sea' });
    expect(res.status).toBe(401);
  });

  it('credenciales correctas responden 200 con un token', async () => {
    const res = await request(app)
      .post('/api/auth/login-cliente')
      .send({ email: 'clienta-a@test.cl', password: 'Password123!' });
    expect(res.status).toBe(200);
    expect(res.body.token).toEqual(expect.any(String));
  });
});

describe('Endpoints públicos sin auth', () => {
  it('GET /api/talleres/activos responde 200 sin token', async () => {
    const res = await request(app).get('/api/talleres/activos');
    expect(res.status).toBe(200);
  });

  it('GET /api/productos/activos responde 200 sin token', async () => {
    const res = await request(app).get('/api/productos/activos');
    expect(res.status).toBe(200);
  });

  it('GET /api/testimonios/activos responde 200 sin token', async () => {
    const res = await request(app).get('/api/testimonios/activos');
    expect(res.status).toBe(200);
  });
});
