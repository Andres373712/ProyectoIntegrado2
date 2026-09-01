import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HttpError } from '../utils/httpError.js';

vi.mock('../repositories/productosRepository.js', () => ({
  productosRepository: {
    eliminar: vi.fn(),
  },
}));

const { productosRepository } = await import('../repositories/productosRepository.js');
const { productosService } = await import('./productosService.js');

// Regresión: un producto ya vendido (referenciado en pedido_items) no se
// podía borrar por la FK sin ON DELETE — el error subía crudo y el
// errorHandler lo convertía en un 500 genérico sin mensaje útil.
// productosService.eliminar ahora lo traduce, igual que talleresService.
describe('productosService.eliminar', () => {
  beforeEach(() => vi.clearAllMocks());

  it('reenvía el id al repositorio en el caso normal', async () => {
    await productosService.eliminar(3);
    expect(productosRepository.eliminar).toHaveBeenCalledWith(3);
  });

  it('traduce SQLITE_CONSTRAINT_FOREIGNKEY a un HttpError con mensaje claro', async () => {
    const error = new Error('FOREIGN KEY constraint failed');
    error.code = 'SQLITE_CONSTRAINT_FOREIGNKEY';
    productosRepository.eliminar.mockRejectedValue(error);

    await expect(productosService.eliminar(3)).rejects.toBeInstanceOf(HttpError);
    await expect(productosService.eliminar(3)).rejects.toMatchObject({
      status: 500,
      message: expect.stringContaining('pedidos'),
    });
  });

  it('deja subir cualquier otro error tal cual', async () => {
    const otroError = new Error('boom');
    productosRepository.eliminar.mockRejectedValue(otroError);

    await expect(productosService.eliminar(3)).rejects.toBe(otroError);
  });
});
