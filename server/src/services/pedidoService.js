import { db } from '../db/client.js';
import { productosRepository } from '../repositories/productosRepository.js';
import { pedidosRepository } from '../repositories/pedidosRepository.js';
import { clientesRepository } from '../repositories/clientesRepository.js';
import { HttpError } from '../utils/httpError.js';
import { enviarEmailPedido } from '../../emailService.js';
import { logger } from '../utils/logger.js';

export const pedidoService = {
  // "usuarioAutenticado" es el payload del JWT (req.user) cuando la petición
  // trae un token válido de cliente — lo pone el middleware usuarioOpcional,
  // igual que en inscripcionService. Si está presente, el pedido se liga
  // directamente a esa cuenta en vez de resolver el cliente por el email del
  // formulario. El checkout anónimo (sin token) queda igual: busca/crea el
  // cliente por email.
  crearPedido: async ({ nombre, email, telefono, productos: itemsBody }, usuarioAutenticado) => {
    // 1. Releer cada producto real desde la BD (nunca confiar en nombre/precio
    // del body) y validar existencia, estado activo y stock disponible.
    const items = [];
    for (const { id, cantidad } of itemsBody) {
      const producto = await productosRepository.getById(id);
      if (!producto || !producto.activo) {
        throw new HttpError(404, `Producto no encontrado (id ${id})`);
      }
      if (producto.stock < cantidad) {
        throw new HttpError(409, `Sin stock suficiente para ${producto.nombre}`);
      }
      items.push({ producto, cantidad });
    }

    // 2. Total recalculado server-side — el total que venga en el body se ignora.
    const total = items.reduce(
      (acumulado, { producto, cantidad }) => acumulado + producto.precio * cantidad,
      0,
    );

    // 3. Resolver cliente (mismo criterio que inscripcionService.inscribir).
    let clienteId;
    if (usuarioAutenticado?.rol === 'cliente') {
      clienteId = usuarioAutenticado.id;
    } else {
      let cliente = await clientesRepository.getByEmail(email);
      if (!cliente) {
        cliente = await clientesRepository.crearDesdeInscripcion({
          nombre,
          email,
          telefono,
          intereses: null,
        });
      }
      clienteId = cliente.id;
    }

    // 4. Todo lo que escribe pasa por una única transacción: si el descuento
    // de stock de cualquier producto falla (condición de carrera con otro
    // pedido concurrente que agotó el stock entre el chequeo del paso 1 y
    // este punto), se revierte el pedido y sus items completos, no solo la
    // línea que falló.
    const pedidoId = db.transaction((tx) => {
      const idPedido = pedidosRepository.crear({ clienteId, total, estado: 'pendiente' }, tx);

      for (const { producto, cantidad } of items) {
        const resultado = productosRepository.descontarStock(producto.id, cantidad, tx);
        if (resultado.changes === 0) {
          throw new HttpError(409, `Sin stock suficiente para ${producto.nombre}`);
        }
      }

      pedidosRepository.crearItems(
        items.map(({ producto, cantidad }) => ({
          pedidoId: idPedido,
          productoId: producto.id,
          cantidad,
          precioUnitario: producto.precio,
        })),
        tx,
      );

      return idPedido;
    });

    enviarEmailPedido(
      { nombre, email },
      items.map(({ producto, cantidad }) => ({
        nombre: producto.nombre,
        cantidad,
        precio: producto.precio,
      })),
      total,
      pedidoId,
    ).catch((error) => logger.error({ err: error }, 'Error enviando email de pedido'));

    return { pedidoId, total };
  },

  getTodos: () => pedidosRepository.getTodos(),
};
