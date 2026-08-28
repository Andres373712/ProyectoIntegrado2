import { z } from 'zod';

const requerido = (mensaje) => z.string({ required_error: mensaje }).trim().min(1, mensaje);

// Solo se valida "id" y "cantidad" de cada línea: "nombre" y "precio" que
// venga del carrito se ignoran en el service, que siempre relee el producto
// real desde la base de datos y recalcula el total ahí — no hay que confiar
// en esos campos del body para nada relacionado a precio.
const productoItemSchema = z.object({
  id: z.coerce.number({ invalid_type_error: 'Producto inválido' }).int().positive(),
  cantidad: z.coerce
    .number({ invalid_type_error: 'Cantidad inválida' })
    .int()
    .positive('La cantidad debe ser mayor a 0'),
});

export const pedidoSchema = z.object({
  nombre: requerido('El nombre es obligatorio'),
  email: requerido('El email es obligatorio'),
  telefono: requerido('El teléfono es obligatorio'),
  productos: z.array(productoItemSchema).min(1, 'El pedido debe tener al menos un producto'),
  // Puede venir del body (el frontend ya lo manda) pero nunca se usa: el
  // service recalcula el total server-side sumando precio real × cantidad.
  total: z.coerce.number().optional(),
});
