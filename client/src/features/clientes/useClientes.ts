"use client";

import { useState, useEffect, useCallback } from "react";
import { clientesService } from "./clientesService";
import { talleresService } from "@/features/talleres/talleresService";
import type { Cliente } from "@/types/cliente";
import type { Taller } from "@/types/taller";

export function useClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [listaTalleres, setListaTalleres] = useState<Taller[]>([]);

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
    fetchClientes();
    talleresService
      .getTodos()
      .then((response) => setListaTalleres(response.data))
      .catch((error) =>
        console.error("Error al cargar lista de talleres:", error),
      );
  }, [fetchClientes]);

  return { clientes, cargando, listaTalleres, fetchClientes };
}
