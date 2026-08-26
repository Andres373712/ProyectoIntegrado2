"use client";

import React, { useState } from "react";
import Image from "next/image";
import { getImageUrl } from "@/shared/lib/apiClient";
import { talleresService } from "@/features/talleres/talleresService";
import { useTalleresAdmin } from "@/features/talleres/useTalleres";
import { useFormularioCrud } from "@/shared/hooks/useFormularioCrud";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import InputPrecio from "@/components/InputPrecio";
import { formatCLP } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TALLER_INICIAL = {
  nombre: "",
  descripcion: "",
  fecha: "",
  tipo: "B2C",
  precio: "",
  lugar: "",
  cupos: 10 as number | string,
};

function Admin() {
  const { valores, setCampo, imagen, setImagen, mensaje, setMensaje, enviar } =
    useFormularioCrud(TALLER_INICIAL);

  // --- Estado para la LISTA de talleres ---
  const [listaMensaje, setListaMensaje] = useState("");
  const { talleres, fetchTalleres } = useTalleresAdmin();

  // --- Manejador para CREAR taller ---
  const handleSubmit = (e) => {
    e.preventDefault();
    const { nombre, descripcion, fecha, precio, lugar } = valores;

    if (!nombre || !descripcion || !fecha || !precio || !lugar || !imagen) {
      setMensaje(
        "⚠️ Por favor completa todos los campos obligatorios (incluyendo la imagen).",
      );
      setTimeout(() => setMensaje(""), 4000);
      return;
    }

    enviar(
      talleresService.crear,
      (v, img) => {
        const formData = new FormData();
        formData.append("nombre", v.nombre);
        formData.append("descripcion", v.descripcion);
        formData.append("fecha", v.fecha ? new Date(v.fecha).toISOString() : "");
        formData.append("tipo", v.tipo);
        formData.append("precio", String(parseInt(v.precio) || 0));
        formData.append("lugar", v.lugar);
        formData.append("cupos_totales", String(parseInt(String(v.cupos)) || 10));
        if (img) formData.append("imagen", img);
        return formData;
      },
      {
        mensajeExito: `¡Éxito! Taller "${nombre}" creado.`,
        mensajeError: "Error al crear el taller.",
        fileInputId: "file-input",
        alExito: fetchTalleres,
      },
    );
  };

  const handleEliminar = (id, nombreTaller) => {
    if (
      window.confirm(
        `¿Estás segura de que quieres eliminar el taller "${nombreTaller}"?`,
      )
    ) {
      talleresService
        .eliminar(id)
        .then(() => {
          setListaMensaje(`Taller "${nombreTaller}" eliminado.`);
          fetchTalleres();
        })
        .catch((error) => {
          setListaMensaje(
            error.response?.data?.message || "Error al eliminar.",
          );
        });
    }
  };

  return (
    <div className="min-h-screen bg-background p-8 text-foreground">
      <h1 className="mb-6 text-3xl font-bold text-foreground">
        Panel de Administración
      </h1>
      <div className="mx-auto mb-12 max-w-xl rounded-lg border bg-card p-8 shadow-md">
        <h2 className="mb-4 text-2xl font-bold">Crear Nuevo Taller</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nombre">Nombre del Taller</Label>
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
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fecha">Fecha</Label>
              <Input
                id="fecha"
                type="datetime-local"
                value={valores.fecha}
                onChange={(e) => setCampo("fecha", e.target.value)}
                required
              />
            </div>
            <div>
              <Label>Tipo</Label>
              <Select value={valores.tipo} onValueChange={(v) => setCampo("tipo", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="B2C">Taller Público (B2C)</SelectItem>
                  <SelectItem value="B2B">Taller Empresa (B2B)</SelectItem>
                  <SelectItem value="KIT">Kit de Insumos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="lugar">Lugar</Label>
              <Input
                id="lugar"
                value={valores.lugar}
                onChange={(e) => setCampo("lugar", e.target.value)}
                required
                placeholder="Ej: Online..."
              />
            </div>
            {/* --- NUEVO CAMPO CUPOS --- */}
            <div>
              <Label htmlFor="cupos">Cupos Totales</Label>
              <Input
                id="cupos"
                type="number"
                min="1"
                value={valores.cupos}
                onChange={(e) => setCampo("cupos", e.target.value)}
                required
              />
            </div>
          </div>

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
            <Label htmlFor="file-input">Imagen del Taller</Label>
            <Input
              id="file-input"
              type="file"
              onChange={(e) => setImagen(e.target.files[0])}
              required
            />
          </div>
          <Button type="submit" className="h-11 w-full text-lg">
            Guardar Taller
          </Button>
          {mensaje && <p className="mt-4 text-center">{mensaje}</p>}
        </form>
      </div>

      <div className="mx-auto max-w-4xl rounded-lg border bg-card p-8 shadow-md">
        <h2 className="mb-4 text-2xl font-bold">
          Gestionar Talleres Existentes
        </h2>
        {listaMensaje && <p className="mb-4 text-center">{listaMensaje}</p>}
        <div className="space-y-4">
          {talleres.length > 0 ? (
            talleres.map((taller) => (
              <div
                key={taller.id}
                className="flex flex-col items-center justify-between rounded-lg border p-4 md:flex-row"
              >
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                    <Image
                      src={getImageUrl(taller.imageUrl)}
                      alt={taller.nombre}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">{taller.nombre}</h3>
                    <p className="text-sm text-muted-foreground">
                      {taller.tipo} - ${formatCLP(taller.precio)}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Cupos: {taller.cupos_inscritos} / {taller.cupos_totales}{" "}
                      {/* Mostramos el estado de cupos */}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex gap-4 md:mt-0">
                  <Button asChild variant="secondary" size="sm">
                    <Link href={`/admin/editar/${taller.id}`}>Editar</Link>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleEliminar(taller.id, taller.nombre)}
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground">
              Aún no has creado ningún taller.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
export default Admin;
