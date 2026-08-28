import { inscripcionesRepository } from '../repositories/inscripcionesRepository.js';
import { HttpError } from '../utils/httpError.js';

// No existe una columna de "estado" propia de la inscripción (ni en
// inscripciones ni en talleres) — se deriva comparando la fecha del taller
// con hoy: 'proximo' si aún no ocurre (o no tiene fecha cargada), 'realizado'
// si ya pasó. Las fechas se guardan como texto 'YYYY-MM-DD', por lo que la
// comparación de strings es válida (mismo formato que usa el resto del repo).
const hoyISO = () => new Date().toISOString().slice(0, 10);

export const clienteService = {
  getMisInscripciones: async (clienteId) => {
    const filas = await inscripcionesRepository.getPorClienteId(clienteId);
    const hoy = hoyISO();

    return filas.map((fila) => ({
      id: fila.id,
      tallerId: fila.tallerId,
      taller: fila.taller,
      fecha: fila.fecha,
      lugar: fila.lugar,
      estado: fila.fecha && fila.fecha < hoy ? 'realizado' : 'proximo',
      fechaInscripcion: fila.fechaInscripcion,
    }));
  },

  // Cancela una inscripción propia del cliente autenticado. Solo el dueño de
  // la inscripción puede cancelarla — getPorIdYCliente filtra por clienteId,
  // así que un id ajeno o inexistente cae en el mismo 404 (no revela cuál es
  // el caso). Borrar la fila y decrementar cupos_inscritos del taller es
  // atómico — ver inscripcionesRepository.cancelarInscripcionAtomica, que
  // también usa el flujo de cancelación anónima por link de correo
  // (inscripcionService.cancelarPorToken), para que un cupo liberado quede
  // reflejado de forma consistente sin duplicar esa transacción en cada service.
  cancelarInscripcion: async (clienteId, inscripcionId) => {
    const inscripcion = await inscripcionesRepository.getPorIdYCliente(inscripcionId, clienteId);
    if (!inscripcion) throw new HttpError(404, 'Inscripción no encontrada');

    inscripcionesRepository.cancelarInscripcionAtomica(inscripcion.id, inscripcion.tallerId);
  },
};
