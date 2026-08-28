import type { Metadata } from "next";

// Ver nota en contacto/layout.tsx: page.tsx es "use client". El token en la
// URL no cambia el contenido de la página en sí, así que basta con metadata
// estática (no hace falta generateMetadata acá).
export const metadata: Metadata = {
  title: "Restablecer Contraseña",
  description: "Define una nueva contraseña para tu cuenta de TMM.",
  robots: { index: false, follow: false },
};

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
