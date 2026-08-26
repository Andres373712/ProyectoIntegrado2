import { z } from 'zod';

const calificacion = () =>
  z.coerce
    .number({ invalid_type_error: 'La calificación debe ser un número' })
    .int()
    .min(1, 'La calificación mínima es 1')
    .max(5, 'La calificación máxima es 5');

export const testimonioCrearSchema = z.object({
  nombre: z.string({ required_error: 'El nombre es obligatorio' }).trim().min(1, 'El nombre es obligatorio'),
  curso: z.string().optional().default(''),
  comentario: z
    .string({ required_error: 'El comentario es obligatorio' })
    .trim()
    .min(1, 'El comentario es obligatorio'),
  calificacion: calificacion().optional().default(5),
});

export const testimonioActualizarSchema = testimonioCrearSchema.extend({
  // El body llega como JSON con un boolean real (no FormData) — z.coerce.number()
  // sobre un boolean da Number(true)=1 / Number(false)=0, exacto para la columna.
  activo: z.coerce.number().int().min(0).max(1).optional().default(1),
});
