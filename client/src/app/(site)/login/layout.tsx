import type { Metadata } from "next";

// Ver nota en contacto/layout.tsx: login/page.tsx es "use client".
// `robots: {index: false}` porque es un formulario de acceso (para el equipo
// interno), no contenido pensado para aparecer en resultados de búsqueda.
export const metadata: Metadata = {
  title: "Acceso Administrador",
  description: "Inicia sesión para gestionar talleres, productos y pedidos de TMM.",
  robots: { index: false, follow: false },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
