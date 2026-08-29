"use client";

import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { NAV_ITEMS } from "./AdminSidebar";

function tituloDesdeRuta(pathname: string | null): string {
  if (!pathname) return "Panel de Control";
  const item = NAV_ITEMS.find((n) =>
    n.href === "/admin" ? pathname === "/admin" : pathname.startsWith(n.href),
  );
  if (item) return item.label;
  if (pathname.startsWith("/admin/cliente/")) return "Detalle de Clienta";
  if (pathname.startsWith("/admin/editar/")) return "Editar Taller";
  return "Panel de Control";
}

export default function AdminTopbar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const pathname = usePathname();
  const titulo = tituloDesdeRuta(pathname);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:px-8">
      <button
        onClick={onOpenMenu}
        aria-label="Abrir menú de navegación"
        className="rounded-md p-2 text-foreground hover:bg-secondary md:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>
      <h1 className="truncate text-base font-semibold text-foreground md:text-lg">{titulo}</h1>
    </header>
  );
}
