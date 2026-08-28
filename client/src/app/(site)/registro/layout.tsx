import type { Metadata } from "next";

// Ver nota en contacto/layout.tsx: registro/page.tsx es "use client".
export const metadata: Metadata = {
  title: "Crear Cuenta",
  description: "Regístrate como clienta de TMM para inscribirte a talleres y seguir tus pedidos.",
  robots: { index: false, follow: false },
};

export default function RegistroLayout({ children }: { children: React.ReactNode }) {
  return children;
}
