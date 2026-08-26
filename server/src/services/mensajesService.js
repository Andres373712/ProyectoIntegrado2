import { mensajesRepository } from '../repositories/mensajesRepository.js';
import { enviarEmailContacto } from '../../emailService.js';

export const mensajesService = {
  crear: async (datos) => {
    await mensajesRepository.crear(datos);
    await enviarEmailContacto(datos).catch(console.error);
  },

  getTodos: () => mensajesRepository.getTodos(),
};
