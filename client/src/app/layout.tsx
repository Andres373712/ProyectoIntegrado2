import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/features/carrito/CartContext";
import { AuthProvider } from "@/shared/auth/AuthProvider";
import { QueryProvider } from "@/shared/query/QueryProvider";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "TMM Bienestar y Conexión",
  description: "Talleres y productos de bienestar TMM",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es">
      <body>
        <QueryProvider>
          <AuthProvider>
            <CartProvider>{children}</CartProvider>
          </AuthProvider>
        </QueryProvider>
        <Toaster />
      </body>
    </html>
  );
}
