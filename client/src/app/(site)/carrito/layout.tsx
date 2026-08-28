import type { Metadata } from "next";

// Ver nota en contacto/layout.tsx: carrito/page.tsx es "use client", así que
// el título/descripción de esta ruta se define en este layout server-side.
export const metadata: Metadata = {
  title: "Carrito de Compras",
  description: "Revisa los talleres y productos que agregaste y finaliza tu compra.",
};

export default function CarritoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
