import { talleresRepository } from '../repositories/talleresRepository.js';
import { clientesRepository } from '../repositories/clientesRepository.js';
import { inscripcionesRepository } from '../repositories/inscripcionesRepository.js';
import { HttpError } from '../utils/httpError.js';
import { enviarEmailConfirmacion } from '../../emailService.js';
import { db } from '../db/client.js';

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
    // Fast-path: evita seguir resolviendo/creando el cliente si a esta altura
    // ya no queda cupo. NO es la fuente de verdad contra la condición de
    // carrera (dos inscripciones concurrentes pueden pasar este chequeo con
    // la misma foto de "cupos_inscritos") — esa la da la sentencia UPDATE
    // atómica de incrementarCuposInscritos dentro de la transacción de abajo.
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

    // Transacción síncrona de better-sqlite3: el callback no puede tener
    // awaits adentro (better-sqlite3 hace BEGIN/COMMIT alrededor de una
    // llamada síncrona; si el callback fuera async, el COMMIT ocurriría
    // antes de que terminen sus operaciones). Por eso ambos repositorios
    // ejecutan con `.run()` en vez de ser awaiteados acá.
    // Se incrementa primero: si el UPDATE atómico no afecta ninguna fila
    // (ya no había cupo), no se llega a crear la inscripción y no hace falta
    // revertir nada.
    const huboCupo = db.transaction(() => {
      const incrementado = talleresRepository.incrementarCuposInscritos(tallerId);
      if (!incrementado) return false;
      inscripcionesRepository.crear({ clienteId, tallerId });
      return true;
    });

    if (!huboCupo) throw new HttpError(409, 'Sin cupos');

    enviarEmailConfirmacion({ nombre, email }, taller).catch(console.error);
  },
};
