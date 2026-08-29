import Link from "next/link";
import { Facebook, Instagram, Twitter } from "lucide-react"; // Assuming you have lucide-react for icons

const Footer = () => {
  return (
    <footer className="bg-foreground py-8 text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* About Section */}
          <div>
            <h3 className="mb-4 font-serif text-lg font-semibold">TMM Bienestar</h3>
            <p className="text-primary-foreground/60">
              Transformando vidas a través de la conexión y el bienestar.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-lg font-bold">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-primary-foreground/80 hover:text-primary-foreground">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/quienes-somos" className="text-primary-foreground/80 hover:text-primary-foreground">
                  Nosotros
                </Link>
              </li>
              <li>
                <Link href="/catalogo" className="text-primary-foreground/80 hover:text-primary-foreground">
                  Catálogo
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="text-primary-foreground/80 hover:text-primary-foreground">
                  Contacto
                </Link>
              </li>
              <li>
                <Link
                  href="/terminos-y-condiciones"
                  className="text-primary-foreground/80 hover:text-primary-foreground"
                >
                  Términos y Condiciones
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="mb-4 text-lg font-bold">Síguenos</h3>
            <div className="flex space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-foreground/80 hover:text-primary-foreground"
              >
                <Facebook size={24} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-foreground/80 hover:text-primary-foreground"
              >
                <Instagram size={24} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-foreground/80 hover:text-primary-foreground"
              >
                <Twitter size={24} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-primary-foreground/10 pt-8 text-center text-primary-foreground/60">
          <p>
            &copy; {new Date().getFullYear()} TMM Bienestar. Todos los derechos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
