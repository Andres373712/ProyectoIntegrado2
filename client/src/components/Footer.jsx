import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter } from 'lucide-react'; // Assuming you have lucide-react for icons

const Footer = () => {
  return (
    <footer className="bg-black text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-lg font-bold mb-4">TMM Bienestar</h3>
            <p className="text-gray-400">
              Transformando vidas a través de la conexión y el bienestar.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="hover:text-gray-300">Inicio</Link></li>
              <li><Link to="/quienes-somos" className="hover:text-gray-300">Nosotros</Link></li>
              <li><Link to="/catalogo" className="hover:text-gray-300">Catálogo</Link></li>
              <li><Link to="/contacto" className="hover:text-gray-300">Contacto</Link></li>
              <li><Link to="/terminos-y-condiciones" className="hover:text-gray-300">Términos y Condiciones</Link></li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-lg font-bold mb-4">Síguenos</h3>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300">
                <Facebook size={24} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300">
                <Instagram size={24} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300">
                <Twitter size={24} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-800 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} TMM Bienestar. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;