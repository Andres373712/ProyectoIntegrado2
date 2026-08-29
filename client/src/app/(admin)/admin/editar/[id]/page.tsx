"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { talleresService } from "@/features/talleres/talleresService";
import { getImageUrl } from "@/shared/lib/apiClient";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import InputPrecio from "@/components/InputPrecio";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface TallerFormState {
  nombre: string;
  descripcion: string;
  fecha: string;
  tipo: string;
  precio: number;
  activo: boolean;
  imageUrl: string | null;
  lugar: string;
  cupos_totales: number;
  cupos_inscritos: number;
}

function EditarTaller() {
  const [taller, setTaller] = useState<TallerFormState>({
    nombre: "",
    descripcion: "",
    fecha: "",
    tipo: "B2C",
    precio: 0,
    activo: true,
    imageUrl: null,
    lugar: "",
    cupos_totales: 10, // <-- NUEVO
    cupos_inscritos: 0, // <-- NUEVO (Solo lectura)
  });

  const [imagen, setImagen] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState("");

  const { id } = useParams();
  const router = useRouter();

  useEffect(() => {
    talleresService
      .getById(id as string)
      .then((response) => {
        let fechaFormateada = "";
        if (response.data.fecha) {
          const fechaDB = new Date(response.data.fecha);
          fechaFormateada = fechaDB.toISOString().slice(0, 16);
        }
        const datos = response.data;

        setTaller({
          nombre: datos.nombre ?? "",
          descripcion: datos.descripcion ?? "",
          fecha: fechaFormateada,
          tipo: datos.tipo ?? "B2C",
          precio: datos.precio ?? 0,
          activo: Boolean(datos.activo ?? true),
          imageUrl: datos.imageUrl ?? null,
          lugar: datos.lugar ?? "",
          // Aseguramos que cupos_totales tenga un valor
          cupos_totales: datos.cupos_totales || 10,
          cupos_inscritos: datos.cupos_inscritos ?? 0,
        });
        setCargando(false);
      })
      .catch((error) => {
        console.error("Error al cargar el taller:", error);
        setMensaje("Error al cargar datos del taller.");
        setCargando(false);
      });
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setTaller((prev) => ({ ...prev, [name]: checked }));
    } else {
      setTaller((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (value: string) =>
    setTaller((prev) => ({ ...prev, tipo: value }));
  const handleCheckboxChange = (checked: boolean) =>
    setTaller((prev) => ({ ...prev, activo: checked === true }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje("Actualizando...");

    const formData = new FormData();
    formData.append("nombre", taller.nombre);
    formData.append("descripcion", taller.descripcion || "");
    formData.append(
      "fecha",
      taller.fecha ? new Date(taller.fecha).toISOString() : "",
    );
    formData.append("tipo", taller.tipo);
    formData.append("precio", String(parseInt(String(taller.precio)) || 0));
    formData.append("activo", String(taller.activo));
    formData.append("lugar", taller.lugar || "");
    formData.append("cupos_totales", String(parseInt(String(taller.cupos_totales)) || 10)); // <-- ENVIAR CUPOS

    if (imagen) {
      formData.append("imagen", imagen);
    } else if (taller.imageUrl) {
      formData.append("imageUrlActual", taller.imageUrl);
    }

    talleresService
      .actualizar(id as string, formData)
      .then(() => {
        setMensaje("¡Taller actualizado con éxito!");
        setTimeout(() => router.push("/admin/talleres"), 2000);
      })
      .catch((error) => {
        setMensaje("Error al actualizar el taller.");
        console.error("Error de Axios:", error.response || error.message);
      });
  };

  if (cargando) return <p className="p-10 text-center">Cargando taller...</p>;

  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="mb-6 text-3xl font-bold text-foreground">Editar Taller</h1>
      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-xl space-y-4 rounded-lg border bg-card p-8 shadow-md"
      >
        {/* ... Inputs nombre, descripcion ... */}
        <div>
          <Label htmlFor="nombre">Nombre del Taller</Label>
          <Input
            id="nombre"
            name="nombre"
            value={taller.nombre || ""}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="descripcion">Descripción</Label>
          <Textarea
            id="descripcion"
            name="descripcion"
            value={taller.descripcion || ""}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="fecha">Fecha</Label>
            <Input
              id="fecha"
              name="fecha"
              type="datetime-local"
              value={taller.fecha || ""}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label>Tipo</Label>
            <Select
              value={taller.tipo || "B2C"}
              onValueChange={handleSelectChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
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
              name="lugar"
              value={taller.lugar || ""}
              onChange={handleChange}
            />
          </div>
          {/* --- NUEVO CAMPO CUPOS --- */}
          <div>
            <Label htmlFor="cupos_totales">Cupos Totales</Label>
            <Input
              id="cupos_totales"
              name="cupos_totales"
              type="number"
              min={taller.cupos_inscritos} // No permitir bajar del nº de inscritos
              value={taller.cupos_totales || 10}
              onChange={handleChange}
              required
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Inscritos actuales: {taller.cupos_inscritos}
            </p>
          </div>
        </div>

        <div>
          <Label htmlFor="precio">Precio (CLP)</Label>
          <InputPrecio
            id="precio"
            value={taller.precio || 0}
            onChange={(valor) =>
              setTaller((prev) => ({ ...prev, precio: parseInt(valor, 10) || 0 }))
            }
            required
          />
        </div>

        <div className="flex items-center space-x-2 py-2">
          <Checkbox
            id="activo"
            name="activo"
            checked={taller.activo}
            onCheckedChange={handleCheckboxChange}
          />
          <Label htmlFor="activo" className="font-bold">
            ¿Taller activo?
          </Label>
        </div>

        <div>
          <Label>Imagen Actual</Label>
          {taller.imageUrl && (
            <div className="relative mb-2 h-48 w-full">
              <Image
                src={getImageUrl(taller.imageUrl)}
                alt="Actual"
                fill
                unoptimized
                sizes="(max-width: 640px) 100vw, 576px"
                className="rounded-md object-cover"
              />
            </div>
          )}
          <Label
            htmlFor="file-input-edit"
            className="mt-2 cursor-pointer text-primary hover:underline"
          >
            Cambiar Imagen (opcional)
          </Label>
          <Input
            id="file-input-edit"
            type="file"
            onChange={(e) => setImagen(e.target.files[0])}
            className="mt-1"
          />
        </div>

        <Button type="submit" className="h-11 w-full text-lg">
          Guardar Cambios
        </Button>
        {mensaje && <p className="mt-4 text-center">{mensaje}</p>}
      </form>
    </div>
  );
}
export default EditarTaller;
