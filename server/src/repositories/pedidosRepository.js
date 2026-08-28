import { eq, desc } from 'drizzle-orm';
import { db } from '../db/client.js';
import { pedidos, pedidoItems } from '../db/schema.js';

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
      tx
        .insert(pedidoItems)
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
    db.select().from(pedidos).where(eq(pedidos.cliente_id, clienteId)).orderBy(desc(pedidos.fecha_pedido)),
};
