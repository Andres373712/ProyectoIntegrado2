"use client";

import React, { useState } from "react";
import { testimoniosService } from "@/features/testimonios/testimoniosService";
import { useTestimoniosAdmin } from "@/features/testimonios/useTestimonios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import StarRating from "@/components/StarRating";
import { EyeOff, Eye } from "lucide-react";

const TESTIMONIO_INICIAL = {
  nombre: "",
  curso: "",
  comentario: "",
  calificacion: 5,
};

function AdminTestimonios() {
  const [valores, setValores] = useState(TESTIMONIO_INICIAL);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [mensaje, setMensaje] = useState("");
  const [listaMensaje, setListaMensaje] = useState("");
  const { testimonios, error: errorCarga, fetchTestimonios } = useTestimoniosAdmin();

  const setCampo = <K extends keyof typeof TESTIMONIO_INICIAL>(
    campo: K,
    valor: (typeof TESTIMONIO_INICIAL)[K],
  ) => setValores((prev) => ({ ...prev, [campo]: valor }));

  const cancelarEdicion = () => {
    setEditandoId(null);
    setValores(TESTIMONIO_INICIAL);
  };

  const iniciarEdicion = (t: (typeof testimonios)[number]) => {
    setEditandoId(t.id);
    setValores({
      nombre: t.nombre,
      curso: t.curso ?? "",
      comentario: t.comentario,
      calificacion: t.calificacion,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje("Guardando...");
    try {
      if (editandoId) {
        await testimoniosService.actualizar(editandoId, { ...valores, activo: true });
        setMensaje("Testimonio actualizado.");
      } else {
        await testimoniosService.crear(valores);
        setMensaje(`¡Testimonio de "${valores.nombre}" agregado!`);
      }
      cancelarEdicion();
      fetchTestimonios();
    } catch (error) {
      setMensaje("Error al guardar el testimonio.");
      console.error(error);
    }
  };

  const handleEliminar = async (id: number, nombre: string) => {
    if (!window.confirm(`¿Eliminar el comentario de "${nombre}"?`)) return;
    try {
      setListaMensaje("");
      await testimoniosService.eliminar(id);
      fetchTestimonios();
    } catch (error) {
      console.error("Error al eliminar testimonio:", error);
      setListaMensaje("No pudimos eliminar el testimonio. Intenta más tarde.");
    }
  };

  const toggleActivo = async (t: (typeof testimonios)[number]) => {
    try {
      setListaMensaje("");
      await testimoniosService.actualizar(t.id, {
        nombre: t.nombre,
        curso: t.curso,
        comentario: t.comentario,
        calificacion: t.calificacion,
        activo: !t.activo,
      });
      fetchTestimonios();
    } catch (error) {
      console.error("Error al cambiar visibilidad del testimonio:", error);
      setListaMensaje(
        `No pudimos ${t.activo ? "ocultar" : "mostrar"} el testimonio. Intenta más tarde.`,
      );
    }
  };

  return (
    <div className="min-h-screen bg-background p-8 text-foreground">
      <h1 className="mb-6 text-3xl font-bold">
        Comentarios y Recomendaciones
      </h1>

      {/* --- FORMULARIO --- */}
      <div className="mx-auto mb-12 max-w-xl rounded-lg border bg-card p-8 shadow-md">
        <h2 className="mb-4 text-2xl font-bold">
          {editandoId ? "Editar Testimonio" : "Nuevo Testimonio"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nombre">Nombre de la clienta</Label>
            <Input
              id="nombre"
              value={valores.nombre}
              onChange={(e) => setCampo("nombre", e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="curso">Curso o taller (opcional)</Label>
            <Input
              id="curso"
              value={valores.curso}
              onChange={(e) => setCampo("curso", e.target.value)}
              placeholder="Ej: Curso de Resina Epóxica"
            />
          </div>
          <div>
            <Label htmlFor="comentario">Comentario</Label>
            <Textarea
              id="comentario"
              value={valores.comentario}
              onChange={(e) => setCampo("comentario", e.target.value)}
              required
            />
          </div>
          <div>
            <Label className="mb-2 block">Calificación</Label>
            <StarRating
              value={valores.calificacion}
              onChange={(v) => setCampo("calificacion", v)}
              size={26}
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="flex-1">
              {editandoId ? "Guardar cambios" : "Agregar Testimonio"}
            </Button>
            {editandoId && (
              <Button type="button" variant="outline" onClick={cancelarEdicion}>
                Cancelar
              </Button>
            )}
          </div>
          {mensaje && <p className="mt-2 text-center text-sm">{mensaje}</p>}
        </form>
      </div>

      {/* --- LISTA --- */}
      <div className="mx-auto max-w-4xl rounded-lg border bg-card p-8 shadow-md">
        <h2 className="mb-4 text-2xl font-bold">Testimonios Cargados</h2>
        {(listaMensaje || errorCarga) && (
          <p className="mb-4 text-center text-red-500">
            {listaMensaje || errorCarga}
          </p>
        )}
        <div className="space-y-4">
          {testimonios.length > 0 ? (
            testimonios.map((t) => (
              <div
                key={t.id}
                className={`rounded-lg border p-4 ${!t.activo ? "opacity-50" : ""}`}
              >
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold">{t.nombre}</h3>
                      {!t.activo && (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                          Oculto
                        </span>
                      )}
                    </div>
                    {t.curso && (
                      <p className="text-sm text-muted-foreground">{t.curso}</p>
                    )}
                    <div className="mt-1">
                      <StarRating value={t.calificacion} readOnly size={16} />
                    </div>
                    <p className="mt-2 max-w-xl text-sm">{t.comentario}</p>
                  </div>
                  <div className="flex flex-shrink-0 gap-2">
                    <Button variant="outline" size="sm" onClick={() => iniciarEdicion(t)}>
                      Editar
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => toggleActivo(t)}>
                      {t.activo ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleEliminar(t.id, t.nombre)}
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground">
              No hay testimonios cargados todavía.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminTestimonios;
