"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { inscripcionService } from "@/features/inscripcion/inscripcionService";

function CancelarInscripcion() {
  const { token } = useParams();
  const [estado, setEstado] = useState("cargando"); // 'cargando', 'exito', 'error'
  const [mensaje, setMensaje] = useState("");
  const [datos, setDatos] = useState(null);

  useEffect(() => {
    inscripcionService
      .cancelar(token as string)
      .then((response) => {
        setEstado("exito");
        setDatos(response.data);
        setMensaje(response.data.message);
      })
      .catch((error) => {
        setEstado("error");
        setMensaje(
          error.response?.data?.message || "Error al procesar la cancelación.",
        );
      });
  }, [token]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-8">
      <div className="w-full max-w-md rounded-lg bg-white p-10 text-center shadow-lg">
        {estado === "cargando" && (
          <p className="text-xl">Procesando cancelación...</p>
        )}

        {estado === "exito" && (
          <>
            <div className="mb-4 text-6xl">✓</div>
            <h1 className="mb-4 text-3xl font-bold text-green-600">
              Cancelación Exitosa
            </h1>
            <p className="mb-2 text-gray-700">Hola {datos?.nombre},</p>
            <p className="mb-6 text-gray-700">
              Tu inscripción al taller <strong>{datos?.taller}</strong> ha sido
              cancelada.
            </p>
            <p className="mb-6 text-sm text-gray-500">
              Esperamos verte en futuros talleres.
            </p>
          </>
        )}

        {estado === "error" && (
          <>
            <div className="mb-4 text-6xl">✗</div>
            <h1 className="mb-4 text-3xl font-bold text-red-600">Error</h1>
            <p className="mb-6 text-gray-700">{mensaje}</p>
          </>
        )}

        <Link
          href="/"
          className="inline-block rounded-lg bg-brand px-6 py-3 font-bold text-brand-foreground hover:bg-brand/90"
        >
          Volver al Catálogo
        </Link>
      </div>
    </div>
  );
}

export default CancelarInscripcion;
