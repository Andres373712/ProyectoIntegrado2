import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/features/carrito/CartContext";
import { AuthProvider } from "@/shared/auth/AuthProvider";
import { QueryProvider } from "@/shared/query/QueryProvider";
import { Toaster } from "@/components/ui/toaster";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// Metadata por defecto para todo el sitio: la usa tal cual la página de
// inicio (que no define la suya propia) y sirve de fallback + plantilla de
// título ("%s | TMM...") para cualquier ruta que no tenga su propio
// `metadata`/`generateMetadata`.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Talleres de artesanía y bienestar en Chile`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Talleres presenciales y online de manualidades y bienestar (resina, encuadernación y más) y kits para crear en casa. Descubre el poder sanador de la artesanía y reconecta contigo misma.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es">
      <body>
        <QueryProvider>
          <AuthProvider>
            <CartProvider>{children}</CartProvider>
          </AuthProvider>
        </QueryProvider>
        <Toaster />
      </body>
    </html>
  );
}
