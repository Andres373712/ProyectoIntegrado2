import jwt from 'jsonwebtoken';
import { talleresRepository } from '../repositories/talleresRepository.js';
import { clientesRepository } from '../repositories/clientesRepository.js';
import { inscripcionesRepository } from '../repositories/inscripcionesRepository.js';
import { HttpError } from '../utils/httpError.js';
import { enviarEmailConfirmacion } from '../../emailService.js';
import { db } from '../db/client.js';
import { logger } from '../utils/logger.js';

// Token de cancelación anónima por link de correo (distinto de los JWT de
// sesión): firma { tipo, inscripcionId } para que el link del email pueda
// identificar y cancelar la inscripción sin que quien lo abre esté logueado.
// Reutiliza JWT_SECRET (mismo secreto que usa el resto del sistema para
// sesión) porque el propósito es firmar, no autenticar una sesión — no hace
// falta un secreto aparte. 90 días: para entonces el taller ya pasó casi
// siempre, pero igual da margen a que alguien cancele con más antelación.
const TIPO_TOKEN_CANCELACION = 'cancelar-inscripcion';
const firmarTokenCancelacion = (inscripcionId) =>
  jwt.sign({ tipo: TIPO_TOKEN_CANCELACION, inscripcionId }, process.env.JWT_SECRET, { expiresIn: '90d' });

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

    // Chequeo de duplicado: va DESPUÉS de resolver clienteId (no antes) porque
    // el flujo anónimo recién sabe el clienteId real una vez que buscó/creó
    // el cliente por email — chequear antes usaría un clienteId que todavía
    // no existe. No es la fuente de verdad contra la condición de carrera
    // (dos inscripciones concurrentes pueden pasar este chequeo con la misma
    // foto del estado) — esa la da el índice único (cliente_id, taller_id) en
    // la base de datos, ver el catch de SQLITE_CONSTRAINT_UNIQUE más abajo.
    const yaInscrito = await inscripcionesRepository.existeInscripcion(clienteId, tallerId);
    if (yaInscrito) throw new HttpError(409, 'Ya estás inscrito en este taller');

    // Transacción síncrona de better-sqlite3: el callback no puede tener
    // awaits adentro (better-sqlite3 hace BEGIN/COMMIT alrededor de una
    // llamada síncrona; si el callback fuera async, el COMMIT ocurriría
    // antes de que terminen sus operaciones). Por eso ambos repositorios
    // ejecutan con `.run()` en vez de ser awaiteados acá.
    // Se incrementa primero: si el UPDATE atómico no afecta ninguna fila
    // (ya no había cupo), no se llega a crear la inscripción y no hace falta
    // revertir nada.
    let inscripcionId;
    let huboCupo;
    try {
      huboCupo = db.transaction(() => {
        const incrementado = talleresRepository.incrementarCuposInscritos(tallerId);
        if (!incrementado) return false;
        inscripcionId = inscripcionesRepository.crear({ clienteId, tallerId });
        return true;
      });
    } catch (error) {
      // Red de seguridad final contra la misma condición de carrera que ya
      // cierra incrementarCuposInscritos, pero para duplicados: si dos
      // inscripciones del mismo cliente+taller llegan aquí casi a la vez,
      // ambas pueden pasar el chequeo de existeInscripcion de arriba (mismo
      // problema de "foto" que cupos); el índice único de la base de datos
      // es quien realmente lo impide, rechazando el segundo INSERT. Sin este
      // catch, ese rechazo se propagaría como un 500 genérico.
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        throw new HttpError(409, 'Ya estás inscrito en este taller');
      }
      throw error;
    }

    if (!huboCupo) throw new HttpError(409, 'Sin cupos');

    const tokenCancelacion = firmarTokenCancelacion(inscripcionId);
    enviarEmailConfirmacion({ nombre, email }, taller, tokenCancelacion).catch((error) =>
      logger.error({ err: error }, 'Error enviando email de confirmación de inscripción'),
    );
  },

  // Cancelación anónima por link de correo (sin login): distinta del flujo
  // autenticado de Mi Cuenta (clienteService.cancelarInscripcion), pensada
  // para que quien recibió el email de confirmación pueda cancelar
  // directamente desde ahí. La identidad la garantiza la firma del JWT, no
  // una sesión — por eso busca la inscripción solo por id (getPorId), sin
  // filtrar por cliente.
  cancelarPorToken: async (token) => {
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      throw new HttpError(400, 'El enlace de cancelación es inválido o ya expiró.');
    }

    if (payload.tipo !== TIPO_TOKEN_CANCELACION) {
      throw new HttpError(400, 'El enlace de cancelación es inválido.');
    }

    const inscripcion = await inscripcionesRepository.getPorId(payload.inscripcionId);
    // No distingue "el id nunca existió" de "ya fue cancelada antes" (mismo
    // token reusado): en ambos casos, para quien hace clic, el resultado es
    // el mismo — ya no hay nada que cancelar. Un mensaje claro evita que un
    // segundo clic en el mismo link (o un link viejo) se vea como un error
    // genérico del servidor.
    if (!inscripcion) {
      throw new HttpError(404, 'Esta inscripción ya fue cancelada o no existe.');
    }

    inscripcionesRepository.cancelarInscripcionAtomica(inscripcion.id, inscripcion.tallerId);

    return {
      message: 'Inscripción cancelada correctamente',
      nombre: inscripcion.nombreCliente,
      taller: inscripcion.taller,
    };
  },
};
