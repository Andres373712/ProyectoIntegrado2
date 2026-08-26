"use client";

import { useState, useEffect } from "react";
import { testimoniosService } from "./testimoniosService";
import type { Testimonio } from "@/types/testimonio";

export function useTestimoniosActivos() {
  const [testimonios, setTestimonios] = useState<Testimonio[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    testimoniosService
      .getActivos()
      .then((response) => {
        setTestimonios(response.data);
        setCargando(false);
      })
      .catch((error) => {
        console.error("Error al cargar testimonios:", error);
        setCargando(false);
      });
  }, []);

  return { testimonios, cargando };
}

export function useTestimoniosAdmin() {
  const [testimonios, setTestimonios] = useState<Testimonio[]>([]);

  const fetchTestimonios = () => {
    testimoniosService
      .getTodos()
      .then((res) => setTestimonios(res.data))
      .catch((error) => console.error("Error cargando testimonios:", error));
  };

  useEffect(() => {
    fetchTestimonios();
  }, []);

  return { testimonios, fetchTestimonios };
}
