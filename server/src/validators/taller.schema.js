import { z } from 'zod';

// z.coerce.number() usa Number(), no parseFloat/parseInt: es más estricto con
// strings tipo "12abc" (los rechaza en vez de truncar) — deliberado, cierra el
// hallazgo de "validación de entrada inconsistente" de la auditoría (§01).
// Los formularios reales (inputs numéricos) nunca producen ese caso.
const numero = () => z.coerce.number({ invalid_type_error: 'Debe ser un número válido' });
const entero = () => numero().transform((n) => Math.trunc(n));

// El body llega como FormData (por la imagen adjunta), así que "activo" nunca
// es un boolean real — es el string "true"/"false" que produce
// String(taller.activo) en el formulario. z.coerce.number() sobre ese string
// da NaN, no 1/0: sin esta normalización, SQLite guarda el texto crudo en una
// columna INTEGER y el filtro `WHERE activo = 1` deja de matchear (el taller
// desaparece del catálogo tras cualquier PUT, aunque no se toque el checkbox).
const activoDesdeFormData = () =>
  z
    .any()
    .optional()
    .transform((valor) => {
      if (valor === undefined) return undefined;
      if (typeof valor === 'boolean') return valor ? 1 : 0;
      const normalizado = String(valor).trim().toLowerCase();
      return normalizado === 'true' || normalizado === '1' ? 1 : 0;
    });

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
  activo: activoDesdeFormData(),
  lugar: z.string().optional().default(''),
  cupos_totales: entero(),
  imageUrlActual: z.string().optional(),
});
