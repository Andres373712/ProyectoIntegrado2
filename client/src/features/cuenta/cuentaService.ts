import apiClient from "@/shared/lib/apiClient";

// Llamadas crudas a la API de "Mi Cuenta" para la clienta autenticada.
// El mapeo de los campos que devuelve el backend a los tipos que usa la UI
// vive únicamente en useMiCuenta.ts (mapInscripcion / mapPedido) — si el
// backend cambia nombres de campos, solo hay que tocar ese archivo.
export const cuentaService = {
  getInscripciones: () => apiClient.get("/api/cliente/mis-inscripciones"),
  getPedidos: () => apiClient.get("/api/cliente/mis-pedidos"),
  cancelar: (id: number) => apiClient.delete(`/api/cliente/mis-inscripciones/${id}`),
};
