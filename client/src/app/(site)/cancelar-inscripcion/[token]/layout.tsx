import type { Metadata } from "next";

// Ver nota en contacto/layout.tsx: page.tsx es "use client". Página
// transaccional (cancela una inscripción vía un token de un solo uso), no
// pensada para indexarse.
export const metadata: Metadata = {
  title: "Cancelar Inscripción",
  description: "Confirma la cancelación de tu inscripción a un taller de TMM.",
  robots: { index: false, follow: false },
};

export default function CancelarInscripcionLayout({ children }: { children: React.ReactNode }) {
  return children;
}
