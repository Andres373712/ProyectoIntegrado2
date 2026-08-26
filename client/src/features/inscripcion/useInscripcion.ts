"use client";

import { useState } from "react";
import { isAxiosError } from "axios";
import { inscripcionService, type InscripcionData } from "./inscripcionService";

export function useInscripcion() {
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [exito, setExito] = useState(false);

  const inscribir = async (datos: InscripcionData) => {
    setEnviando(true);
    setMensaje("");
    try {
      const response = await inscripcionService.inscribir(datos);
      setExito(true);
      setMensaje(response.data.message);
      return true;
    } catch (error) {
      setExito(false);
      const mensajeError = isAxiosError(error) ? error.response?.data?.message : undefined;
      setMensaje(mensajeError || "Error en la inscripción.");
      return false;
    } finally {
      setEnviando(false);
    }
  };

  return { enviando, mensaje, exito, inscribir };
}
