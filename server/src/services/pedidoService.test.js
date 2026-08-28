import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../db/client.js', () => ({
  // better-sqlite3 exige que la función pasada a db.transaction() sea
  // síncrona; el mock reproduce eso: ejecuta el callback ya mismo y
  // propaga tanto su valor de retorno como cualquier excepción que lance
  // (igual que haría una transacción real al hacer rollback y re-lanzar).
  db: { transaction: vi.fn((callback) => callback({})) },
}));
vi.mock('../repositories/productosRepository.js', () => ({
  productosRepository: {
    getById: vi.fn(),
    descontarStock: vi.fn(),
  },
}));
vi.mock('../repositories/pedidosRepository.js', () => ({
  pedidosRepository: {
    crear: vi.fn(),
    crearItems: vi.fn(),
    getTodos: vi.fn(),
  },
}));
vi.mock('../repositories/clientesRepository.js', () => ({
  clientesRepository: {
    getByEmail: vi.fn(),
    crearDesdeInscripcion: vi.fn(),
  },
}));
vi.mock('../../emailService.js', () => ({
  enviarEmailPedido: vi.fn().mockResolvedValue(undefined),
}));

const { db } = await import('../db/client.js');
const { productosRepository } = await import('../repositories/productosRepository.js');
const { pedidosRepository } = await import('../repositories/pedidosRepository.js');
const { clientesRepository } = await import('../repositories/clientesRepository.js');
const { enviarEmailPedido } = await import('../../emailService.js');
const { pedidoService } = await import('./pedidoService.js');

const PRODUCTO_A = { id: 1, nombre: 'Aceite esencial', precio: 5000, stock: 10, activo: 1 };
const PRODUCTO_B = { id: 2, nombre: 'Vela de soya', precio: 3000, stock: 4, activo: 1 };

const DATOS = {
  nombre: 'Ana',
  email: 'ana@test.com',
  telefono: '123',
  productos: [
    { id: 1, cantidad: 2 },
    { id: 2, cantidad: 1 },
  ],
  total: 999999999, // valor absurdo del body — nunca debe usarse
};

describe('pedidoService.crearPedido', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clientesRepository.getByEmail.mockResolvedValue({ id: 42 });
    productosRepository.descontarStock.mockReturnValue({ changes: 1 });
    pedidosRepository.crear.mockReturnValue(10);
  });

  it('con stock suficiente, descuenta stock y crea el pedido con sus items', async () => {
    productosRepository.getById.mockImplementation(async (id) =>
      id === 1 ? { ...PRODUCTO_A } : { ...PRODUCTO_B },
    );

    const resultado = await pedidoService.crearPedido(DATOS);

    const totalEsperado = 5000 * 2 + 3000 * 1;

    expect(db.transaction).toHaveBeenCalledTimes(1);
    expect(pedidosRepository.crear).toHaveBeenCalledWith(
      { clienteId: 42, total: totalEsperado, estado: 'pendiente' },
      expect.anything(),
    );
    expect(productosRepository.descontarStock).toHaveBeenCalledWith(1, 2, expect.anything());
    expect(productosRepository.descontarStock).toHaveBeenCalledWith(2, 1, expect.anything());
    expect(pedidosRepository.crearItems).toHaveBeenCalledWith(
      [
        { pedidoId: 10, productoId: 1, cantidad: 2, precioUnitario: 5000 },
        { pedidoId: 10, productoId: 2, cantidad: 1, precioUnitario: 3000 },
      ],
      expect.anything(),
    );
    expect(resultado).toEqual({ pedidoId: 10, total: totalEsperado });
    expect(enviarEmailPedido).toHaveBeenCalled();
  });

  it('lanza 409 si algún producto no tiene stock suficiente, y no crea nada', async () => {
    productosRepository.getById.mockImplementation(async (id) =>
      id === 1 ? { ...PRODUCTO_A, stock: 1 } : { ...PRODUCTO_B },
    );

    await expect(pedidoService.crearPedido(DATOS)).rejects.toMatchObject({
      status: 409,
      message: expect.stringContaining('Aceite esencial'),
    });

    expect(db.transaction).not.toHaveBeenCalled();
    expect(pedidosRepository.crear).not.toHaveBeenCalled();
    expect(pedidosRepository.crearItems).not.toHaveBeenCalled();
    expect(productosRepository.descontarStock).not.toHaveBeenCalled();
    expect(enviarEmailPedido).not.toHaveBeenCalled();
  });

  it('recalcula el total server-side ignorando el total recibido en el body', async () => {
    productosRepository.getById.mockImplementation(async (id) =>
      id === 1 ? { ...PRODUCTO_A } : { ...PRODUCTO_B },
    );

    const resultado = await pedidoService.crearPedido(DATOS);

    const totalReal = 5000 * 2 + 3000 * 1;
    expect(resultado.total).toBe(totalReal);
    expect(resultado.total).not.toBe(DATOS.total);
    expect(pedidosRepository.crear).toHaveBeenCalledWith(
      expect.objectContaining({ total: totalReal }),
      expect.anything(),
    );
  });

  it('lanza 409 y no confirma nada si el descuento atómico falla dentro de la transacción (condición de carrera)', async () => {
    productosRepository.getById.mockImplementation(async (id) =>
      id === 1 ? { ...PRODUCTO_A } : { ...PRODUCTO_B },
    );
    // El chequeo inicial ve stock suficiente, pero otro pedido concurrente lo
    // agota justo antes del UPDATE atómico dentro de la transacción.
    productosRepository.descontarStock.mockReturnValueOnce({ changes: 0 });

    await expect(pedidoService.crearPedido(DATOS)).rejects.toMatchObject({ status: 409 });

    expect(pedidosRepository.crearItems).not.toHaveBeenCalled();
    expect(enviarEmailPedido).not.toHaveBeenCalled();
  });

  it('lanza 404 si un producto del pedido no existe o no está activo', async () => {
    productosRepository.getById.mockResolvedValue(undefined);

    await expect(pedidoService.crearPedido(DATOS)).rejects.toMatchObject({ status: 404 });
    expect(db.transaction).not.toHaveBeenCalled();
  });

  it('reutiliza un cliente existente por email en vez de crear uno nuevo', async () => {
    productosRepository.getById.mockImplementation(async (id) =>
      id === 1 ? { ...PRODUCTO_A } : { ...PRODUCTO_B },
    );

    await pedidoService.crearPedido(DATOS);

    expect(clientesRepository.crearDesdeInscripcion).not.toHaveBeenCalled();
    expect(pedidosRepository.crear).toHaveBeenCalledWith(
      expect.objectContaining({ clienteId: 42 }),
      expect.anything(),
    );
  });

  it('con un cliente autenticado (req.user), liga el pedido a su id sin resolver por email', async () => {
    productosRepository.getById.mockImplementation(async (id) =>
      id === 1 ? { ...PRODUCTO_A } : { ...PRODUCTO_B },
    );

    await pedidoService.crearPedido(DATOS, { id: 77, rol: 'cliente' });

    expect(clientesRepository.getByEmail).not.toHaveBeenCalled();
    expect(pedidosRepository.crear).toHaveBeenCalledWith(
      expect.objectContaining({ clienteId: 77 }),
      expect.anything(),
    );
  });
});

describe('pedidoService.getTodos', () => {
  it('delega en pedidosRepository.getTodos y devuelve su resultado tal cual', async () => {
    const listaEsperada = [
      {
        id: 10,
        total: 13000,
        estado: 'pendiente',
        fechaPedido: '2026-08-27T00:00:00.000Z',
        cliente: { nombre: 'Ana', email: 'ana@test.com', telefono: '123' },
        items: [{ productoId: 1, nombre: 'Aceite esencial', cantidad: 2, precioUnitario: 5000 }],
      },
    ];
    pedidosRepository.getTodos.mockResolvedValue(listaEsperada);

    const resultado = await pedidoService.getTodos();

    expect(pedidosRepository.getTodos).toHaveBeenCalledTimes(1);
    expect(resultado).toBe(listaEsperada);
  });
});
