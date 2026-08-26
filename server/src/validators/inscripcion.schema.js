import { z } from 'zod';

// El endpoint original hacía "if (!tallerId || !nombre || !email)" — un solo
// mensaje ('Faltan datos') tanto si el campo falta como si viene vacío. No
// valida formato de email, solo presencia — se mantiene así a propósito.
const requerido = () => z.any().refine((v) => v !== undefined && v !== null && String(v).trim().length > 0, {
  message: 'Faltan datos',
});

export const inscripcionSchema = z.object({
  tallerId: requerido(),
  nombre: requerido(),
  email: requerido(),
  telefono: z.string().optional().nullable(),
  intereses: z.string().optional().nullable(),
});
