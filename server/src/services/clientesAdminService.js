import { clientesRepository } from '../repositories/clientesRepository.js';
import { inscripcionesRepository } from '../repositories/inscripcionesRepository.js';
import { notasFidelizacionRepository } from '../repositories/notasFidelizacionRepository.js';
import { HttpError } from '../utils/httpError.js';

// fechaFin llega como "YYYY-MM-DD" (un <input type="date">) pero
// fecha_registro se guarda con hora completa (ISO 8601, ver
// clientesRepository). Comparando strings tal cual, "2026-08-31" es "menor"
// que "2026-08-31T10:00:00.000Z" (el prefijo más corto ordena antes), así que
// sin este ajuste cualquier clienta registrada el día exacto del límite
// quedaba afuera del filtro. Se extiende al final del día para que sea
// inclusivo.
const finDelDia = (fechaFin) => (fechaFin ? `${fechaFin}T23:59:59.999Z` : undefined);

export const clientesAdminService = {
  getConFiltros: (filtros = {}) =>
    clientesRepository.getConFiltros({ ...filtros, fechaFin: finDelDia(filtros.fechaFin) }),

  getById: (id) => clientesRepository.getById(id),

  actualizar: async (id, datos) => {
    try {
      await clientesRepository.actualizarDatosAdmin(id, datos);
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        throw new HttpError(409, 'Ya existe otra clienta con ese email.');
      }
      throw error;
    }
  },

  // Misma fuente que "Mi Cuenta" (inscripcionesRepository.getPorClienteId),
  // remapeada a los nombres que espera la vista de historial del admin.
  getHistorial: async (id) => {
    const filas = await inscripcionesRepository.getPorClienteId(id);
    return filas.map((fila) => ({
      nombre: fila.taller,
      fecha: fila.fecha,
      fecha_inscripcion: fila.fechaInscripcion,
    }));
  },

  getNotas: (id) => notasFidelizacionRepository.getPorClienteId(id),

  crearNota: (id, nota) => notasFidelizacionRepository.crear({ clienteId: id, nota }),
};
