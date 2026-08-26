import { authService } from '../services/authService.js';
import { HttpError } from '../utils/httpError.js';
import { FRONTEND_URL } from '../config.js';

export const authController = {
  loginAdmin: async (req, res) => {
    try {
      const token = await authService.loginAdmin(req.body);
      res.json({ message: 'Login exitoso', token });
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.status).json({ message: error.message });
      }
      res.status(500).json({ message: 'Error servidor' });
    }
  },

  loginCliente: async (req, res) => {
    try {
      const token = await authService.loginCliente(req.body);
      res.json({ message: 'Login exitoso', token });
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.status).json({ message: error.message });
      }
      console.error('Error login cliente:', error);
      res.status(500).json({ message: 'Error servidor' });
    }
  },

  registrarCliente: async (req, res) => {
    try {
      const { actualizada } = await authService.registrarCliente(req.body);
      const message = actualizada
        ? 'Cuenta actualizada. Revisa tu correo.'
        : 'Registro exitoso. Revisa tu correo para activar tu cuenta.';
      res.status(201).json({ message });
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.status).json({ message: error.message });
      }
      console.error('Error en registro cliente:', error);
      res.status(500).json({ message: 'Error interno del servidor.' });
    }
  },

  verificarToken: async (req, res) => {
    try {
      const ok = await authService.verificarToken(req.params.token);
      if (!ok) return res.redirect(`${FRONTEND_URL}/?error=invalid`);
      res.redirect(`${FRONTEND_URL}/?verified=true`);
    } catch (error) {
      res.status(500).json({ message: 'Error' });
    }
  },
};
