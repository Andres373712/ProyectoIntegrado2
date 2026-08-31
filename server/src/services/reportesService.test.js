import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../repositories/reportesRepository.js', () => ({
  reportesRepository: {
    getResumenVentas: vi.fn(),
    getVentasPorPeriodo: vi.fn(),
    getClientasRecurrentes: vi.fn(),
    getProductosTop: vi.fn(),
  },
}));

const { reportesRepository } = await import('../repositories/reportesRepository.js');
const { reportesService } = await import('./reportesService.js');

describe('reportesService', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('getVentas', () => {
    it('combina resumen + porPeriodo y calcula el ticket promedio', async () => {
      reportesRepository.getResumenVentas.mockResolvedValue({ totalVentas: 3000, totalPedidos: 3 });
      reportesRepository.getVentasPorPeriodo.mockResolvedValue([{ periodo: '2026-01-01', totalVentas: 3000, totalPedidos: 3 }]);

      const resultado = await reportesService.getVentas({ desde: '2026-01-01', hasta: '2026-01-31' });

      expect(reportesRepository.getResumenVentas).toHaveBeenCalledWith({ desde: '2026-01-01', hasta: '2026-01-31' });
      expect(reportesRepository.getVentasPorPeriodo).toHaveBeenCalledWith({ desde: '2026-01-01', hasta: '2026-01-31' });
      expect(resultado).toEqual({
        totalVentas: 3000,
        totalPedidos: 3,
        ticketPromedio: 1000,
        porPeriodo: [{ periodo: '2026-01-01', totalVentas: 3000, totalPedidos: 3 }],
      });
    });

    it('ticketPromedio es 0 (no NaN/Infinity) cuando no hay pedidos', async () => {
      reportesRepository.getResumenVentas.mockResolvedValue({ totalVentas: 0, totalPedidos: 0 });
      reportesRepository.getVentasPorPeriodo.mockResolvedValue([]);

      const resultado = await reportesService.getVentas({});
      expect(resultado.ticketPromedio).toBe(0);
    });
  });

  describe('getClientasRecurrentes', () => {
    it('usa límite 10 por defecto', async () => {
      reportesRepository.getClientasRecurrentes.mockResolvedValue([]);
      await reportesService.getClientasRecurrentes({});
      expect(reportesRepository.getClientasRecurrentes).toHaveBeenCalledWith({
        desde: undefined,
        hasta: undefined,
        limite: 10,
      });
    });

    it('respeta el límite explícito', async () => {
      reportesRepository.getClientasRecurrentes.mockResolvedValue([]);
      await reportesService.getClientasRecurrentes({ limite: 5 });
      expect(reportesRepository.getClientasRecurrentes).toHaveBeenCalledWith({
        desde: undefined,
        hasta: undefined,
        limite: 5,
      });
    });
  });

  describe('getProductosTop', () => {
    it('usa límite 10 por defecto', async () => {
      reportesRepository.getProductosTop.mockResolvedValue([]);
      await reportesService.getProductosTop({});
      expect(reportesRepository.getProductosTop).toHaveBeenCalledWith({
        desde: undefined,
        hasta: undefined,
        limite: 10,
      });
    });

    it('aplica el fallback de nombre cuando el producto fue eliminado', async () => {
      reportesRepository.getProductosTop.mockResolvedValue([
        { productoId: 42, nombre: null, cantidadVendida: 3, totalGenerado: 6000 },
        { productoId: 7, nombre: 'Vela aromática', cantidadVendida: 1, totalGenerado: 2000 },
      ]);

      const resultado = await reportesService.getProductosTop({});
      expect(resultado[0].nombre).toBe('Producto eliminado (id 42)');
      expect(resultado[1].nombre).toBe('Vela aromática');
    });
  });
});
