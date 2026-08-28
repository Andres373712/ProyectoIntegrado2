import { eq, desc, inArray } from 'drizzle-orm';
import { db } from '../db/client.js';
import { pedidos, pedidoItems, clientes, productos } from '../db/schema.js';

export const pedidosRepository = {
  // Se usa .run() (sync, vía better-sqlite3) en vez de .returning()/await:
  // esto necesita poder ejecutarse dentro del callback síncrono de
  // db.transaction() (better-sqlite3 exige que la función de transacción sea
  // síncrona, no una que devuelva una Promise) junto con el resto de
  // operaciones del mismo pedido. "tx" permite pasar la transacción activa;
  // por defecto usa "db" para poder llamarse también fuera de una
  // transacción si hiciera falta.
  crear: ({ clienteId, total, estado }, tx = db) => {
    const resultado = tx
      .insert(pedidos)
      .values({ cliente_id: clienteId, total, estado: estado || 'pendiente' })
      .run();
    return resultado.lastInsertRowid;
  },

  crearItems: (items, tx = db) => {
    for (const item of items) {
      tx.insert(pedidoItems)
        .values({
          pedido_id: item.pedidoId,
          producto_id: item.productoId,
          cantidad: item.cantidad,
          precio_unitario: item.precioUnitario,
        })
        .run();
    }
  },

  getPorClienteId: (clienteId) =>
    db
      .select()
      .from(pedidos)
      .where(eq(pedidos.cliente_id, clienteId))
      .orderBy(desc(pedidos.fecha_pedido)),

  // Vista de admin: todos los pedidos con datos del cliente y sus líneas de
  // producto. Se arma con dos consultas (pedidos+cliente, luego items+
  // producto agrupados en memoria) en vez de un único JOIN de 3 tablas, para
  // no duplicar la fila del pedido por cada item que tenga.
  getTodos: async () => {
    const listaPedidos = await db
      .select({
        id: pedidos.id,
        total: pedidos.total,
        estado: pedidos.estado,
        fechaPedido: pedidos.fecha_pedido,
        clienteNombre: clientes.nombre,
        clienteEmail: clientes.email,
        clienteTelefono: clientes.telefono,
      })
      .from(pedidos)
      .leftJoin(clientes, eq(pedidos.cliente_id, clientes.id))
      .orderBy(desc(pedidos.fecha_pedido));

    if (listaPedidos.length === 0) return [];

    const idsPedidos = listaPedidos.map((p) => p.id);
    const items = await db
      .select({
        pedidoId: pedidoItems.pedido_id,
        productoId: pedidoItems.producto_id,
        cantidad: pedidoItems.cantidad,
        precioUnitario: pedidoItems.precio_unitario,
        productoNombre: productos.nombre,
      })
      .from(pedidoItems)
      .leftJoin(productos, eq(pedidoItems.producto_id, productos.id))
      .where(inArray(pedidoItems.pedido_id, idsPedidos));

    const itemsPorPedido = new Map();
    for (const item of items) {
      if (!itemsPorPedido.has(item.pedidoId)) itemsPorPedido.set(item.pedidoId, []);
      itemsPorPedido.get(item.pedidoId).push({
        productoId: item.productoId,
        nombre: item.productoNombre || `Producto eliminado (id ${item.productoId})`,
        cantidad: item.cantidad,
        precioUnitario: item.precioUnitario,
      });
    }

    return listaPedidos.map((pedido) => ({
      id: pedido.id,
      total: pedido.total,
      estado: pedido.estado,
      fechaPedido: pedido.fechaPedido,
      cliente: {
        nombre: pedido.clienteNombre,
        email: pedido.clienteEmail,
        telefono: pedido.clienteTelefono,
      },
      items: itemsPorPedido.get(pedido.id) || [],
    }));
  },
};
