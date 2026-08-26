import { z } from 'zod';

const numero = () => z.coerce.number({ invalid_type_error: 'Debe ser un número válido' });
const entero = () => numero().transform((n) => Math.trunc(n));

export const productoCrearSchema = z.object({
  nombre: z.string({ required_error: 'El nombre es obligatorio' }).trim().min(1, 'El nombre es obligatorio'),
  descripcion: z.string().optional().default(''),
  precio: numero(),
  stock: entero(),
});
