"use client";

import { useState, useEffect } from "react";
import { mensajesService } from "./mensajesService";
import type { MensajeContacto } from "@/types/mensaje";

export function useMensajesContacto() {
  const [mensajes, setMensajes] = useState<MensajeContacto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    mensajesService
      .getMensajes()
      .then((response) => setMensajes(response.data))
      .catch((err) => {
        setError(
          "No se pudieron cargar los mensajes. " +
            (err.response?.data?.message || ""),
        );
      })
      .finally(() => setLoading(false));
  }, []);

  return { mensajes, loading, error };
}
