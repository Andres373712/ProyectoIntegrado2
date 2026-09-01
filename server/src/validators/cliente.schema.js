import { z } from 'zod';

export const clienteActualizarSchema = z.object({
  nombre: z.string({ required_error: 'El nombre es obligatorio' }).trim().min(1, 'El nombre es obligatorio'),
  email: z
    .string({ required_error: 'El email es obligatorio' })
    .trim()
    .min(1, 'El email es obligatorio')
    .email('Email inválido.'),
  telefono: z.string().trim().optional().default(''),
  intereses: z.string().trim().optional().default(''),
});

export const notaCrearSchema = z.object({
  nota: z.string({ required_error: 'La nota no puede estar vacía' }).trim().min(1, 'La nota no puede estar vacía'),
});
