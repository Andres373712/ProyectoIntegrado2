"use client";

import { isAxiosError } from "axios";
import { pedidosService } from "./pedidosService";
import { useAsyncData } from "@/shared/hooks/useAsyncData";
import type { PedidoAdmin } from "@/types/pedido";

function mensajeError(err: unknown): string {
  const detalle = isAxiosError(err) ? err.response?.data?.message : undefined;
  return "No se pudieron cargar los pedidos. " + (detalle || "");
}

export function usePedidosAdmin() {
  const { data, loading, error, refetch } = useAsyncData<PedidoAdmin[]>(
    () => pedidosService.getTodos().then((res) => res.data),
    [],
    { initialData: [], errorMessage: mensajeError },
  );

  return { pedidos: data ?? [], loading, error, refetch };
}
