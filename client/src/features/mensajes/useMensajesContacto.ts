"use client";

import { isAxiosError } from "axios";
import { mensajesService } from "./mensajesService";
import { useAsyncData } from "@/shared/hooks/useAsyncData";
import type { MensajeContacto } from "@/types/mensaje";

function mensajeError(err: unknown): string {
  const detalle = isAxiosError(err) ? err.response?.data?.message : undefined;
  return "No se pudieron cargar los mensajes. " + (detalle || "");
}

export function useMensajesContacto() {
  const { data, loading, error } = useAsyncData<MensajeContacto[]>(
    () => mensajesService.getMensajes().then((res) => res.data),
    [],
    { initialData: [], errorMessage: mensajeError },
  );

  return { mensajes: data ?? [], loading, error };
}
