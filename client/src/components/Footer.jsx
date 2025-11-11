import React from 'react';
import { useLocation } from 'react-router-dom';

function Footer() {
    const location = useLocation();
    
    // No mostramos el Footer en las rutas de admin
    if (location.pathname.startsWith('/admin')) {
        return null;
    }

    return (
        <footer className="bg-gray-800 text-white p-8 mt-12">
            <div className="max-w-6xl mx-auto text-center">
                <p className="font-bold text-lg mb-2">TMM Bienestar y Conexión</p>
                <p className="text-gray-400 text-sm">
                    © {new Date().getFullYear()} TMM Bienestar y Conexión. Todos los derechos reservados.
                </p>
                {/* Aquí podrías añadir enlaces a redes sociales */}
                <div className="flex justify-center space-x-4 mt-4">
                    <a href="#" className="text-gray-400 hover:text-white">Instagram</a>
                    <a href="#" className="text-gray-400 hover:text-white">Facebook</a>
                    <a href="#" className="text-gray-400 hover:text-white">WhatsApp</a>
                </div>
            </div>
        </footer>
    );
}

export default Footer;  