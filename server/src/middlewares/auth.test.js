import { describe, it, expect, vi, beforeEach } from 'vitest';
import jwt from 'jsonwebtoken';

process.env.JWT_SECRET = 'clave-de-test-no-usar-en-produccion';

const { usuarioOpcional, esCliente } = await import('./auth.js');

const mockRes = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe('usuarioOpcional', () => {
  beforeEach(() => vi.clearAllMocks());

  it('llama a next() sin adjuntar req.user si no hay header Authorization', () => {
    const req = { headers: {} };
    const res = mockRes();
    const next = vi.fn();

    usuarioOpcional(req, res, next);

    expect(req.user).toBeUndefined();
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('adjunta req.user cuando el token es válido', () => {
    const token = jwt.sign({ id: 5, email: 'a@a.com', rol: 'cliente' }, process.env.JWT_SECRET);
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = mockRes();
    const next = vi.fn();

    usuarioOpcional(req, res, next);

    expect(req.user).toMatchObject({ id: 5, email: 'a@a.com', rol: 'cliente' });
    expect(next).toHaveBeenCalled();
  });

  it('sigue sin bloquear (ni adjunta req.user) si el token es inválido', () => {
    const req = { headers: { authorization: 'Bearer token-invalido' } };
    const res = mockRes();
    const next = vi.fn();

    usuarioOpcional(req, res, next);

    expect(req.user).toBeUndefined();
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});

describe('esCliente', () => {
  beforeEach(() => vi.clearAllMocks());

  it('deja pasar si req.user.rol es "cliente"', () => {
    const req = { user: { rol: 'cliente' } };
    const res = mockRes();
    const next = vi.fn();

    esCliente(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('responde 403 si req.user.rol no es "cliente"', () => {
    const req = { user: { rol: 'admin' } };
    const res = mockRes();
    const next = vi.fn();

    esCliente(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});
