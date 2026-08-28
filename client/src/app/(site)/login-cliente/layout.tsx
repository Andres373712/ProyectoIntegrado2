import type { Metadata } from "next";

// Ver nota en contacto/layout.tsx: login-cliente/page.tsx es "use client".
export const metadata: Metadata = {
  title: "Iniciar Sesión",
  description: "Ingresa a tu cuenta de clienta para gestionar tus inscripciones y pedidos.",
  robots: { index: false, follow: false },
};

export default function LoginClienteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
