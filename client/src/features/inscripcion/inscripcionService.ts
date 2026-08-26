import apiClient from "@/shared/lib/apiClient";

export interface InscripcionData {
  tallerId: string | number;
  nombre: string;
  email: string;
  telefono: string;
  intereses?: string;
}

export const inscripcionService = {
  inscribir: (datos: InscripcionData) => apiClient.post("/api/inscripcion", datos),
  // NOTA: GET /api/cancelar-inscripcion/:token todavía no existe en el backend.
  cancelar: (token: string) => apiClient.get(`/api/cancelar-inscripcion/${token}`),
};
