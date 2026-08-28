/**
 * URL pública del sitio, usada para metadata absoluta (Open Graph,
 * sitemap.xml, robots.txt). Configurable vía NEXT_PUBLIC_SITE_URL en
 * despliegue; por defecto apunta al dominio de producción.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.tmmbienestaryconexion.cl"
).replace(/\/$/, "");

export const SITE_NAME = "TMM Bienestar y Conexión";
