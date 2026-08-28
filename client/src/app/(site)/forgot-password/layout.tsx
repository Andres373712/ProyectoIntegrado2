import type { Metadata } from "next";

// Ver nota en contacto/layout.tsx: forgot-password/page.tsx es "use client".
export const metadata: Metadata = {
  title: "Recuperar Contraseña",
  description: "Solicita un enlace para restablecer la contraseña de tu cuenta de TMM.",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
