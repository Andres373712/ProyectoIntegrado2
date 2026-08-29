"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useClienteDetalle } from "@/features/clientes/useClienteDetalle";
import { formatFechaCL } from "@/lib/utils";

function ClienteDetalle() {
  const { id } = useParams();
  const {
    clienta,
    setClienta,
    historial,
    notas,
    cargando,
    mensajeCliente,
    setMensajeCliente,
    guardarNota,
    guardarCliente,
  } = useClienteDetalle(id as string);

  const [nuevaNota, setNuevaNota] = useState("");
  const [mensajeNota, setMensajeNota] = useState("");

  // --- Guardar Nota ---
  const handleGuardarNota = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaNota) return;
    setMensajeNota("Guardando nota...");

    try {
      await guardarNota(nuevaNota);
      setMensajeNota("Nota guardada.");
      setNuevaNota("");
      setTimeout(() => setMensajeNota(""), 3000);
    } catch (err) {
      setMensajeNota("Error al guardar nota.");
      console.error("Error guardando nota:", err);
    }
  };

  // --- Editar Datos Cliente ---
  const handleClientaChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setClienta((prev) => ({ ...prev, [name]: value }));
  };

  const handleGuardarCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensajeCliente("Guardando...");

    const datosActualizados = {
      nombre: clienta.nombre,
      email: clienta.email,
      telefono: clienta.telefono,
      intereses: clienta.intereses,
    };

    try {
      await guardarCliente(datosActualizados);
      setMensajeCliente("¡Datos guardados!");
      setTimeout(() => setMensajeCliente(""), 3000);
    } catch (err) {
      setMensajeCliente(err.response?.data?.message || "Error al guardar.");
      console.error("Error guardando cliente:", err);
    }
  };

  if (cargando)
    return <p className="p-10 text-center">Cargando perfil de la clienta...</p>;
  // Aseguramos que clienta tenga datos antes de renderizar
  if (!clienta || !clienta.email)
    return (
      <p className="p-10 text-center">
        Clienta no encontrada o error al cargar.
      </p>
    );

  return (
    <div className="min-h-screen bg-muted p-8">
      <div className="mx-auto max-w-6xl">
        {/* --- Cabecera con Info Editable de la Clienta --- */}
        <form
          onSubmit={handleGuardarCliente}
          className="mb-8 rounded-lg bg-card p-8 shadow-md"
        >
          <div className="grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-foreground">
                Nombre Completo
              </label>
              <input
                type="text"
                name="nombre"
                value={clienta.nombre || ""}
                onChange={handleClientaChange}
                className="mt-1 w-full rounded border p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={clienta.email || ""}
                onChange={handleClientaChange}
                className="mt-1 w-full rounded border p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">
                Teléfono (WhatsApp)
              </label>
              <input
                type="tel"
                name="telefono"
                value={clienta.telefono || ""}
                onChange={handleClientaChange}
                className="mt-1 w-full rounded border p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">
                Intereses (separados por coma)
              </label>
              <input
                type="text"
                name="intereses"
                value={clienta.intereses || ""}
                onChange={handleClientaChange}
                className="mt-1 w-full rounded border p-2"
              />
            </div>
          </div>
          <div className="mt-4 text-xs text-muted-foreground">
            Clienta desde: {formatFechaCL(clienta.fecha_registro)}
          </div>
          <div className="mt-6 flex items-center justify-end gap-4">
            {mensajeCliente && (
              <span className="text-sm">{mensajeCliente}</span>
            )}
            <button
              type="submit"
              className="rounded-lg bg-success px-4 py-2 font-bold text-success-foreground hover:bg-success/90"
            >
              {" "}
              Guardar Cambios{" "}
            </button>
          </div>
        </form>

        {/* --- Columnas de Historial y Notas --- */}
        <div className="grid gap-8 md:grid-cols-2">
          {/* Columna 1: Historial de Talleres */}
          <div className="rounded-lg bg-card p-8 shadow-md">
            <h2 className="mb-4 text-2xl font-bold text-foreground">
              Historial de Trazabilidad
            </h2>
            <div className="max-h-96 space-y-4 overflow-y-auto">
              {historial.length > 0 ? (
                historial.map((taller, index) => (
                  <div
                    key={index}
                    className="rounded border-l-4 border-brand bg-muted p-4"
                  >
                    <h3 className="text-lg font-bold">{taller.nombre}</h3>
                    <p className="text-sm text-muted-foreground">
                      Fecha taller: {formatFechaCL(taller.fecha)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Inscripción: {formatFechaCL(taller.fecha_inscripcion)}
                    </p>
                  </div>
                ))
              ) : (
                <p>Esta clienta aún no se ha inscrito a ningún taller.</p>
              )}
            </div>
          </div>

          {/* Columna 2: Notas de Fidelización */}
          <div className="rounded-lg bg-card p-8 shadow-md">
            <h2 className="mb-4 text-2xl font-bold text-foreground">
              Notas de Fidelización
            </h2>
            <form onSubmit={handleGuardarNota} className="mb-6">
              <label className="mb-2 block font-bold text-foreground">
                Añadir nota personal:
              </label>
              <textarea
                value={nuevaNota}
                onChange={(e) => setNuevaNota(e.target.value)}
                className="w-full rounded border p-2"
                rows={3}
                placeholder="Ej: Le encantó la resina..."
              ></textarea>
              <button
                type="submit"
                className="mt-2 w-full rounded-lg bg-brand py-2 font-bold text-brand-foreground hover:bg-brand/90"
              >
                Guardar Nota
              </button>
              {mensajeNota && (
                <p className="mt-2 text-center text-sm">{mensajeNota}</p>
              )}
            </form>

            <div className="max-h-60 space-y-4 overflow-y-auto">
              {notas.length > 0 ? (
                notas.map((nota) => (
                  <div key={nota.id} className="rounded bg-yellow-100 p-4">
                    <p className="text-foreground">{nota.nota}</p>
                    <p className="mt-2 text-right text-xs text-muted-foreground">
                      {new Date(nota.fecha).toLocaleString("es-CL")}
                    </p>
                  </div>
                ))
              ) : (
                <p>Aún no hay notas para esta clienta.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClienteDetalle;
