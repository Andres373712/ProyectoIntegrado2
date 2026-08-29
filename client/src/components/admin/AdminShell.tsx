"use client";

import React from "react";
import { X } from "lucide-react";
import { usePathname } from "next/navigation";
import AdminSidebar, { AdminNavContent } from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";

/**
 * Chrome propio del panel de administración: sidebar fija en escritorio,
 * cajón deslizable en móvil, y una topbar con el título de la sección
 * activa. Reemplaza el AppShell público (que traía nav + footer + botón de
 * WhatsApp) para que el admin se sienta como una herramienta de trabajo,
 * no como una página de marketing.
 */
export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [menuAbierto, setMenuAbierto] = React.useState(false);
  const pathname = usePathname();
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);

  // Cierra el cajón móvil en cada cambio de ruta. Se ajusta durante el
  // render (patrón recomendado por React) en vez de en un efecto, para no
  // encadenar un commit extra en cada navegación.
  const [rutaAnterior, setRutaAnterior] = React.useState(pathname);
  if (pathname !== rutaAnterior) {
    setRutaAnterior(pathname);
    setMenuAbierto(false);
  }

  // Escape cierra el cajón móvil.
  React.useEffect(() => {
    if (!menuAbierto) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuAbierto(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuAbierto]);

  React.useEffect(() => {
    if (menuAbierto) closeButtonRef.current?.focus();
  }, [menuAbierto]);

  return (
    <div className="flex min-h-screen bg-muted">
      <a
        href="#admin-main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-brand focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-brand-foreground"
      >
        Saltar al contenido
      </a>

      <AdminSidebar />

      {/* --- Cajón móvil --- */}
      {menuAbierto && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            aria-label="Cerrar menú de navegación"
            onClick={() => setMenuAbierto(false)}
            className="absolute inset-0 bg-black/40"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Navegación del panel"
            className="absolute inset-y-0 left-0 flex w-72 max-w-[80vw] flex-col bg-card shadow-xl animate-in slide-in-from-left"
          >
            <div className="flex justify-end p-2">
              <button
                ref={closeButtonRef}
                onClick={() => setMenuAbierto(false)}
                aria-label="Cerrar menú"
                className="rounded-md p-2 text-foreground hover:bg-secondary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="-mt-2 flex-1 overflow-y-auto">
              <AdminNavContent onNavigate={() => setMenuAbierto(false)} />
            </div>
          </div>
        </div>
      )}

      <div className="flex min-h-screen flex-1 flex-col">
        <AdminTopbar onOpenMenu={() => setMenuAbierto(true)} />
        <main id="admin-main-content" className="flex-1 p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
