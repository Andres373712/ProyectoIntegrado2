"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { clientesService } from "./clientesService";
import { talleresService } from "@/features/talleres/talleresService";
import { talleresTodosQueryKey } from "@/features/talleres/useTalleres";
import type { Cliente } from "@/types/cliente";

export function useClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [cargando, setCargando] = useState(true);

  // Misma query key que useTalleresAdmin(): si el admin ya visitó
  // /admin/talleres, esta lista se sirve de caché en vez de repetir el fetch.
  const { data: listaTalleres = [] } = useQuery({
    queryKey: talleresTodosQueryKey,
    queryFn: async () => (await talleresService.getTodos()).data,
  });

  const fetchClientes = useCallback(
    async (busqueda = "", inicio = "", fin = "", tallerId = "") => {
      setCargando(true);
      try {
        const response = await clientesService.getClientes({
          buscar: busqueda,
          fechaInicio: inicio,
          fechaFin: fin,
          tallerId,
        });
        setClientes(response.data);
      } catch (error) {
        console.error("Error al cargar clientes:", error);
      } finally {
        setCargando(false);
      }
    },
    [],
  );

  useEffect(() => {
    // Carga de datos al montar: setCargando(true) es sincrónico al inicio de
    // fetchClientes, antes del await real — es el patrón normal de "fetch on
    // mount", no un cascading render evitable.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchClientes();
  }, [fetchClientes]);

  return { clientes, cargando, listaTalleres, fetchClientes };
}
