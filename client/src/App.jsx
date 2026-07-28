import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { jwtDecode } from "jwt-decode";

// --- IMPORTACIÓN DE PÁGINAS (Desde la carpeta pages) ---
import Homepage from "./pages/Homepage.jsx";
import Catalogo from "./pages/Catalogo.jsx";
import Inscripcion from "./pages/Inscripcion.jsx";
import QuienesSomos from "./pages/QuienesSomos.jsx";
import Login from "./pages/Login.jsx";
import LoginCliente from "./pages/LoginCliente.jsx";
import Registro from "./pages/Registro.jsx";
import TerminosYCondiciones from "./pages/TerminosYCondiciones.jsx";
import RecuperarPassword from "./pages/RecuperarPassword.jsx";
import NuevaPassword from "./pages/NuevaPassword.jsx";
import Carrito from "./pages/Carrito.jsx";
import Contacto from "./pages/Contacto.jsx";

// --- PÁGINAS DE ADMINISTRACIÓN ---
import AdminDashboard from "./pages/AdminDashboard.jsx";
import Admin from "./pages/Admin.jsx";
import EditarTaller from "./pages/EditarTaller.jsx";
import AdminProductos from "./pages/AdminProductos.jsx";
import AdminClientes from "./pages/AdminClientes.jsx";
import ClienteDetalle from "./pages/ClienteDetalle.jsx";
import AdminMensajes from "./pages/AdminMensajes.jsx";

// --- COMPONENTES UTILITARIOS ---
import ProtectedRoute from "./ProtectedRoute.jsx";
import { CartProvider, useCart } from "./context/CartContext.jsx";
import { ShoppingCart, Menu, X } from "lucide-react"; // Iconos

// --- IMPORTAR ASSETS ---
import logoTMM from "./assets/logo.jpg";
import Footer from "./components/Footer.jsx";

// --- COMPONENTE DE NAVEGACIÓN ---
function Navegacion() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("tmm_token");
  const { count } = useCart();

  const [visible, setVisible] = React.useState(true);
  const [lastScrollY, setLastScrollY] = React.useState(0);
  const [menuOpen, setMenuOpen] = React.useState(false);

  const handleLogout = () => {
    localStorage.removeItem("tmm_token");
    navigate("/");
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

  const isActive = (path) => location.pathname === path;

  // --- CAMBIO CLAVE: Estilo uniforme para activo e inactivo ---
  // Todos son blancos. El activo tiene un subrayado blanco simple.
  // Eliminamos 'font-bold' del activo para que no cambie el tamaño/grosor.
  const linkClass = (path) =>
    `text-xs uppercase tracking-widest font-medium transition-all duration-200 
         text-white hover:text-gray-300 
         ${isActive(path) ? "border-b border-white pb-1" : ""}`;

  return (
    <nav
      className={`fixed z-50 w-full transition-transform duration-300 ease-in-out ${visible ? "translate-y-0" : "-translate-y-full"} border-b border-white/10 bg-black shadow-lg`}
    >
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          {/* --- LOGO --- */}
          <div className="flex h-full flex-shrink-0 items-center">
            <Link to="/" className="group flex h-full items-center gap-3 py-2">
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-white transition-colors group-hover:border-white">
                <img
                  src={logoTMM}
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.parentNode.classList.add("bg-primary");
                  }}
                  alt="TMM"
                  className="h-full w-full object-cover"
                />
                <span className="absolute text-[8px] font-bold text-black/20">
                  LOGO
                </span>
              </div>
              <span className="hidden text-sm font-bold tracking-widest text-white transition-colors group-hover:text-gray-200 sm:block">
                TMM Bienestar y Conexión
              </span>
            </Link>
          </div>

          {/* --- MENÚ DE ESCRITORIO --- */}
          <div className="hidden items-center space-x-8 md:flex">
            <Link to="/" className={linkClass("/")}>
              Inicio
            </Link>
            <Link to="/quienes-somos" className={linkClass("/quienes-somos")}>
              Nosotros
            </Link>
            <Link to="/catalogo" className={linkClass("/catalogo")}>
              Catálogo
            </Link>
            <Link to="/contacto" className={linkClass("/contacto")}>
              Contacto
            </Link>
          </div>

          {/* --- DERECHA: CARRITO Y AUTH --- */}
          <div className="hidden items-center space-x-6 md:flex">
            {/* Carrito */}
            <Link
              to="/carrito"
              className="group relative text-white transition-colors hover:text-gray-300"
            >
              <ShoppingCart
                size={20}
                className="transition-transform group-hover:scale-110"
              />
              {count > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 animate-pulse items-center justify-center rounded-full border border-black bg-white text-[9px] font-bold text-black">
                  {count}
                </span>
              )}
            </Link>

            {token ? (
              <>
                {(() => {
                  try {
                    const decoded = jwtDecode(token);
                    // Solo mostrar el botón Admin si el usuario es realmente admin
                    if (decoded.rol === "admin") {
                      return (
                        <Link
                          to="/admin"
                          className="rounded-full border border-gray-600 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-gray-300 hover:text-white"
                        >
                          Admin
                        </Link>
                      );
                    }
                  } catch (error) {
                    console.error("Error decodificando token:", error);
                  }
                  return null;
                })()}
                <button
                  onClick={handleLogout}
                  className="text-[10px] font-bold text-red-400 hover:text-red-300 hover:underline"
                >
                  Salir
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-4 border-l border-gray-700 pl-6">
                <Link
                  to="/login-cliente"
                  className="text-xs uppercase tracking-wider text-gray-300 transition-colors hover:text-white"
                >
                  Ingresar
                </Link>
                <Link
                  to="/registro-cliente"
                  className="rounded-full bg-white px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-black shadow-md transition-transform hover:scale-105 hover:bg-gray-200"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>

          {/* --- BOTÓN MÓVIL --- */}
          <div className="ml-auto flex items-center gap-4 md:hidden">
            <Link to="/carrito" className="relative text-white">
              <ShoppingCart size={20} />
              {count > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[9px] text-black">
                  {count}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-white hover:text-gray-300"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* --- MENÚ MÓVIL DESPLEGABLE --- */}
      {menuOpen && (
        <div className="absolute top-14 w-full space-y-4 border-t border-gray-800 bg-black p-4 shadow-2xl animate-in slide-in-from-top-5 md:hidden">
          <Link
            to="/"
            onClick={() => setMenuOpen(false)}
            className="block py-2 text-sm uppercase tracking-wider text-white hover:text-gray-300"
          >
            Inicio
          </Link>
          <Link
            to="/catalogo"
            onClick={() => setMenuOpen(false)}
            className="block py-2 text-sm uppercase tracking-wider text-white hover:text-gray-300"
          >
            Catálogo
          </Link>
          <Link
            to="/quienes-somos"
            onClick={() => setMenuOpen(false)}
            className="block py-2 text-sm uppercase tracking-wider text-white hover:text-gray-300"
          >
            Nosotros
          </Link>
          <Link
            to="/contacto"
            onClick={() => setMenuOpen(false)}
            className="block py-2 text-sm uppercase tracking-wider text-white hover:text-gray-300"
          >
            Contacto
          </Link>
          <hr className="border-gray-800" />
          {!token && (
            <>
              <Link
                to="/login-cliente"
                onClick={() => setMenuOpen(false)}
                className="block py-2 text-sm text-gray-400 hover:text-white"
              >
                Ingresar
              </Link>
              <Link
                to="/registro-cliente"
                onClick={() => setMenuOpen(false)}
                className="block py-2 text-sm font-bold text-white"
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

function App() {
  return (
    <CartProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/catalogo" element={<Catalogo />} />
            <Route path="/carrito" element={<Carrito />} />
            <Route path="/inscribir/:id" element={<Inscripcion />} />

            <Route path="/quienes-somos" element={<QuienesSomos />} />
            <Route path="/contacto" element={<Contacto />} />

            <Route path="/login" element={<Login />} />
            <Route path="/login-cliente" element={<LoginCliente />} />
            <Route path="/registro-cliente" element={<Registro />} />
            <Route
              path="/terminos-y-condiciones"
              element={<TerminosYCondiciones />}
            />
            <Route path="/forgot-password" element={<RecuperarPassword />} />
            <Route path="/reset-password/:token" element={<NuevaPassword />} />

            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/talleres"
              element={
                <ProtectedRoute>
                  <Admin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/editar/:id"
              element={
                <ProtectedRoute>
                  <EditarTaller />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/productos"
              element={
                <ProtectedRoute>
                  <AdminProductos />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/clientes"
              element={
                <ProtectedRoute>
                  <AdminClientes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/cliente/:id"
              element={
                <ProtectedRoute>
                  <ClienteDetalle />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/mensajes"
              element={
                <ProtectedRoute>
                  <AdminMensajes />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Layout>
      </Router>
    </CartProvider>
  );
}

import WhatsAppButton from "./components/WhatsAppButton";

const Layout = ({ children }) => {
  const location = useLocation();
  const hideNavbar = location.pathname === "/terminos-y-condiciones";

  return (
    <>
      {!hideNavbar && <Navegacion />}
      <div className="pt-14">{children}</div>
      {!hideNavbar && <Footer />}
      <WhatsAppButton />
    </>
  );
};

export default App;
