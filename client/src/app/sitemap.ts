import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * Solo incluimos rutas públicas de contenido (no de admin, ni de login,
 * registro u otros flujos transaccionales/autenticados) — son las únicas que
 * tiene sentido que un buscador indexe. talleres/productos individuales no
 * se listan acá porque no hay un listado estable de ids sin llamar al
 * backend en build time; el catálogo (que sí los enlaza a todos) cumple ese
 * rol de punto de entrada para el crawler.
 */
const RUTAS_PUBLICAS: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/catalogo", changeFrequency: "daily", priority: 0.9 },
  { path: "/quienes-somos", changeFrequency: "monthly", priority: 0.6 },
  { path: "/contacto", changeFrequency: "monthly", priority: 0.5 },
  { path: "/carrito", changeFrequency: "monthly", priority: 0.3 },
  { path: "/terminos-y-condiciones", changeFrequency: "yearly", priority: 0.2 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const ahora = new Date();

  return RUTAS_PUBLICAS.map(({ path, changeFrequency, priority }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: ahora,
    changeFrequency,
    priority,
  }));
}
