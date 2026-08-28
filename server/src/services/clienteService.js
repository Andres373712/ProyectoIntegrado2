import { inscripcionesRepository } from '../repositories/inscripcionesRepository.js';

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
};
