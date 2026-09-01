import { eq, and, gte, lte, desc, sql } from 'drizzle-orm';
import { db } from '../db/client.js';
import { pedidos, pedidoItems, clientes, productos } from '../db/schema.js';

// fecha_pedido es un string ISO 8601 (ver comentario en pedidosRepository.crear),
// así que gte/lte sobre esa columna hacen comparación lexicográfica correcta.
const condicionesFecha = (columnaFecha, { desde, hasta } = {}) => {
  const condiciones = [];
  if (desde) condiciones.push(gte(columnaFecha, desde));
  if (hasta) condiciones.push(lte(columnaFecha, hasta));
  return condiciones.length ? and(...condiciones) : undefined;
};

export const reportesRepository = {
  // COALESCE evita null cuando no hay ningún pedido en el rango (SUM sobre
  // cero filas devuelve NULL en SQL, no 0).
  getResumenVentas: async ({ desde, hasta } = {}) => {
    const filas = await db
      .select({
        totalVentas: sql`COALESCE(SUM(${pedidos.total}), 0)`,
        totalPedidos: sql`COUNT(*)`,
      })
      .from(pedidos)
      .where(condicionesFecha(pedidos.fecha_pedido, { desde, hasta }));
    return filas[0];
  },

  getVentasPorPeriodo: ({ desde, hasta } = {}) => {
    const periodo = sql`substr(${pedidos.fecha_pedido}, 1, 10)`;
    return db
      .select({
        periodo,
        totalVentas: sql`SUM(${pedidos.total})`,
        totalPedidos: sql`COUNT(*)`,
      })
      .from(pedidos)
      .where(condicionesFecha(pedidos.fecha_pedido, { desde, hasta }))
      .groupBy(periodo)
      .orderBy(periodo);
  },

  getClientasRecurrentes: ({ desde, hasta, limite = 10 } = {}) =>
    db
      .select({
        clienteId: pedidos.cliente_id,
        nombre: clientes.nombre,
        email: clientes.email,
        totalPedidos: sql`COUNT(*)`,
        totalGastado: sql`SUM(${pedidos.total})`,
      })
      .from(pedidos)
      .leftJoin(clientes, eq(pedidos.cliente_id, clientes.id))
      .where(condicionesFecha(pedidos.fecha_pedido, { desde, hasta }))
      .groupBy(pedidos.cliente_id)
      .orderBy(desc(sql`SUM(${pedidos.total})`))
      .limit(limite),

  // LEFT JOIN a productos: si el producto fue borrado, "nombre" llega null
  // (mismo caso que ya maneja pedidosRepository.getTodos) — el service aplica
  // el fallback de nombre.
  getProductosTop: ({ desde, hasta, limite = 10 } = {}) =>
    db
      .select({
        productoId: pedidoItems.producto_id,
        nombre: productos.nombre,
        cantidadVendida: sql`SUM(${pedidoItems.cantidad})`,
        totalGenerado: sql`SUM(${pedidoItems.cantidad} * ${pedidoItems.precio_unitario})`,
      })
      .from(pedidoItems)
      .leftJoin(productos, eq(pedidoItems.producto_id, productos.id))
      .leftJoin(pedidos, eq(pedidoItems.pedido_id, pedidos.id))
      .where(condicionesFecha(pedidos.fecha_pedido, { desde, hasta }))
      .groupBy(pedidoItems.producto_id)
      .orderBy(desc(sql`SUM(${pedidoItems.cantidad})`))
      .limit(limite),
};
