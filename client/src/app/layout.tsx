import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/features/carrito/CartContext";

export const metadata: Metadata = {
  title: "TMM Bienestar y Conexión",
  description: "Talleres y productos de bienestar TMM",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es">
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
