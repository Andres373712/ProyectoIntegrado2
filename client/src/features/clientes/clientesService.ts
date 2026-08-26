import apiClient from "@/shared/lib/apiClient";
import type { Cliente, NotaFidelizacion, HistorialTaller } from "@/types/cliente";

export interface FiltrosClientes {
  buscar?: string;
  fechaInicio?: string;
  fechaFin?: string;
  tallerId?: string;
}

export const clientesService = {
  getClientes: (filtros: FiltrosClientes = {}) => {
    const params = new URLSearchParams();
    if (filtros.buscar) params.append("buscar", filtros.buscar);
    if (filtros.fechaInicio) params.append("fechaInicio", filtros.fechaInicio);
    if (filtros.fechaFin) params.append("fechaFin", filtros.fechaFin);
    if (filtros.tallerId) params.append("tallerId", filtros.tallerId);
    const queryString = params.toString();
    return apiClient.get<Cliente[]>(`/api/clientes${queryString ? `?${queryString}` : ""}`);
  },
  getCliente: (id: string | number) => apiClient.get<Cliente>(`/api/cliente/${id}`),
  actualizarCliente: (id: string | number, datos: Partial<Cliente>) =>
    apiClient.put(`/api/cliente/${id}`, datos),
  getHistorial: (id: string | number) =>
    apiClient.get<HistorialTaller[]>(`/api/cliente/${id}/historial`),
  getNotas: (id: string | number) =>
    apiClient.get<NotaFidelizacion[]>(`/api/cliente/${id}/notas`),
  crearNota: (id: string | number, nota: string) =>
    apiClient.post(`/api/cliente/${id}/notas`, { nota }),
};
