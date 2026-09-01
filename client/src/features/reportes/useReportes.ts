"use client";

import { reportesService } from "./reportesService";
import { useAsyncData } from "@/shared/hooks/useAsyncData";
import type { ResumenVentas, ClientaRecurrente, ProductoTop } from "@/types/reportes";

const ERROR_VENTAS = "No pudimos cargar el resumen de ventas. Intenta más tarde.";
const ERROR_CLIENTAS = "No pudimos cargar las clientas recurrentes. Intenta más tarde.";
const ERROR_PRODUCTOS = "No pudimos cargar los productos más vendidos. Intenta más tarde.";

export function useReportes(desde?: string, hasta?: string) {
  const ventas = useAsyncData<ResumenVentas>(
    () => reportesService.getVentas({ desde, hasta }).then((res) => res.data),
    [desde, hasta],
    { errorMessage: ERROR_VENTAS },
  );

  const clientas = useAsyncData<ClientaRecurrente[]>(
    () => reportesService.getClientasRecurrentes({ desde, hasta, limite: 10 }).then((res) => res.data),
    [desde, hasta],
    { initialData: [], errorMessage: ERROR_CLIENTAS },
  );

  const productos = useAsyncData<ProductoTop[]>(
    () => reportesService.getProductosTop({ desde, hasta, limite: 10 }).then((res) => res.data),
    [desde, hasta],
    { initialData: [], errorMessage: ERROR_PRODUCTOS },
  );

  return { ventas, clientas, productos };
}
