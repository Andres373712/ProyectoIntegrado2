import { z } from 'zod';

// z.coerce.number() usa Number(), no parseFloat/parseInt: es más estricto con
// strings tipo "12abc" (los rechaza en vez de truncar) — deliberado, cierra el
// hallazgo de "validación de entrada inconsistente" de la auditoría (§01).
// Los formularios reales (inputs numéricos) nunca producen ese caso.
const numero = () => z.coerce.number({ invalid_type_error: 'Debe ser un número válido' });
const entero = () => numero().transform((n) => Math.trunc(n));

export const tallerCrearSchema = z.object({
  nombre: z.string({ required_error: 'El nombre es obligatorio' }).trim().min(1, 'El nombre es obligatorio'),
  descripcion: z.string().optional().default(''),
  fecha: z.string().optional().default(''),
  tipo: z.string().optional().default('B2C'),
  precio: numero(),
  lugar: z.string().optional().default(''),
  cupos_totales: entero(),
});

export const tallerActualizarSchema = z.object({
  nombre: z.string({ required_error: 'El nombre es obligatorio' }).trim().min(1, 'El nombre es obligatorio'),
  descripcion: z.string().optional().default(''),
  fecha: z.string().optional().default(''),
  tipo: z.string().optional().default('B2C'),
  precio: numero(),
  // Se mantiene tal cual llega (string "true"/"false" desde FormData): el
  // contrato actual lo guarda sin normalizar y no se toca ese comportamiento aquí.
  activo: z.any().optional(),
  lugar: z.string().optional().default(''),
  cupos_totales: entero(),
  imageUrlActual: z.string().optional(),
});
