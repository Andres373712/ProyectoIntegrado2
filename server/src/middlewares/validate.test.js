import { describe, it, expect, vi } from 'vitest';
import { validate } from './validate.js';
import { loginSchema } from '../validators/auth.schema.js';

// Regresión: POST /api/auth/login-cliente era la única ruta de auth sin
// validate(schema) — un body vacío o sin password llegaba hasta
// bcrypt.compare(undefined, ...) en authService y tiraba 500 en vez de 400.
// Se le agregó validate(loginSchema) (mismo schema que ya usa /login de
// admin); este test cubre el middleware genérico con ese schema real, sin
// levantar el servidor completo.
function crearRes() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe('validate(loginSchema)', () => {
  it('responde 400 con un body vacío, sin llegar al controller', () => {
    const req = { body: {} };
    const res = crearRes();
    const next = vi.fn();

    validate(loginSchema)(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: expect.any(String) });
  });

  it('deja pasar un body con email y password, y normaliza req.body', () => {
    const req = { body: { email: 'clienta@tmm.cl', password: 'algo' } };
    const res = crearRes();
    const next = vi.fn();

    validate(loginSchema)(req, res, next);

    expect(next).toHaveBeenCalledWith();
    expect(res.status).not.toHaveBeenCalled();
    expect(req.body).toEqual({ email: 'clienta@tmm.cl', password: 'algo' });
  });
});
