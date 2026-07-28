import React from "react";
import { NavLink, useLocation, Link } from "react-router-dom";
// import { ShoppingCart } from 'lucide-react'; // (Opcional, si instalamos iconos)

function Navbar() {
  const location = useLocation();
  const token = localStorage.getItem("tmm_token");

  // Solo mostramos la Navbar pública si NO estamos en una ruta de admin
  if (location.pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <nav id="main-navbar" className="sticky top-0 z-50 bg-tmm-dark shadow-lg">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo/Nombre del Sitio */}
          <div className="flex-shrink-0">
            <Link
              to="/"
              className="text-2xl font-bold text-white hover:text-tmm-pink"
            >
              TMM Bienestar y Conexión
            </Link>
          </div>

          {/* Menú Principal (Centro) */}
          <div className="hidden space-x-6 md:flex">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `hover:text-tmm-pink ${isActive ? "font-bold text-tmm-pink" : "text-white"}`
              }
            >
              Inicio
            </NavLink>
            <NavLink
              to="/talleres"
              className={({ isActive }) =>
                `hover:text-tmm-pink ${isActive ? "font-bold text-tmm-pink" : "text-white"}`
              }
            >
              Talleres
            </NavLink>
            <NavLink
              to="/quienes-somos"
              className={({ isActive }) =>
                `hover:text-tmm-pink ${isActive ? "font-bold text-tmm-pink" : "text-white"}`
              }
            >
              Quiénes Somos
            </NavLink>
            <NavLink
              to="/contacto"
              className={({ isActive }) =>
                `hover:text-tmm-pink ${isActive ? "font-bold text-tmm-pink" : "text-white"}`
              }
            >
              Contacto
            </NavLink>
          </div>

          {/* Iconos (Derecha) */}
          <div className="flex items-center space-x-4">
            <button className="relative text-gray-300 hover:text-tmm-pink">
              {/* <ShoppingCart size={24} /> */}
              <span>🛒</span> {/* Placeholder para el icono del carrito */}
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-tmm-pink text-xs text-white">
                0 {/* Contador del Carrito */}
              </span>
            </button>
            {token && (
              <Link
                to="/admin"
                className="rounded-md bg-tmm-blue px-3 py-1 text-sm font-medium text-tmm-dark hover:opacity-80"
              >
                Admin
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
