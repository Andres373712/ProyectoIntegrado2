"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import InputPrecio from "@/components/InputPrecio";

function AdminProductos() {
  // --- Estado Formulario ---
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState("");
  const [stock, setStock] = useState(""); // <-- NUEVO CAMPO STOCK
  const [imagen, setImagen] = useState(null);
  const [crearMensaje, setCrearMensaje] = useState("");

  // --- Estado Lista ---
  const [productos, setProductos] = useState([]);
  const [listaMensaje, setListaMensaje] = useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem("tmm_token") : null;
  const authHeaders = useMemo(() => ({ headers: { Authorization: `Bearer ${token}` } }), [token]);

  // Cargar productos
  const fetchProductos = useCallback(() => {
    axios
      .get("http://localhost:5000/api/productos/todos", authHeaders)
      .then((res) => setProductos(res.data))
      .catch((_) => console.error("Error cargando productos:", _));
  }, [authHeaders]);

  useEffect(() => {
    fetchProductos();
  }, [fetchProductos]);

  // Crear Producto
  const handleSubmit = (e) => {
    e.preventDefault();
    setCrearMensaje("Guardando...");

    const formData = new FormData();
    formData.append("nombre", nombre);
    formData.append("descripcion", descripcion);
    formData.append("precio", String(parseInt(precio) || 0));
    formData.append("stock", String(parseInt(stock) || 0));
    if (imagen) formData.append("imagen", imagen);

    axios
      .post("http://localhost:5000/api/productos", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(() => {
        setCrearMensaje(`¡Producto "${nombre}" creado!`);
        fetchProductos();
        // Limpiar
        setNombre("");
        setDescripcion("");
        setPrecio("");
        setStock("");
        setImagen(null);
        const fileInput = document.getElementById("file-input-prod") as HTMLInputElement | null;
        if (fileInput) fileInput.value = "";
      })
      .catch((error) => {
        setCrearMensaje("Error al crear producto.");
        console.error(error);
      });
  };

  // Eliminar Producto
  const handleEliminar = (id, nombreProd) => {
    if (window.confirm(`¿Eliminar "${nombreProd}"?`)) {
      axios
        .delete(`http://localhost:5000/api/productos/${id}`, authHeaders)
        .then(() => {
          setListaMensaje(`Producto eliminado.`);
          fetchProductos();
        })
        .catch(() => setListaMensaje("Error al eliminar."));
    }
  };

  return (
    <div className="min-h-screen bg-background p-8 text-foreground">
      <h1 className="mb-6 text-3xl font-bold">
        Gestión de Productos (Marketplace)
      </h1>

      {/* --- FORMULARIO DE CREACIÓN --- */}
      <div className="mx-auto mb-12 max-w-xl rounded-lg border bg-card p-8 shadow-md">
        <h2 className="mb-4 text-2xl font-bold">Nuevo Producto</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nombre">Nombre del Producto</Label>
            <Input
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="precio">Precio (CLP)</Label>
              <InputPrecio
                id="precio"
                value={precio}
                onChange={setPrecio}
                required
              />
            </div>
            <div>
              <Label htmlFor="stock">Stock Inicial</Label>
              <Input
                id="stock"
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                required
              />
            </div>
          </div>
          <div>
            <Label htmlFor="file-input-prod">Imagen</Label>
            <Input
              id="file-input-prod"
              type="file"
              onChange={(e) => setImagen(e.target.files[0])}
            />
          </div>
          <Button type="submit" className="w-full">
            Guardar Producto
          </Button>
          {crearMensaje && (
            <p className="mt-2 text-center text-sm">{crearMensaje}</p>
          )}
        </form>
      </div>

      {/* --- LISTA DE PRODUCTOS --- */}
      <div className="mx-auto max-w-4xl rounded-lg border bg-card p-8 shadow-md">
        <h2 className="mb-4 text-2xl font-bold">Inventario Actual</h2>
        {listaMensaje && (
          <p className="mb-4 text-center text-red-500">{listaMensaje}</p>
        )}

        <div className="space-y-4">
          {productos.length > 0 ? (
            productos.map((prod) => (
              <div
                key={prod.id}
                className="flex flex-col items-center justify-between rounded-lg border p-4 md:flex-row"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={
                      prod.imageUrl
                        ? `http://localhost:5000${prod.imageUrl}`
                        : "/placeholder.png"
                    }
                    alt={prod.nombre}
                    className="h-16 w-16 rounded-md bg-muted object-cover"
                  />
                  <div>
                    <h3 className="text-lg font-bold">{prod.nombre}</h3>
                    <p className="text-sm text-muted-foreground">
                      ${prod.precio.toLocaleString("es-CL")}
                    </p>
                    {/* INDICADOR DE STOCK */}
                    <p
                      className={`text-sm font-bold ${prod.stock > 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      Stock: {prod.stock} {prod.stock === 0 && "(AGOTADO)"}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex gap-4 md:mt-0">
                  {/* (Podríamos añadir botón de Editar aquí en el futuro) */}
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleEliminar(prod.id, prod.nombre)}
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground">
              No hay productos registrados.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminProductos;
