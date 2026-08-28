import type { Metadata } from "next";

// La página de contacto (page.tsx) es un Client Component (usa useState para
// el formulario), y Next.js no permite exportar `metadata` desde un archivo
// "use client". Este layout server-side, específico de /contacto, es lo que
// le da su propio título/descripción sin tocar el componente del formulario.
export const metadata: Metadata = {
  title: "Contacto",
  description:
    "¿Tienes dudas sobre un taller o un producto? Escríbenos y te respondemos a la brevedad.",
};

export default function ContactoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
