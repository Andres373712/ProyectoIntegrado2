"use client";

import { useState, useEffect } from "react";
import { productosService } from "./productosService";
import type { Producto } from "@/types/producto";

export function useProductosActivos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    productosService
      .getActivos()
      .then((response) => {
        setProductos(response.data);
        setCargando(false);
      })
      .catch((error) => {
        console.error("Error al cargar productos:", error);
        setCargando(false);
      });
  }, []);

  return { productos, cargando };
}

export function useProductosAdmin() {
  const [productos, setProductos] = useState<Producto[]>([]);

  const fetchProductos = () => {
    productosService
      .getTodos()
      .then((res) => setProductos(res.data))
      .catch((error) => console.error("Error cargando productos:", error));
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  return { productos, fetchProductos };
}
