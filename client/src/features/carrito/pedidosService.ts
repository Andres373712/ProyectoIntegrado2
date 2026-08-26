import apiClient from "@/shared/lib/apiClient";

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

// NOTA: POST /api/pedido todavía no existe en el backend (ver diagnóstico,
// sección "Funcionalidades a medio construir"). Este servicio queda listo
// para cuando se implemente el endpoint.
export const pedidosService = {
  crear: (datos: PedidoData) => apiClient.post("/api/pedido", datos),
};
