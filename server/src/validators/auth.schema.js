import { z } from 'zod';

// El endpoint de login admin no validaba nada antes (fallaba recién en la
// consulta a la DB). Se exige presencia real de ambos campos (antes el
// schema usaba z.string().optional(), que no rechazaba ni campos ausentes:
// aplicarlo tal cual no habría cambiado el comportamiento). No se valida
// formato de email ni longitud de password acá: ese trabajo ya lo hace la
// consulta a la DB / bcrypt.compare, y mantenerlo así evita duplicar reglas
// de negocio en dos capas.
export const loginSchema = z.object({
  email: z.string({ required_error: 'Faltan credenciales.' }).min(1, 'Faltan credenciales.'),
  password: z.string({ required_error: 'Faltan credenciales.' }).min(1, 'Faltan credenciales.'),
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
