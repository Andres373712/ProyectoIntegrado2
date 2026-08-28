import type { Metadata } from "next";

// Ver nota en (site)/contacto/layout.tsx: page.tsx es "use client".
export const metadata: Metadata = {
  title: "Términos y Condiciones",
  description:
    "Política de privacidad y tratamiento de datos personales de TMM Bienestar y Conexión.",
};

export default function TerminosLayout({ children }: { children: React.ReactNode }) {
  return children;
}
