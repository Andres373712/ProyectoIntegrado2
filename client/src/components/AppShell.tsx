"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/shared/auth/AuthProvider";

import { useCart } from "@/features/carrito/CartContext";
import { ShoppingCart, Menu, X, UserCircle } from "lucide-react"; // Iconos

import logoTMM from "@/assets/logo.jpg";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

// --- COMPONENTE DE NAVEGACIÓN ---
function Navegacion() {
  const router = useRouter();
  const pathname = usePathname();
  const { token, isAdmin, isCliente, logout } = useAuth();
  const { count } = useCart();

  const [visible, setVisible] = React.useState(true);
  const [lastScrollY, setLastScrollY] = React.useState(0);
  const [menuOpen, setMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  // Efecto Scroll
  React.useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== "undefined") {
        if (window.scrollY > lastScrollY && window.scrollY > 100) {
          setVisible(false);
        } else {
          setVisible(true);
        }
        setLastScrollY(window.scrollY);
      }
    };
    window.addEventListener("scroll", controlNavbar);
    return () => window.removeEventListener("scroll", controlNavbar);
  }, [lastScrollY]);

  const isActive = (path) => pathname === path;

  // --- CAMBIO CLAVE: Estilo uniforme para activo e inactivo ---
  // Todos son blancos. El activo tiene un subrayado blanco simple.
  // Eliminamos 'font-bold' del activo para que no cambie el tamaño/grosor.
  const linkClass = (path) =>
    `text-xs uppercase tracking-widest font-medium transition-all duration-200
         text-foreground/70 hover:text-foreground
         ${isActive(path) ? "border-b-2 border-[#E4007C] pb-1 text-foreground" : ""}`;

  return (
    <nav
      className={`fixed z-50 w-full transition-transform duration-300 ease-in-out ${visible ? "translate-y-0" : "-translate-y-full"} border-b border-border bg-background shadow-sm`}
    >
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          {/* --- LOGO --- */}
          <div className="flex h-full flex-shrink-0 items-center">
            <Link href="/" className="group flex h-full items-center gap-3 py-2">
              <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-[#E4007C] bg-white transition-colors">
                <Image
                  src={logoTMM}
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    (target.parentNode as HTMLElement).classList.add("bg-primary");
                  }}
                  alt="TMM"
                  fill
                  sizes="40px"
                  className="object-cover"
                />
                <span className="absolute text-[8px] font-bold text-black/20">
                  LOGO
                </span>
              </div>
              <span className="hidden font-serif text-sm font-semibold tracking-wide text-foreground transition-colors sm:block">
                TMM Bienestar y Conexión
              </span>
            </Link>
          </div>

          {/* --- MENÚ DE ESCRITORIO --- */}
          <div className="hidden items-center space-x-8 md:flex">
            <Link href="/" className={linkClass("/")}>
              Inicio
            </Link>
            <Link href="/quienes-somos" className={linkClass("/quienes-somos")}>
              Nosotros
            </Link>
            <Link href="/catalogo" className={linkClass("/catalogo")}>
              Catálogo
            </Link>
            <Link href="/contacto" className={linkClass("/contacto")}>
              Contacto
            </Link>
          </div>

          {/* --- DERECHA: CARRITO Y AUTH --- */}
          <div className="hidden items-center space-x-6 md:flex">
            {/* Carrito */}
            <Link
              href="/carrito"
              className="group relative text-foreground/70 transition-colors hover:text-foreground"
            >
              <ShoppingCart
                size={20}
                className="transition-transform group-hover:scale-110"
              />
              {count > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 animate-pulse items-center justify-center rounded-full border border-background bg-[#E4007C] text-[9px] font-bold text-white">
                  {count}
                </span>
              )}
            </Link>

            {token ? (
              <>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="rounded-full border border-border px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-foreground/70 hover:text-foreground"
                  >
                    Admin
                  </Link>
                )}
                {isCliente && (
                  <Link
                    href="/mi-cuenta"
                    className="flex items-center gap-1 text-xs uppercase tracking-wider text-foreground/70 transition-colors hover:text-foreground"
                  >
                    <UserCircle size={16} />
                    Mi Cuenta
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="text-[10px] font-bold text-destructive hover:underline"
                >
                  Salir
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-4 border-l border-border pl-6">
                <Link
                  href="/login-cliente"
                  className="text-xs uppercase tracking-wider text-foreground/70 transition-colors hover:text-foreground"
                >
                  Ingresar
                </Link>
                <Link
                  href="/registro-cliente"
                  className="rounded-full bg-primary px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow-md transition-transform hover:scale-105"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>

          {/* --- BOTÓN MÓVIL --- */}
          <div className="ml-auto flex items-center gap-4 md:hidden">
            <Link href="/carrito" className="relative text-foreground">
              <ShoppingCart size={20} />
              {count > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#E4007C] text-[9px] text-white">
                  {count}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-foreground hover:text-foreground/70"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* --- MENÚ MÓVIL DESPLEGABLE --- */}
      {menuOpen && (
        <div className="absolute top-14 w-full space-y-4 border-t border-border bg-background p-4 shadow-lg animate-in slide-in-from-top-5 md:hidden">
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className="block py-2 text-sm uppercase tracking-wider text-foreground hover:text-foreground/70"
          >
            Inicio
          </Link>
          <Link
            href="/catalogo"
            onClick={() => setMenuOpen(false)}
            className="block py-2 text-sm uppercase tracking-wider text-foreground hover:text-foreground/70"
          >
            Catálogo
          </Link>
          <Link
            href="/quienes-somos"
            onClick={() => setMenuOpen(false)}
            className="block py-2 text-sm uppercase tracking-wider text-foreground hover:text-foreground/70"
          >
            Nosotros
          </Link>
          <Link
            href="/contacto"
            onClick={() => setMenuOpen(false)}
            className="block py-2 text-sm uppercase tracking-wider text-foreground hover:text-foreground/70"
          >
            Contacto
          </Link>
          <hr className="border-border" />
          {token ? (
            <>
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setMenuOpen(false)}
                  className="block py-2 text-sm uppercase tracking-wider text-foreground hover:text-foreground/70"
                >
                  Admin
                </Link>
              )}
              {isCliente && (
                <Link
                  href="/mi-cuenta"
                  onClick={() => setMenuOpen(false)}
                  className="block py-2 text-sm uppercase tracking-wider text-foreground hover:text-foreground/70"
                >
                  Mi Cuenta
                </Link>
              )}
              <button
                onClick={() => {
                  setMenuOpen(false);
                  handleLogout();
                }}
                className="block w-full py-2 text-left text-sm font-bold text-destructive hover:underline"
              >
                Salir
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login-cliente"
                onClick={() => setMenuOpen(false)}
                className="block py-2 text-sm text-muted-foreground hover:text-foreground"
              >
                Ingresar
              </Link>
              <Link
                href="/registro-cliente"
                onClick={() => setMenuOpen(false)}
                className="block py-2 text-sm font-bold text-foreground"
              >
                Registrarse
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

const AppShell = ({ children }) => {
  return (
    <>
      <Navegacion />
      <div className="pt-14">{children}</div>
      <Footer />
      <WhatsAppButton />
    </>
  );
};

export default AppShell;
