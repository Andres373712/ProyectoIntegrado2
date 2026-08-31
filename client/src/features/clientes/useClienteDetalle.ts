"use client";

import { useState, useEffect, useCallback } from "react";
import { clientesService } from "./clientesService";
import type { Cliente, NotaFidelizacion, HistorialTaller } from "@/types/cliente";

const CLIENTE_VACIO: Cliente = {
  id: 0,
  nombre: "",
  email: "",
  telefono: "",
  intereses: "",
  fecha_registro: "",
};

export function useClienteDetalle(id: string | number) {
  const [clienta, setClienta] = useState<Cliente>(CLIENTE_VACIO);
  const [historial, setHistorial] = useState<HistorialTaller[]>([]);
  const [notas, setNotas] = useState<NotaFidelizacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mensajeCliente, setMensajeCliente] = useState("");

  const fetchNotas = useCallback(() => {
    clientesService
      .getNotas(id)
      .then((res) => setNotas(res.data))
      .catch((err) => console.error("Error cargando notas:", err));
  }, [id]);

  useEffect(() => {
    // Carga de datos al montar/cambiar id: mismo patrón "fetch on mount" que
    // useClientes.ts, no un cascading render evitable.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCargando(true);
    Promise.all([
      clientesService.getCliente(id),
      clientesService.getHistorial(id),
      clientesService.getNotas(id),
    ])
      .then(([resClienta, resHistorial, resNotas]) => {
        setClienta(resClienta.data || CLIENTE_VACIO);
        setHistorial(resHistorial.data);
        setNotas(resNotas.data);
        setCargando(false);
      })
      .catch((err) => {
        console.error("Error al cargar datos de la clienta:", err);
        setMensajeCliente("Error al cargar los datos. Intenta recargar.");
        setCargando(false);
      });
  }, [id]);

  const guardarNota = async (nota: string) => {
    await clientesService.crearNota(id, nota);
    fetchNotas();
  };

  const guardarCliente = async (datos: Partial<Cliente>) => {
    await clientesService.actualizarCliente(id, datos);
  };

  return {
    clienta,
    setClienta,
    historial,
    notas,
    cargando,
    mensajeCliente,
    setMensajeCliente,
    guardarNota,
    guardarCliente,
  };
}
