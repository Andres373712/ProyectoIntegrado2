"use client";

import { useEffect, useState } from "react";
import { cuentaService } from "./cuentaService";

export interface Inscripcion {
  id: number;
  tallerNombre: string;
  tallerFecha: string | null;
  tallerLugar: string;
  estado: string;
}

export interface PedidoProducto {
  nombre: string;
  cantidad: number;
  precio: number;
}

export interface Pedido {
  id: number;
  total: number;
  estado: string;
  fecha: string | null;
  productos: PedidoProducto[];
}

// --- ZONA DE MAPEO (único lugar a ajustar si cambian los nombres de campo del backend) ---
// Contrato real de GET /api/cliente/mis-inscripciones (server/src/services/clienteService.js):
//   [{ id, tallerId, taller, fecha, lugar, estado, fechaInscripcion }]
// (el contrato que se asumió al construir esta pantalla usaba taller_nombre/taller_fecha/
// taller_lugar en snake_case — el backend terminó devolviendo taller/fecha/lugar; se ajusta
// acá, que es exactamente el único lugar pensado para este tipo de desajuste.)
function mapInscripcion(raw: any): Inscripcion {
  return {
    id: raw?.id,
    tallerNombre: raw?.taller ?? "Taller",
    tallerFecha: raw?.fecha ?? null,
    tallerLugar: raw?.lugar ?? "",
    estado: raw?.estado ?? "pendiente",
  };
}

// Contrato actual esperado de GET /api/cliente/mis-pedidos:
//   [{ id, total, estado, fecha, productos: [{ nombre, cantidad, precio }] }]
function mapPedido(raw: any): Pedido {
  return {
    id: raw?.id,
    total: Number(raw?.total ?? 0),
    estado: raw?.estado ?? "pendiente",
    fecha: raw?.fecha ?? null,
    productos: Array.isArray(raw?.productos)
      ? raw.productos.map((p: any) => ({
          nombre: p?.nombre ?? "Producto",
          cantidad: Number(p?.cantidad ?? 0),
          precio: Number(p?.precio ?? 0),
        }))
      : [],
  };
}
// --- FIN ZONA DE MAPEO ---

export function useMiCuenta() {
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [pedidosDisponibles, setPedidosDisponibles] = useState(true);
  const [cargandoInscripciones, setCargandoInscripciones] = useState(true);
  const [cargandoPedidos, setCargandoPedidos] = useState(true);
  const [error, setError] = useState("");
  // id de la inscripción que se está cancelando ahora mismo (null si ninguna),
  // para poder deshabilitar solo el botón de esa card mientras el pedido está
  // en curso, en vez de un loading global.
  const [cancelandoId, setCancelandoId] = useState<number | null>(null);
  const [errorCancelacion, setErrorCancelacion] = useState("");

  useEffect(() => {
    cuentaService
      .getInscripciones()
      .then((res) => {
        const datos = Array.isArray(res.data) ? res.data : [];
        setInscripciones(datos.map(mapInscripcion));
      })
      .catch((err) => {
        console.error("Error al cargar mis inscripciones:", err);
        setError("No pudimos cargar tus inscripciones a talleres. Intenta más tarde.");
      })
      .finally(() => setCargandoInscripciones(false));

    cuentaService
      .getPedidos()
      .then((res) => {
        const datos = Array.isArray(res.data) ? res.data : [];
        setPedidos(datos.map(mapPedido));
      })
      .catch((err) => {
        // El endpoint de pedidos puede no existir todavía en el backend.
        // Si responde 404, ocultamos la sección en lugar de mostrar un error.
        if (err?.response?.status === 404) {
          setPedidosDisponibles(false);
        } else {
          console.error("Error al cargar mis pedidos:", err);
          setPedidosDisponibles(false);
        }
      })
      .finally(() => setCargandoPedidos(false));
  }, []);

  // Cancela una inscripción propia y, si el backend confirma, la saca del
  // estado local sin volver a pedir toda la lista (misma idea que el resto
  // del carrito/cuenta: actualizar en memoria en vez de refetchear).
  async function cancelarInscripcion(id: number) {
    setErrorCancelacion("");
    setCancelandoId(id);
    try {
      await cuentaService.cancelar(id);
      setInscripciones((prev) => prev.filter((inscripcion) => inscripcion.id !== id));
    } catch (err) {
      console.error("Error al cancelar la inscripción:", err);
      setErrorCancelacion("No pudimos cancelar tu inscripción. Intenta más tarde.");
    } finally {
      setCancelandoId(null);
    }
  }

  return {
    inscripciones,
    pedidos,
    pedidosDisponibles,
    cargando: cargandoInscripciones || cargandoPedidos,
    error,
    cancelarInscripcion,
    cancelandoId,
    errorCancelacion,
  };
}
