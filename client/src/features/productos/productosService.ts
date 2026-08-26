import apiClient from "@/shared/lib/apiClient";
import type { Producto } from "@/types/producto";

export const productosService = {
  getActivos: () => apiClient.get<Producto[]>("/api/productos/activos"),
  getTodos: () => apiClient.get<Producto[]>("/api/productos/todos"),
  crear: (formData: FormData) => apiClient.post("/api/productos", formData),
  eliminar: (id: string | number) => apiClient.delete(`/api/productos/${id}`),
};
