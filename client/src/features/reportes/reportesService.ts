import apiClient from "@/shared/lib/apiClient";
import type { ResumenVentas, ClientaRecurrente, ProductoTop } from "@/types/reportes";

export interface RangoFechas {
  desde?: string;
  hasta?: string;
}

export const reportesService = {
  getVentas: (params: RangoFechas) =>
    apiClient.get<ResumenVentas>("/api/reportes/ventas", { params }),
  getClientasRecurrentes: (params: RangoFechas & { limite?: number }) =>
    apiClient.get<ClientaRecurrente[]>("/api/reportes/clientas-recurrentes", { params }),
  getProductosTop: (params: RangoFechas & { limite?: number }) =>
    apiClient.get<ProductoTop[]>("/api/reportes/productos-top", { params }),
};
