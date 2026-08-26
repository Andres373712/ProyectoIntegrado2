import { z } from 'zod';

// Mismo orden que el original: primero "faltan campos" (incluye email
// ausente o vacío), recién después el formato de email.
export const contactoSchema = z.object({
  nombre: z.string({ required_error: 'Faltan campos' }).min(1, 'Faltan campos'),
  email: z.string({ required_error: 'Faltan campos' }).min(1, 'Faltan campos').email('Email inválido'),
  telefono: z.string().optional().nullable(),
  mensaje: z.string({ required_error: 'Faltan campos' }).min(1, 'Faltan campos'),
});
