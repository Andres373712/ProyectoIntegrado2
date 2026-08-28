import { talleresRepository } from '../repositories/talleresRepository.js';
import { clientesRepository } from '../repositories/clientesRepository.js';
import { inscripcionesRepository } from '../repositories/inscripcionesRepository.js';
import { HttpError } from '../utils/httpError.js';
import { enviarEmailConfirmacion } from '../../emailService.js';

export const inscripcionService = {
  // "usuarioAutenticado" es el payload del JWT (req.user) cuando la petición
  // trae un token válido de cliente — lo pone el middleware usuarioOpcional.
  // Si está presente, la inscripción se liga directamente a esa cuenta
  // (cliente_id = usuarioAutenticado.id) en vez de resolver el cliente por el
  // email que venga en el formulario. El flujo anónimo (sin token, o token de
  // admin) queda idéntico al de siempre: busca/crea el cliente por email.
  inscribir: async ({ tallerId, nombre, email, telefono, intereses }, usuarioAutenticado) => {
    const taller = await talleresRepository.getById(tallerId);
    if (!taller) throw new HttpError(404, 'Taller no encontrado');
    if (taller.cupos_inscritos >= taller.cupos_totales) throw new HttpError(409, 'Sin cupos');

    let clienteId;
    if (usuarioAutenticado?.rol === 'cliente') {
      clienteId = usuarioAutenticado.id;
    } else {
      let cliente = await clientesRepository.getByEmail(email);
      if (!cliente) {
        cliente = await clientesRepository.crearDesdeInscripcion({ nombre, email, telefono, intereses });
      }
      clienteId = cliente.id;
    }

    await inscripcionesRepository.crear({ clienteId, tallerId });
    await talleresRepository.incrementarCuposInscritos(tallerId);

    enviarEmailConfirmacion({ nombre, email }, taller).catch(console.error);
  },
};
