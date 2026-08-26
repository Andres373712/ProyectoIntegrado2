"use client";

import { useState, useEffect } from "react";
import { talleresService } from "./talleresService";
import type { Taller } from "@/types/taller";

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
  const [talleres, setTalleres] = useState<Taller[]>([]);

  const fetchTalleres = () => {
    talleresService
      .getTodos()
      .then((response) => setTalleres(response.data))
      .catch((error) =>
        console.error(
          "Error al cargar talleres:",
          error.response?.data?.message,
        ),
      );
  };

  useEffect(() => {
    fetchTalleres();
  }, []);

  return { talleres, fetchTalleres };
}
