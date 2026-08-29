"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpenText,
  ShoppingBag,
  ShoppingCart,
  Users,
  Mail,
  MessageSquareQuote,
  ExternalLink,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/shared/auth/AuthProvider";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Token de color por categoría, coherente con Fase 1 (admin-a..f). */
  accent: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "Panel de Control", icon: LayoutDashboard, accent: "text-brand" },
  { href: "/admin/talleres", label: "Talleres", icon: BookOpenText, accent: "text-admin-a" },
  { href: "/admin/productos", label: "Productos", icon: ShoppingBag, accent: "text-admin-b" },
  { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingCart, accent: "text-admin-c" },
  { href: "/admin/clientes", label: "Clientas (CRM)", icon: Users, accent: "text-admin-d" },
  { href: "/admin/mensajes", label: "Mensajes", icon: Mail, accent: "text-admin-e" },
  { href: "/admin/testimonios", label: "Testimonios", icon: MessageSquareQuote, accent: "text-admin-f" },
];

/**
 * Contenido de navegación del panel de admin, compartido entre la barra
 * lateral fija de escritorio y el cajón (drawer) móvil.
 */
export function AdminNavContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { email, logout } = useAuth();

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname?.startsWith(href);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-sm font-bold text-brand-foreground">
          TMM
        </div>
        <div>
          <p className="font-serif text-sm font-semibold leading-tight text-foreground">
            TMM Bienestar
          </p>
          <p className="text-xs text-muted-foreground">Panel de administración</p>
        </div>
      </div>

      <nav aria-label="Navegación del panel" className="flex-1 space-y-1 overflow-y-auto px-3">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
              )}
            >
              <item.icon className={cn("h-4 w-4 shrink-0", active ? item.accent : "text-current")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-border px-3 py-4">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
        >
          <ExternalLink className="h-4 w-4 shrink-0" />
          Ver sitio público
        </Link>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Cerrar sesión
        </button>
        {email && (
          <p className="truncate px-3 pt-2 text-xs text-muted-foreground" title={email}>
            {email}
          </p>
        )}
      </div>
    </div>
  );
}

/** Barra lateral fija, visible desde md hacia arriba. */
export default function AdminSidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-card md:flex md:flex-col">
      <AdminNavContent />
    </aside>
  );
}

export { NAV_ITEMS };
