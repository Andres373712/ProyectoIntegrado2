import type { Metadata } from "next";
import { talleresService } from "@/features/talleres/talleresService";

// Ver nota en contacto/layout.tsx: page.tsx es "use client". A diferencia de
// las demás rutas, esta SÍ necesita metadata dinámica (el título/descripción
// dependen de qué taller es), así que usamos generateMetadata en vez de un
// `metadata` estático: pedimos el taller al backend (mismo servicio que usa
// la página) y armamos un título/descripción específicos; si el taller no
// existe o el backend falla, caemos a un texto genérico en vez de romper el
// render de la página.
const DESCRIPCION_GENERICA =
  "Inscríbete a este taller de TMM Bienestar y Conexión: revisa cupos, fecha, lugar y precio.";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  try {
    const { data: taller } = await talleresService.getById(id);
    const descripcion = taller.descripcion
      ? taller.descripcion.slice(0, 160)
      : DESCRIPCION_GENERICA;

    return {
      title: taller.nombre ? `Inscripción: ${taller.nombre}` : "Inscripción a Taller",
      description: descripcion,
    };
  } catch (error) {
    console.error(`No se pudo generar metadata para el taller ${id}:`, error);
    return {
      title: "Inscripción a Taller",
      description: DESCRIPCION_GENERICA,
    };
  }
}

export default function InscribirLayout({ children }: { children: React.ReactNode }) {
  return children;
}
