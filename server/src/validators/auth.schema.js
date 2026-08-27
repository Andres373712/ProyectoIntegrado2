import { z } from 'zod';

// Los endpoints de login no validaban nada antes (fallaban recién en la
// consulta a la DB); se mantiene igual de permisivo, solo se exige presencia.
export const loginSchema = z.object({
  email: z.string().optional(),
  password: z.string().optional(),
});

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.,])[A-Za-z\d@$!%*?&.,]{8,}$/;

export const forgotPasswordSchema = z.object({
  email: z
    .string({ required_error: 'Falta el email.' })
    .min(1, 'Falta el email.')
    .email('Email inválido.'),
});

export const resetPasswordSchema = z.object({
  token: z.string({ required_error: 'Falta el token.' }).min(1, 'Falta el token.'),
  newPassword: z
    .string({ required_error: 'Falta la nueva contraseña.' })
    .min(1, 'Falta la nueva contraseña.')
    .regex(PASSWORD_REGEX, 'La contraseña debe tener mínimo 8 caracteres, mayúscula, número y símbolo.'),
});

export const registroClienteSchema = z.object({
  nombre: z.string({ required_error: 'Faltan campos obligatorios.' }).trim().min(1, 'Faltan campos obligatorios.'),
  email: z
    .string({ required_error: 'Faltan campos obligatorios.' })
    .min(1, 'Faltan campos obligatorios.')
    .email('Email inválido.'),
  telefono: z.string({ required_error: 'Faltan campos obligatorios.' }).trim().min(1, 'Faltan campos obligatorios.'),
  password: z
    .string({ required_error: 'Faltan campos obligatorios.' })
    .min(1, 'Faltan campos obligatorios.')
    .regex(PASSWORD_REGEX, 'La contraseña debe tener mínimo 8 caracteres, mayúscula, número y símbolo.'),
  aceptaTerminos: z.literal(true, {
    errorMap: () => ({ message: 'Debes aceptar los términos y condiciones.' }),
  }),
});
