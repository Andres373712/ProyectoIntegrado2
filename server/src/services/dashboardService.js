import { dashboardRepository } from '../repositories/dashboardRepository.js';

export const dashboardService = {
  // Las 3 consultas se mantienen secuenciales a propósito: paralelizarlas con
  // Promise.all es una mejora de rendimiento asignada a la iteración 4, no a
  // este refactor de arquitectura.
  getResumen: async () => {
    const eventosCalendario = await dashboardRepository.getEventosCalendario();
    const totalClientas = await dashboardRepository.getTotalClientas();
    const totalTalleresActivos = await dashboardRepository.getTotalTalleresActivos();
    return { eventosCalendario, totalClientas, totalTalleresActivos };
  },
};
