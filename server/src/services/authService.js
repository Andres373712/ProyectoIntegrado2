import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { adminRepository } from '../repositories/adminRepository.js';
import { clientesRepository } from '../repositories/clientesRepository.js';
import { HttpError } from '../utils/httpError.js';
import { enviarEmailVerificacion } from '../../emailService.js';

const firmarToken = (payload) => jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });

export const authService = {
  loginAdmin: async ({ email, password }) => {
    const cuenta = await adminRepository.getByEmail(email);
    if (!cuenta || !(await bcrypt.compare(password, cuenta.password_hash))) {
      throw new HttpError(401, 'Credenciales inválidas');
    }
    return firmarToken({ id: cuenta.id, email: cuenta.email, rol: 'admin' });
  },

  loginCliente: async ({ email, password }) => {
    const cliente = await clientesRepository.getByEmail(email);
    if (!cliente) throw new HttpError(404, 'Correo no registrado.');
    if (!cliente.password_hash) throw new HttpError(403, 'Debes registrarte primero.');
    if (!cliente.verificado) throw new HttpError(403, 'Verifica tu correo primero.');

    const valido = await bcrypt.compare(password, cliente.password_hash);
    if (!valido) throw new HttpError(401, 'Contraseña incorrecta.');

    return firmarToken({ id: cliente.id, email: cliente.email, rol: 'cliente' });
  },

  registrarCliente: async ({ nombre, email, telefono, password }) => {
    const emailNormalizado = email.toLowerCase().trim();
    const nombreNormalizado = nombre.trim();
    const existente = await clientesRepository.getByEmail(emailNormalizado);

    const tokenVerificacion = uuidv4();
    const passwordHash = await bcrypt.hash(password, 10);

    if (existente && !existente.password_hash) {
      await clientesRepository.actualizarParaRegistro(existente.id, {
        nombre: nombreNormalizado,
        telefono,
        passwordHash,
        tokenVerificacion,
      });
      await enviarEmailVerificacion({ nombre: nombreNormalizado, email: emailNormalizado }, tokenVerificacion);
      return { actualizada: true };
    }

    if (existente && existente.password_hash) {
      throw new HttpError(409, 'Ya existe una cuenta con este email.');
    }

    await clientesRepository.crearParaRegistro({
      nombre: nombreNormalizado,
      email: emailNormalizado,
      telefono,
      passwordHash,
      tokenVerificacion,
    });
    await enviarEmailVerificacion({ nombre: nombreNormalizado, email: emailNormalizado }, tokenVerificacion);
    return { actualizada: false };
  },

  verificarToken: async (token) => {
    const cliente = await clientesRepository.getByTokenVerificacion(token);
    if (!cliente) return false;
    await clientesRepository.marcarVerificado(cliente.id);
    return true;
  },
};
