import apiClient from "@/shared/lib/apiClient";
import type { Taller } from "@/types/taller";

export const talleresService = {
  getActivos: () => apiClient.get<Taller[]>("/api/talleres/activos"),
  getTodos: () => apiClient.get<Taller[]>("/api/talleres/todos"),
  getById: (id: string | number) => apiClient.get<Taller>(`/api/taller/${id}`),
  crear: (formData: FormData) => apiClient.post("/api/talleres", formData),
  actualizar: (id: string | number, formData: FormData) =>
    apiClient.put(`/api/talleres/${id}`, formData),
  eliminar: (id: string | number) => apiClient.delete(`/api/talleres/${id}`),
};
