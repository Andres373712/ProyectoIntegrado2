import apiClient from "@/shared/lib/apiClient";
import type { Testimonio } from "@/types/testimonio";

export interface TestimonioPayload {
  nombre: string;
  curso?: string;
  comentario: string;
  calificacion: number;
  activo?: boolean;
}

export const testimoniosService = {
  getActivos: () => apiClient.get<Testimonio[]>("/api/testimonios/activos"),
  getTodos: () => apiClient.get<Testimonio[]>("/api/testimonios/todos"),
  crear: (datos: TestimonioPayload) => apiClient.post("/api/testimonios", datos),
  actualizar: (id: string | number, datos: TestimonioPayload) =>
    apiClient.put(`/api/testimonios/${id}`, datos),
  eliminar: (id: string | number) => apiClient.delete(`/api/testimonios/${id}`),
};
