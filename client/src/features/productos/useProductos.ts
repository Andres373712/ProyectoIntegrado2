"use client";

import { productosService } from "./productosService";
import { useAsyncData } from "@/shared/hooks/useAsyncData";
import type { Producto } from "@/types/producto";

const ERROR_ACTIVOS = "No pudimos cargar los productos. Intenta más tarde.";
const ERROR_ADMIN = "No pudimos cargar el inventario. Intenta más tarde.";

export function useProductosActivos() {
  const { data, loading, error } = useAsyncData<Producto[]>(
    () => productosService.getActivos().then((res) => res.data),
    [],
    { initialData: [], errorMessage: ERROR_ACTIVOS },
  );

  return { productos: data ?? [], cargando: loading, error };
}

export function useProductosAdmin() {
  const { data, error, refetch } = useAsyncData<Producto[]>(
    () => productosService.getTodos().then((res) => res.data),
    [],
    { initialData: [], errorMessage: ERROR_ADMIN },
  );

  return { productos: data ?? [], error, fetchProductos: refetch };
}
