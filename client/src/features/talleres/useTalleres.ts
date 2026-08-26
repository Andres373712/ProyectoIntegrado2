"use client";

import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { talleresService } from "./talleresService";
import type { Taller } from "@/types/taller";

export const talleresTodosQueryKey = ["talleres", "todos"] as const;

export function useTalleresActivos() {
  const [talleres, setTalleres] = useState<Taller[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    talleresService
      .getActivos()
      .then((response) => {
        setTalleres(response.data);
        setCargando(false);
      })
      .catch((error) => {
        console.error("Error al cargar talleres:", error);
        setCargando(false);
      });
  }, []);

  return { talleres, cargando };
}

export function useTaller(id: string | number) {
  const [taller, setTaller] = useState<Taller | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    talleresService
      .getById(id)
      .then((response) => {
        setTaller(response.data);
        setCargando(false);
      })
      .catch((error) => {
        console.error("Error al cargar el taller:", error);
        setCargando(false);
      });
  }, [id]);

  return { taller, cargando };
}

export function useTalleresAdmin() {
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: talleresTodosQueryKey,
    queryFn: async () => {
      try {
        return (await talleresService.getTodos()).data;
      } catch (error) {
        const mensaje = isAxiosError(error) ? error.response?.data?.message : error;
        console.error("Error al cargar talleres:", mensaje);
        return [];
      }
    },
  });

  const fetchTalleres = () => {
    queryClient.invalidateQueries({ queryKey: talleresTodosQueryKey });
  };

  return { talleres: data ?? [], fetchTalleres };
}
