"use client";

import { testimoniosService } from "./testimoniosService";
import { useAsyncData } from "@/shared/hooks/useAsyncData";
import type { Testimonio } from "@/types/testimonio";

const ERROR_ACTIVOS = "No pudimos cargar los testimonios. Intenta más tarde.";
const ERROR_ADMIN = "No pudimos cargar los testimonios cargados. Intenta más tarde.";

export function useTestimoniosActivos() {
  const { data, loading, error } = useAsyncData<Testimonio[]>(
    () => testimoniosService.getActivos().then((res) => res.data),
    [],
    { initialData: [], errorMessage: ERROR_ACTIVOS },
  );

  return { testimonios: data ?? [], cargando: loading, error };
}

export function useTestimoniosAdmin() {
  const { data, error, refetch } = useAsyncData<Testimonio[]>(
    () => testimoniosService.getTodos().then((res) => res.data),
    [],
    { initialData: [], errorMessage: ERROR_ADMIN },
  );

  return { testimonios: data ?? [], error, fetchTestimonios: refetch };
}
