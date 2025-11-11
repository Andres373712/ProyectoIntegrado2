import React from 'react';
import { Link, useLocation } from 'react-router-dom';
// import { ShoppingCart } from 'lucide-react'; // (Opcional, si instalamos iconos)

function Navbar() {
    const location = useLocation();
    const token = localStorage.getItem('tmm_token');

    // Función para resaltar el enlace activo
    const isActive = (path) => location.pathname === path;

    // Solo mostramos la Navbar pública si NO estamos en una ruta de admin
    if (location.pathname.startsWith('/admin')) {
        return null; 
    }

    return (
        <nav className="bg-white shadow-lg sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    
                    {/* Logo/Nombre del Sitio */}
                    <div className="flex-shrink-0">
                        <Link to="/" className="text-2xl font-bold text-tmm-dark hover:text-tmm-pink">
                            TMM Bienestar
                        </Link>
                    </div>

                    {/* Menú Principal (Centro) */}
                    <div className="hidden md:flex space-x-6">
                        <Link 
                            to="/" 
                            className={`font-medium ${isActive('/') ? 'text-tmm-pink border-b-2 border-tmm-pink' : 'text-gray-600 hover:text-tmm-dark'}`}
                        >
                            Inicio
                        </Link>
                        <Link 
                            to="/talleres" 
                            className={`font-medium ${isActive('/talleres') ? 'text-tmm-pink border-b-2 border-tmm-pink' : 'text-gray-600 hover:text-tmm-dark'}`}
                        >
                            Talleres
                        </Link>
                        <Link 
                            to="/quienes-somos" 
                            className={`font-medium ${isActive('/quienes-somos') ? 'text-tmm-pink border-b-2 border-tmm-pink' : 'text-gray-600 hover:text-tmm-dark'}`}
                        >
                            Quiénes Somos
                        </Link>
                        <Link 
                            to="/contacto" 
                            className={`font-medium ${isActive('/contacto') ? 'text-tmm-pink border-b-2 border-tmm-pink' : 'text-gray-600 hover:text-tmm-dark'}`}
                        >
                            Contacto
                        </Link>
                    </div>

                    {/* Iconos (Derecha) */}
                    <div className="flex items-center space-x-4">
                        <button className="relative text-gray-600 hover:text-tmm-pink">
                            {/* <ShoppingCart size={24} /> */}
                            <span>🛒</span> {/* Placeholder para el icono del carrito */}
                            <span className="absolute -top-2 -right-2 bg-tmm-pink text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                0 {/* Contador del Carrito */}
                            </span>
                        </button>
                        {token && (
                            <Link 
                                to="/admin" 
                                className="text-sm font-medium bg-tmm-blue text-tmm-dark px-3 py-1 rounded-md hover:opacity-80"
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