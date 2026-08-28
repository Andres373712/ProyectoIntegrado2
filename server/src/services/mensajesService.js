import { mensajesRepository } from '../repositories/mensajesRepository.js';
import { enviarEmailContacto } from '../../emailService.js';
import { logger } from '../utils/logger.js';

export const mensajesService = {
  crear: async (datos) => {
    await mensajesRepository.crear(datos);
    await enviarEmailContacto(datos).catch((error) =>
      logger.error({ err: error }, 'Error enviando email de contacto'),
    );
  },

  getTodos: (paginacion) => mensajesRepository.getTodos(paginacion),

  contarTodos: () => mensajesRepository.contarTodos(),
};
