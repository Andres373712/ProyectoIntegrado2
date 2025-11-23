import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

// --- IMPORTACIÓN DE PÁGINAS (Desde la carpeta pages) ---
import Homepage from './pages/Homepage.jsx';
import Catalogo from './pages/Catalogo.jsx';
import Inscripcion from './pages/Inscripcion.jsx';
import QuienesSomos from './pages/QuienesSomos.jsx'; 
import Login from './pages/Login.jsx'; 
import LoginCliente from './pages/LoginCliente.jsx'; 
import Registro from './pages/Registro.jsx'; 
import RecuperarPassword from './pages/RecuperarPassword.jsx';
import NuevaPassword from './pages/NuevaPassword.jsx';
import Carrito from './pages/Carrito.jsx';

// --- PÁGINAS DE ADMINISTRACIÓN ---
import AdminDashboard from './pages/AdminDashboard.jsx';
import Admin from './pages/Admin.jsx'; 
import EditarTaller from './pages/EditarTaller.jsx';
import AdminProductos from './pages/AdminProductos.jsx'; 
import AdminClientes from './pages/AdminClientes.jsx';
import ClienteDetalle from './pages/ClienteDetalle.jsx';

// --- COMPONENTES UTILITARIOS ---
import ProtectedRoute from './ProtectedRoute.jsx'; 
import { CartProvider, useCart } from './context/CartContext.jsx'; 
import { ShoppingCart, Menu, X } from 'lucide-react'; // Iconos

// --- IMPORTAR ASSETS ---
import logoTMM from './assets/logo.jpg'; 

// --- COMPONENTE DE NAVEGACIÓN ---
function Navegacion() {
    const navigate = useNavigate();
    const location = useLocation();
    const token = localStorage.getItem('tmm_token');
    const { count } = useCart(); 
    
    const [visible, setVisible] = React.useState(true);
    const [lastScrollY, setLastScrollY] = React.useState(0);
    const [menuOpen, setMenuOpen] = React.useState(false); 

    const handleLogout = () => {
        localStorage.removeItem('tmm_token');
        navigate('/'); 
    };

    // Efecto Scroll
    React.useEffect(() => {
        const controlNavbar = () => {
            if (typeof window !== 'undefined') {
                if (window.scrollY > lastScrollY && window.scrollY > 100) { 
                    setVisible(false); 
                } else { 
                    setVisible(true);  
                }
                setLastScrollY(window.scrollY);
            }
        };
        window.addEventListener('scroll', controlNavbar);
        return () => window.removeEventListener('scroll', controlNavbar);
    }, [lastScrollY]);

    const isActive = (path) => location.pathname === path;
    
    // --- CAMBIO CLAVE: Estilo uniforme para activo e inactivo ---
    // Todos son blancos. El activo tiene un subrayado blanco simple.
    // Eliminamos 'font-bold' del activo para que no cambie el tamaño/grosor.
    const linkClass = (path) => 
        `text-xs uppercase tracking-widest font-medium transition-all duration-200 
         text-white hover:text-gray-300 
         ${isActive(path) ? 'border-b border-white pb-1' : ''}`;

    return (
        <nav 
            className={`fixed w-full z-50 transition-transform duration-300 ease-in-out ${visible ? 'translate-y-0' : '-translate-y-full'} bg-black shadow-lg border-b border-white/10`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                <div className="flex justify-between items-center h-14"> 
                    
                    {/* --- LOGO --- */}
                    <div className="flex-shrink-0 flex items-center h-full">
                        <Link to="/" className="flex items-center gap-3 group h-full py-2"> 
                            <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20 group-hover:border-white transition-colors flex items-center justify-center bg-white">
                                <img 
                                    src={logoTMM} 
                                    onError={(e) => {
                                        e.target.style.display='none'; 
                                        e.target.parentNode.classList.add('bg-primary');
                                    }}
                                    alt="TMM" 
                                    className="w-full h-full object-cover" 
                                />
                                <span className="absolute text-[8px] font-bold text-black/20">LOGO</span>
                            </div>
                            <span className="text-white font-bold text-sm tracking-widest hidden sm:block group-hover:text-gray-200 transition-colors">
                                TMM
                            </span>
                        </Link>
                    </div>

                    {/* --- MENÚ DE ESCRITORIO --- */}
                    <div className="hidden md:flex space-x-8 items-center"> 
                        <Link to="/" className={linkClass('/')}>Inicio</Link>
                        <Link to="/quienes-somos" className={linkClass('/quienes-somos')}>Nosotros</Link>
                        <Link to="/catalogo" className={linkClass('/catalogo')}>Catálogo</Link>
                        <Link to="/contacto" className={linkClass('/contacto')}>Contacto</Link>
                    </div>

                    {/* --- DERECHA: CARRITO Y AUTH --- */}
                    <div className="hidden md:flex items-center space-x-6">
                        {/* Carrito */}
                        <Link to="/carrito" className="relative text-white hover:text-gray-300 transition-colors group">
                            <ShoppingCart size={20} className="group-hover:scale-110 transition-transform" />
                            {count > 0 && (
                                <span className="absolute -top-2 -right-2 bg-white text-black text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-black animate-pulse">
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
                                    if (decoded.rol === 'admin') {
                                        return (
                                            <Link to="/admin" className="text-[10px] text-gray-300 hover:text-white uppercase tracking-wide font-semibold border border-gray-600 px-3 py-1 rounded-full">
                                                Admin
                                            </Link>
                                        );
                                    }
                                } catch (error) {
                                    console.error('Error decodificando token:', error);
                                }
                                return null;
                            })()}
                            <button onClick={handleLogout} className="text-[10px] font-bold text-red-400 hover:text-red-300 hover:underline">
                                Salir
                            </button>
                        </>
                    ) : (
                        <div className="flex items-center space-x-4 border-l border-gray-700 pl-6">
                            <Link to="/login-cliente" className="text-xs text-gray-300 hover:text-white transition-colors uppercase tracking-wider">Ingresar</Link>
                            <Link to="/registro-cliente" className="bg-white text-black text-[10px] font-bold px-4 py-1.5 rounded-full hover:bg-gray-200 transition-transform hover:scale-105 shadow-md uppercase tracking-wider">
                                Registrarse
                            </Link>
                        </div>
                    )}
                    </div>
                    
                    {/* --- BOTÓN MÓVIL --- */}
                    <div className="md:hidden flex items-center gap-4 ml-auto"> 
                        <Link to="/carrito" className="relative text-white">
                            <ShoppingCart size={20} />
                            {count > 0 && <span className="absolute -top-2 -right-2 bg-white text-black text-[9px] w-4 h-4 flex items-center justify-center rounded-full">{count}</span>}
                        </Link>
                        <button onClick={() => setMenuOpen(!menuOpen)} className="text-white hover:text-gray-300">
                            {menuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* --- MENÚ MÓVIL DESPLEGABLE --- */}
            {menuOpen && (
                <div className="md:hidden bg-black border-t border-gray-800 p-4 space-y-4 absolute w-full shadow-2xl animate-in slide-in-from-top-5 top-14">
                    <Link to="/" onClick={() => setMenuOpen(false)} className="block text-white hover:text-gray-300 py-2 text-sm uppercase tracking-wider">Inicio</Link>
                    <Link to="/catalogo" onClick={() => setMenuOpen(false)} className="block text-white hover:text-gray-300 py-2 text-sm uppercase tracking-wider">Catálogo</Link>
                    <Link to="/quienes-somos" onClick={() => setMenuOpen(false)} className="block text-white hover:text-gray-300 py-2 text-sm uppercase tracking-wider">Nosotros</Link>
                    <Link to="/contacto" onClick={() => setMenuOpen(false)} className="block text-white hover:text-gray-300 py-2 text-sm uppercase tracking-wider">Contacto</Link>
                    <hr className="border-gray-800" />
                    {!token && (
                        <>
                            <Link to="/login-cliente" onClick={() => setMenuOpen(false)} className="block text-gray-400 hover:text-white py-2 text-sm">Ingresar</Link>
                            <Link to="/registro-cliente" onClick={() => setMenuOpen(false)} className="block text-white font-bold py-2 text-sm">Registrarse</Link>
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
          <Navegacion />
          <div className="pt-0"> 
            <Routes>
                <Route path="/" element={<Homepage />} />
                <Route path="/catalogo" element={<Catalogo />} />
                <Route path="/carrito" element={<Carrito />} /> 
                <Route path="/inscribir/:id" element={<Inscripcion />} />
                
                <Route path="/quienes-somos" element={<QuienesSomos />} /> 
                <Route path="/contacto" element={<div className="p-20 text-center pt-32"><h1>Página de Contacto (Próximamente)</h1></div>} />

                <Route path="/login" element={<Login />} />
                <Route path="/login-cliente" element={<LoginCliente />} />
                <Route path="/registro-cliente" element={<Registro />} />
                <Route path="/forgot-password" element={<RecuperarPassword />} />
                <Route path="/reset-password/:token" element={<NuevaPassword />} />

                <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/talleres" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
                <Route path="/admin/editar/:id" element={<ProtectedRoute><EditarTaller /></ProtectedRoute>} />
                <Route path="/admin/productos" element={<ProtectedRoute><AdminProductos /></ProtectedRoute>} />
                <Route path="/admin/clientes" element={<ProtectedRoute><AdminClientes /></ProtectedRoute>} />
                <Route path="/admin/cliente/:id" element={<ProtectedRoute><ClienteDetalle /></ProtectedRoute>} />
            </Routes>
          </div>
        </Router>
    </CartProvider>
  );
}

export default App;