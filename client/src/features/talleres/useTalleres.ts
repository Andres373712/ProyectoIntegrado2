"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { talleresService } from "./talleresService";
import { useAsyncData } from "@/shared/hooks/useAsyncData";
import type { Taller } from "@/types/taller";

export const talleresTodosQueryKey = ["talleres", "todos"] as const;

const ERROR_ACTIVOS = "No pudimos cargar los talleres. Intenta más tarde.";
const ERROR_TALLER = "No pudimos cargar este taller. Intenta más tarde.";
const ERROR_ADMIN = "No pudimos cargar los talleres. Intenta más tarde.";

export function useTalleresActivos() {
  const { data, loading, error } = useAsyncData<Taller[]>(
    () => talleresService.getActivos().then((res) => res.data),
    [],
    { initialData: [], errorMessage: ERROR_ACTIVOS },
  );

  return { talleres: data ?? [], cargando: loading, error };
}

export function useTaller(id: string | number) {
  const { data, loading, error } = useAsyncData<Taller | null>(
    () => talleresService.getById(id).then((res) => res.data),
    [id],
    { initialData: null, errorMessage: ERROR_TALLER },
  );

  return { taller: data ?? null, cargando: loading, error };
}

export function useTalleresAdmin() {
  const queryClient = useQueryClient();

  const { data, error } = useQuery({
    queryKey: talleresTodosQueryKey,
    queryFn: async () => {
      try {
        return (await talleresService.getTodos()).data;
      } catch (err) {
        console.error("Error al cargar talleres:", isAxiosError(err) ? err.response?.data?.message : err);
        // Relanzamos para que React Query marque la query en error de verdad
        // (antes se tragaba el error acá y devolvía [], así que la pantalla
        // de admin nunca se enteraba de que la carga había fallado).
        throw err;
      }
    },
  });

  const fetchTalleres = () => {
    queryClient.invalidateQueries({ queryKey: talleresTodosQueryKey });
  };

  return {
    talleres: data ?? [],
    error: error ? ERROR_ADMIN : null,
    fetchTalleres,
  };
}
