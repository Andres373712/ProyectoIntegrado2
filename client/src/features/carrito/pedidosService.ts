import apiClient from "@/shared/lib/apiClient";
import type { PedidoAdmin } from "@/types/pedido";

export interface PedidoItem {
  id: number;
  nombre: string;
  cantidad: number;
  precio: number;
}

export interface PedidoData {
  nombre: string;
  email: string;
  telefono: string;
  productos: PedidoItem[];
  total: number;
}

export const pedidosService = {
  crear: (datos: PedidoData) => apiClient.post("/api/pedido", datos),

  // Uso exclusivo del panel de admin (requiere token de admin).
  getTodos: () => apiClient.get<PedidoAdmin[]>("/api/pedidos/todos"),
};
