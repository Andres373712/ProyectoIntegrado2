"use client";

import { useState, useCallback, useEffect, useRef } from "react";

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

  // Vista previa local del archivo elegido, antes de subirlo — así el admin
  // confirma que es la imagen correcta sin tener que guardar primero para
  // recién verla en la lista. Se genera con URL.createObjectURL (vive solo
  // en el navegador) y se libera cuando cambia o se limpia, para no acumular
  // URLs de objeto sin usar.
  const [imagenPreviewUrl, setImagenPreviewUrl] = useState<string | null>(null);
  const previewUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  const setCampo = useCallback(<K extends keyof T>(campo: K, valor: T[K]) => {
    setValores((prev) => ({ ...prev, [campo]: valor }));
  }, []);

  const setImagenConPreview = useCallback((archivo: File | null) => {
    setImagen(archivo);
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    const url = archivo ? URL.createObjectURL(archivo) : null;
    previewUrlRef.current = url;
    setImagenPreviewUrl(url);
  }, []);

  const reset = useCallback(
    (fileInputId?: string) => {
      setValores(valoresIniciales);
      setImagenConPreview(null);
      if (fileInputId) {
        const input = document.getElementById(fileInputId) as HTMLInputElement | null;
        if (input) input.value = "";
      }
    },
    [valoresIniciales, setImagenConPreview],
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

  return {
    valores,
    setCampo,
    imagen,
    setImagen: setImagenConPreview,
    imagenPreviewUrl,
    mensaje,
    setMensaje,
    enviar,
    reset,
  };
}
