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
// Contrato actual esperado de GET /api/cliente/mis-inscripciones:
//   [{ id, taller_nombre, taller_fecha, taller_lugar, estado }]
function mapInscripcion(raw: any): Inscripcion {
  return {
    id: raw?.id,
    tallerNombre: raw?.taller_nombre ?? "Taller",
    tallerFecha: raw?.taller_fecha ?? null,
    tallerLugar: raw?.taller_lugar ?? "",
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

  return {
    inscripciones,
    pedidos,
    pedidosDisponibles,
    cargando: cargandoInscripciones || cargandoPedidos,
    error,
  };
}
