import apiClient from "@/shared/lib/apiClient";
import type { MensajeContacto } from "@/types/mensaje";

export const mensajesService = {
  getMensajes: () => apiClient.get<MensajeContacto[]>("/api/mensajes-contacto"),
  enviarContacto: (datos: { nombre: string; email: string; telefono?: string; mensaje: string }) =>
    apiClient.post("/api/contacto", datos),
};
