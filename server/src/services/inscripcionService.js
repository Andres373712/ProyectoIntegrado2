import { talleresRepository } from '../repositories/talleresRepository.js';
import { clientesRepository } from '../repositories/clientesRepository.js';
import { inscripcionesRepository } from '../repositories/inscripcionesRepository.js';
import { HttpError } from '../utils/httpError.js';
import { enviarEmailConfirmacion } from '../../emailService.js';

export const inscripcionService = {
  inscribir: async ({ tallerId, nombre, email, telefono, intereses }) => {
    const taller = await talleresRepository.getById(tallerId);
    if (!taller) throw new HttpError(404, 'Taller no encontrado');
    if (taller.cupos_inscritos >= taller.cupos_totales) throw new HttpError(409, 'Sin cupos');

    let cliente = await clientesRepository.getByEmail(email);
    if (!cliente) {
      cliente = await clientesRepository.crearDesdeInscripcion({ nombre, email, telefono, intereses });
    }

    await inscripcionesRepository.crear({ clienteId: cliente.id, tallerId });
    await talleresRepository.incrementarCuposInscritos(tallerId);

    enviarEmailConfirmacion({ nombre, email }, taller).catch(console.error);
  },
};
