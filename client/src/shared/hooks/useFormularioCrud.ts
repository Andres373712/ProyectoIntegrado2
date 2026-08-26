"use client";

import { useState, useCallback } from "react";

/**
 * Estado + ciclo de vida compartido por los formularios de alta con imagen
 * (admin/talleres, admin/productos): un objeto de valores en vez de un
 * useState por campo, manejo de la imagen, mensaje de estado, y reset —
 * incluyendo el input de archivo, que no se puede resetear por estado.
 */
export function useFormularioCrud<T extends Record<string, unknown>>(valoresIniciales: T) {
  const [valores, setValores] = useState<T>(valoresIniciales);
  const [imagen, setImagen] = useState<File | null>(null);
  const [mensaje, setMensaje] = useState("");

  const setCampo = useCallback(<K extends keyof T>(campo: K, valor: T[K]) => {
    setValores((prev) => ({ ...prev, [campo]: valor }));
  }, []);

  const reset = useCallback(
    (fileInputId?: string) => {
      setValores(valoresIniciales);
      setImagen(null);
      if (fileInputId) {
        const input = document.getElementById(fileInputId) as HTMLInputElement | null;
        if (input) input.value = "";
      }
    },
    [valoresIniciales],
  );

  const enviar = useCallback(
    async (
      crear: (formData: FormData) => Promise<unknown>,
      construirFormData: (valores: T, imagen: File | null) => FormData,
      opciones: {
        mensajeExito: string;
        mensajeError: string;
        fileInputId?: string;
        alExito?: () => void;
      },
    ) => {
      setMensaje("Guardando...");
      try {
        await crear(construirFormData(valores, imagen));
        setMensaje(opciones.mensajeExito);
        opciones.alExito?.();
        reset(opciones.fileInputId);
      } catch (error) {
        setMensaje(opciones.mensajeError);
        console.error(error);
      }
    },
    [valores, imagen, reset],
  );

  return { valores, setCampo, imagen, setImagen, mensaje, setMensaje, enviar, reset };
}
