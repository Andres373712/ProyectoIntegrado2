import type { Metadata } from "next";

export { default } from "../registro/page";

// Este archivo no lleva "use client" (a diferencia de ../registro/page, que
// sí lo tiene), así que puede exportar su propia metadata aunque solo
// reexporte el componente cliente de /registro.
export const metadata: Metadata = {
  title: "Crear Cuenta de Clienta",
  description: "Regístrate como clienta de TMM para inscribirte a talleres y seguir tus pedidos.",
  robots: { index: false, follow: false },
};
