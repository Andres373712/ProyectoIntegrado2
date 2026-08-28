import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Panel de administración, cuenta de cliente autenticada y flujos de
      // autenticación/transaccionales: nada de esto debería indexarse.
      disallow: [
        "/admin",
        "/admin/*",
        "/mi-cuenta",
        "/login",
        "/login-cliente",
        "/registro",
        "/registro-cliente",
        "/forgot-password",
        "/reset-password/*",
        "/cancelar-inscripcion/*",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
