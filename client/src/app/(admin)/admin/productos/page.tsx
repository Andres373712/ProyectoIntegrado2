"use client";

import React, { useState } from "react";
import Image from "next/image";
import { productosService } from "@/features/productos/productosService";
import { useProductosAdmin } from "@/features/productos/useProductos";
import { useFormularioCrud } from "@/shared/hooks/useFormularioCrud";
import { getImageUrl } from "@/shared/lib/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import InputPrecio from "@/components/InputPrecio";
import { formatCLP } from "@/lib/utils";

const PRODUCTO_INICIAL = {
  nombre: "",
  descripcion: "",
  precio: "",
  stock: "",
};

function AdminProductos() {
  const { valores, setCampo, imagen, setImagen, imagenPreviewUrl, mensaje, setMensaje, enviar } =
    useFormularioCrud(PRODUCTO_INICIAL);

  // --- Estado Lista ---
  const [listaMensaje, setListaMensaje] = useState("");
  const { productos, error: errorCarga, fetchProductos } = useProductosAdmin();

  // Crear Producto
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { nombre } = valores;

    // Mismo criterio que ya aplica admin/talleres: un producto sin foto se ve
    // genérico en la vitrina y el catálogo (cae al placeholder), así que la
    // imagen pasa a ser obligatoria acá también, no solo en talleres.
    if (!imagen) {
      setMensaje("⚠️ Por favor selecciona una imagen para el producto.");
      setTimeout(() => setMensaje(""), 4000);
      return;
    }

    enviar(
      productosService.crear,
      (v, img) => {
        const formData = new FormData();
        formData.append("nombre", v.nombre);
        formData.append("descripcion", v.descripcion);
        formData.append("precio", String(parseInt(v.precio) || 0));
        formData.append("stock", String(parseInt(v.stock) || 0));
        if (img) formData.append("imagen", img);
        return formData;
      },
      {
        mensajeExito: `¡Producto "${nombre}" creado!`,
        mensajeError: "Error al crear producto.",
        fileInputId: "file-input-prod",
        alExito: fetchProductos,
      },
    );
  };

  // Eliminar Producto
  const handleEliminar = (id: number, nombreProd: string) => {
    if (window.confirm(`¿Eliminar "${nombreProd}"?`)) {
      productosService
        .eliminar(id)
        .then(() => {
          setListaMensaje(`Producto eliminado.`);
          fetchProductos();
        })
        .catch((error) => {
          console.error("Error al eliminar producto:", error);
          setListaMensaje(
            error?.response?.data?.message ||
              "No pudimos eliminar el producto. Intenta más tarde.",
          );
        });
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
              value={valores.nombre}
              onChange={(e) => setCampo("nombre", e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              value={valores.descripcion}
              onChange={(e) => setCampo("descripcion", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="precio">Precio (CLP)</Label>
              <InputPrecio
                id="precio"
                value={valores.precio}
                onChange={(v) => setCampo("precio", v)}
                required
              />
            </div>
            <div>
              <Label htmlFor="stock">Stock Inicial</Label>
              <Input
                id="stock"
                type="number"
                value={valores.stock}
                onChange={(e) => setCampo("stock", e.target.value)}
                required
              />
            </div>
          </div>
          <div>
            <Label htmlFor="file-input-prod">Imagen</Label>
            <Input
              id="file-input-prod"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={(e) => setImagen(e.target.files[0])}
              required
            />
            {imagenPreviewUrl && (
              <div className="relative mt-3 h-32 w-32 overflow-hidden rounded-md border bg-muted">
                <Image
                  src={imagenPreviewUrl}
                  alt="Vista previa de la imagen seleccionada"
                  fill
                  unoptimized
                  sizes="128px"
                  className="object-cover"
                />
              </div>
            )}
          </div>
          <Button type="submit" className="w-full">
            Guardar Producto
          </Button>
          {mensaje && (
            <p className="mt-2 text-center text-sm">{mensaje}</p>
          )}
        </form>
      </div>

      {/* --- LISTA DE PRODUCTOS --- */}
      <div className="mx-auto max-w-4xl rounded-lg border bg-card p-8 shadow-md">
        <h2 className="mb-4 text-2xl font-bold">Inventario Actual</h2>
        {(listaMensaje || errorCarga) && (
          <p className="mb-4 text-center text-red-500">
            {listaMensaje || errorCarga}
          </p>
        )}

        <div className="space-y-4">
          {productos.length > 0 ? (
            productos.map((prod) => (
              <div
                key={prod.id}
                className="flex flex-col items-center justify-between rounded-lg border p-4 md:flex-row"
              >
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                    <Image
                      src={getImageUrl(prod.imageUrl)}
                      alt={prod.nombre}
                      fill
                      unoptimized
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">{prod.nombre}</h3>
                    <p className="text-sm text-muted-foreground">
                      ${formatCLP(prod.precio)}
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
