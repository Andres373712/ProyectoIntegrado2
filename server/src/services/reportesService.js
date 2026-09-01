import { reportesRepository } from '../repositories/reportesRepository.js';

export const reportesService = {
  getVentas: async ({ desde, hasta } = {}) => {
    const [resumen, porPeriodo] = await Promise.all([
      reportesRepository.getResumenVentas({ desde, hasta }),
      reportesRepository.getVentasPorPeriodo({ desde, hasta }),
    ]);
    const ticketPromedio = resumen.totalPedidos > 0 ? resumen.totalVentas / resumen.totalPedidos : 0;
    return { ...resumen, ticketPromedio, porPeriodo };
  },

  getClientasRecurrentes: ({ desde, hasta, limite = 10 } = {}) =>
    reportesRepository.getClientasRecurrentes({ desde, hasta, limite }),

  getProductosTop: async ({ desde, hasta, limite = 10 } = {}) => {
    const filas = await reportesRepository.getProductosTop({ desde, hasta, limite });
    return filas.map((fila) => ({
      ...fila,
      nombre: fila.nombre || `Producto eliminado (id ${fila.productoId})`,
    }));
  },
};
