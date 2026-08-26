"use client";

import { useState } from "react";
import { isAxiosError } from "axios";
import { pedidosService, type PedidoData } from "./pedidosService";

export function usePedido() {
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [exito, setExito] = useState(false);

  const confirmarPedido = async (datos: PedidoData) => {
    setEnviando(true);
    setMensaje("");
    try {
      const response = await pedidosService.crear(datos);
      setExito(true);
      setMensaje(response.data.message);
      return true;
    } catch (error) {
      setExito(false);
      const mensajeError = isAxiosError(error) ? error.response?.data?.message : undefined;
      setMensaje(mensajeError || "Error al procesar el pedido.");
      return false;
    } finally {
      setEnviando(false);
    }
  };

  return { enviando, mensaje, exito, confirmarPedido, setMensaje };
}
