import { describe, it, expect, vi, beforeEach } from 'vitest';

let db;
vi.mock('../db/client.js', async () => {
  const { crearDbDePrueba } = await import('./testDb.js');
  ({ db } = crearDbDePrueba());
  return { db: new Proxy({}, { get: (_t, prop) => db[prop] }) };
});

const { reportesRepository } = await import('./reportesRepository.js');
const { clientes, productos, pedidos, pedidoItems } = await import('../db/schema.js');

async function crearCliente(overrides = {}) {
  const resultado = await db
    .insert(clientes)
    .values({ nombre: 'Clienta de prueba', email: `test-${Date.now()}-${Math.random()}@test.com`, ...overrides })
    .returning({ id: clientes.id });
  return resultado[0].id;
}

async function crearProducto(overrides = {}) {
  const resultado = await db
    .insert(productos)
    .values({ nombre: 'Producto de prueba', precio: 1000, ...overrides })
    .returning({ id: productos.id });
  return resultado[0].id;
}

async function crearPedido({ clienteId, total, fechaPedido }) {
  const resultado = await db
    .insert(pedidos)
    .values({ cliente_id: clienteId, total, fecha_pedido: fechaPedido })
    .returning({ id: pedidos.id });
  return resultado[0].id;
}

async function crearItem({ pedidoId, productoId, cantidad, precioUnitario }) {
  await db
    .insert(pedidoItems)
    .values({ pedido_id: pedidoId, producto_id: productoId, cantidad, precio_unitario: precioUnitario })
    .run();
}

// Las queries de reportes agregan sobre toda la tabla (a diferencia de
// talleresRepository.test.js, que aísla por id vía getById) — sin limpiar
// entre tests, los pedidos de un test se cuelan en las agregaciones del
// siguiente.
beforeEach(() => {
  db.delete(pedidoItems).run();
  db.delete(pedidos).run();
  db.delete(productos).run();
  db.delete(clientes).run();
});

describe('reportesRepository — contra SQLite real', () => {
  describe('getResumenVentas', () => {
    it('suma el total y cuenta los pedidos', async () => {
      const clienteId = await crearCliente();
      await crearPedido({ clienteId, total: 1000, fechaPedido: '2026-01-05T10:00:00.000Z' });
      await crearPedido({ clienteId, total: 2000, fechaPedido: '2026-01-06T10:00:00.000Z' });

      const resumen = await reportesRepository.getResumenVentas({});
      expect(resumen.totalVentas).toBe(3000);
      expect(resumen.totalPedidos).toBe(2);
    });

    it('devuelve 0 (no null) cuando no hay pedidos en el rango', async () => {
      const resumen = await reportesRepository.getResumenVentas({ desde: '2099-01-01', hasta: '2099-12-31' });
      expect(resumen.totalVentas).toBe(0);
      expect(resumen.totalPedidos).toBe(0);
    });

    it('respeta el filtro desde/hasta', async () => {
      const clienteId = await crearCliente();
      await crearPedido({ clienteId, total: 1000, fechaPedido: '2026-01-05T10:00:00.000Z' });
      await crearPedido({ clienteId, total: 5000, fechaPedido: '2026-03-01T10:00:00.000Z' });

      const resumen = await reportesRepository.getResumenVentas({ desde: '2026-02-01', hasta: '2026-04-01' });
      expect(resumen.totalVentas).toBe(5000);
      expect(resumen.totalPedidos).toBe(1);
    });
  });

  describe('getVentasPorPeriodo', () => {
    it('agrupa dos pedidos del mismo día en una sola fila', async () => {
      const clienteId = await crearCliente();
      await crearPedido({ clienteId, total: 1000, fechaPedido: '2026-01-05T09:00:00.000Z' });
      await crearPedido({ clienteId, total: 500, fechaPedido: '2026-01-05T18:00:00.000Z' });
      await crearPedido({ clienteId, total: 700, fechaPedido: '2026-01-06T09:00:00.000Z' });

      const filas = await reportesRepository.getVentasPorPeriodo({});
      expect(filas).toEqual([
        { periodo: '2026-01-05', totalVentas: 1500, totalPedidos: 2 },
        { periodo: '2026-01-06', totalVentas: 700, totalPedidos: 1 },
      ]);
    });
  });

  describe('getClientasRecurrentes', () => {
    it('ordena por total gastado descendente y respeta el límite', async () => {
      const clienteA = await crearCliente({ nombre: 'Clienta A' });
      const clienteB = await crearCliente({ nombre: 'Clienta B' });
      await crearPedido({ clienteId: clienteA, total: 1000, fechaPedido: '2026-01-01T00:00:00.000Z' });
      await crearPedido({ clienteId: clienteA, total: 1000, fechaPedido: '2026-01-02T00:00:00.000Z' });
      await crearPedido({ clienteId: clienteA, total: 1000, fechaPedido: '2026-01-03T00:00:00.000Z' });
      await crearPedido({ clienteId: clienteB, total: 500, fechaPedido: '2026-01-01T00:00:00.000Z' });

      const filas = await reportesRepository.getClientasRecurrentes({ limite: 10 });
      expect(filas[0]).toMatchObject({ clienteId: clienteA, totalPedidos: 3, totalGastado: 3000 });
      expect(filas[1]).toMatchObject({ clienteId: clienteB, totalPedidos: 1, totalGastado: 500 });

      const conLimite = await reportesRepository.getClientasRecurrentes({ limite: 1 });
      expect(conLimite).toHaveLength(1);
      expect(conLimite[0].clienteId).toBe(clienteA);
    });
  });

  describe('getProductosTop', () => {
    it('suma cantidades del mismo producto en distintos pedidos y ordena descendente', async () => {
      const clienteId = await crearCliente();
      const productoA = await crearProducto({ nombre: 'Vela aromática' });
      const productoB = await crearProducto({ nombre: 'Kit de resina' });

      const pedido1 = await crearPedido({ clienteId, total: 6000, fechaPedido: '2026-01-01T00:00:00.000Z' });
      const pedido2 = await crearPedido({ clienteId, total: 3000, fechaPedido: '2026-01-02T00:00:00.000Z' });
      await crearItem({ pedidoId: pedido1, productoId: productoA, cantidad: 2, precioUnitario: 2000 });
      await crearItem({ pedidoId: pedido2, productoId: productoA, cantidad: 1, precioUnitario: 2000 });
      await crearItem({ pedidoId: pedido1, productoId: productoB, cantidad: 1, precioUnitario: 2000 });

      const filas = await reportesRepository.getProductosTop({ limite: 10 });
      expect(filas[0]).toMatchObject({ productoId: productoA, nombre: 'Vela aromática', cantidadVendida: 3, totalGenerado: 6000 });
      expect(filas[1]).toMatchObject({ productoId: productoB, nombre: 'Kit de resina', cantidadVendida: 1, totalGenerado: 2000 });
    });
  });
});
