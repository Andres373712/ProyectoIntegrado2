import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
    Card, 
    CardContent, 
    CardFooter, 
    CardHeader, 
    CardTitle,
    CardDescription
} from '@/components/ui/card';

// --- IMPORTACIONES DE CARRUSEL E ICONOS ---
import Slider from "react-slick";
import { ShoppingCart, Ban } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx'; 

// --- IMPORTACIONES DE ASSETS (AJUSTAR EXTENSIONES Y NOMBRES) ---
import HeroBackground from '../assets/nuevo-fondo.jpg'; 
import CarouselImg1 from '../assets/carousel-1.jpeg';
import CarouselImg2 from '../assets/carousel-2.jpeg';
import CarouselImg3 from '../assets/carousel-3.jpeg';
import FotoCarolina from '../assets/carolina.jpg'; 
// --- FIN ASSETS ---

function Homepage() {
    const [productos, setProductos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const { addToCart } = useCart(); 

    useEffect(() => {
        // Cargar productos activos para la vitrina
        axios.get('http://localhost:5000/api/productos/activos')
            .then(response => {
                // Tomamos solo los 3 primeros productos para mostrar
                setProductos(response.data.slice(0, 3)); 
                setCargando(false);
            })
            .catch(error => {
                console.error("Error al cargar productos:", error);
                setCargando(false);
            });
    }, []);

    // Configuración del Carrusel (Hero)
    const sliderSettings = {
        dots: true,
        infinite: true,
        speed: 500,
        autoplay: true,
        autoplaySpeed: 3000,
        slidesToShow: 1,
        slidesToScroll: 1,
        fade: true,
        cssEase: 'linear',
        arrows: false
    };

    return (
        <div className="bg-background text-foreground min-h-screen">
            
            {/* --- 1. SECCIÓN HERO (Dividida con Fondo Estático) --- */}
            <div 
                className="relative w-full p-8 md:p-12 min-h-[600px] flex items-center overflow-hidden" 
                style={{ 
                    // Fondo estático con capa oscura suave (0.4) para que el texto blanco se lea bien
                    backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${HeroBackground})`,
                    backgroundSize: 'cover', 
                    backgroundPosition: 'center' 
                }}
            >
                {/* Contenedor Principal (Centrado y con ancho máximo) */}
                <div className="relative z-10 container mx-auto px-6 md:px-12 h-full py-12">
                    
                    {/* Grid de 2 Columnas */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center h-full">
                        
                        {/* Columna 1: Texto (Izquierda) */}
                        <div className="text-center lg:text-left text-white space-y-6 animate-in fade-in slide-in-from-left duration-700">
                            <h1 className="text-4xl md:text-6xl font-bold leading-tight drop-shadow-lg">
                                TMM Bienestar y Conexión
                            </h1>
                            <p className="text-lg md:text-xl text-white/90 max-w-lg mx-auto lg:mx-0 drop-shadow-md">
                                Un espacio de bienestar para ti. Descubre el poder sanador de la artesanía y conecta contigo misma.
                            </p>
                            <div className="pt-4">
                                <Button asChild className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 shadow-lg hover:scale-105 transition-transform border-none text-white">
                                    <Link to="/catalogo">Explorar Talleres</Link>
                                </Button>
                            </div>
                        </div>

                        {/* Columna 2: Carrusel (Derecha) */}
                        <div className="w-full max-w-md mx-auto lg:max-w-full rounded-xl overflow-hidden shadow-2xl border-4 border-white/20 animate-in fade-in slide-in-from-right duration-700 delay-200">
                            <Slider {...sliderSettings}>
                                <div><img src={CarouselImg1} alt="Taller 1" className="w-full h-64 md:h-96 object-cover" /></div>
                                <div><img src={CarouselImg2} alt="Taller 2" className="w-full h-64 md:h-96 object-cover" /></div>
                                <div><img src={CarouselImg3} alt="Taller 3" className="w-full h-64 md:h-96 object-cover" /></div>
                            </Slider>
                        </div>

                    </div>
                </div>

                {/* Degradado inferior para suavizar la transición al fondo blanco */}
                <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-background to-transparent pointer-events-none"></div>
            </div>

            {/* --- 2. SECCIÓN PRODUCTOS DISPONIBLES --- */}
            <div className="max-w-6xl mx-auto p-8 md:p-20">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Nuestros Productos y Kits</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Lleva la experiencia creativa a tu hogar con nuestros kits preparados con cariño.
                    </p>
                </div>
                
                {cargando ? (
                    <p className="text-center text-muted-foreground">Cargando productos...</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {productos.length > 0 ? productos.map(prod => {
                            const sinStock = prod.stock <= 0;
                            
                            return (
                                <Card key={prod.id} className="flex flex-col justify-between overflow-hidden hover:shadow-xl transition-shadow duration-300 border-none shadow-md">
                                    <CardHeader className="p-0">
                                        <div className="relative">
                                            <img 
                                                src={prod.imageUrl ? `http://localhost:5000${prod.imageUrl}` : '/placeholder.png'} 
                                                alt={prod.nombre} 
                                                className={`w-full h-56 object-cover transition-transform duration-500 hover:scale-105 ${sinStock ? 'grayscale opacity-60' : ''}`} 
                                            />
                                            {sinStock && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                                                    <span className="bg-destructive text-white font-bold px-4 py-2 rounded text-lg transform -rotate-12 shadow-lg">
                                                        AGOTADO
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </CardHeader>
                                    
                                    <CardContent className="p-6">
                                        <CardTitle className="text-xl mb-2">{prod.nombre}</CardTitle>
                                        <CardDescription className="line-clamp-2 text-sm mb-4">
                                            {prod.descripcion}
                                        </CardDescription>
                                        <div className="flex justify-between items-end">
                                            <p className="text-2xl font-bold text-primary">${prod.precio.toLocaleString('es-CL')}</p>
                                            <p className="text-xs text-muted-foreground font-medium">
                                                {sinStock ? 'Sin stock' : `Disponibles: ${prod.stock}`}
                                            </p>
                                        </div>
                                    </CardContent>

                                    <CardFooter className="p-6 pt-0">
                                        <Button 
                                            className="w-full gap-2 font-semibold" 
                                            disabled={sinStock}
                                            variant={sinStock ? "secondary" : "default"}
                                            onClick={() => {
                                                addToCart({
                                                    id: prod.id,
                                                    nombre: prod.nombre,
                                                    precio: prod.precio,
                                                    imageUrl: prod.imageUrl,
                                                    stock: prod.stock,
                                                    tipo: 'producto' 
                                                });
                                                alert(`¡${prod.nombre} añadido al carrito!`);
                                            }}
                                        >
                                            {sinStock ? (
                                                <><Ban className="w-4 h-4" /> No Disponible</>
                                            ) : (
                                                <><ShoppingCart className="w-4 h-4" /> Añadir al Carrito</>
                                            )}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            );
                        }) : (
                            <div className="col-span-3 text-center py-12 bg-secondary/30 rounded-lg">
                                <p className="text-lg text-muted-foreground">Pronto tendremos productos disponibles.</p>
                            </div>
                        )}
                    </div>
                )}
                
                 <div className="text-center mt-12">
                    <Button asChild variant="outline" size="lg" className="border-primary text-primary hover:bg-primary hover:text-white transition-colors">
                        <Link to="/catalogo">Ver Todo el Catálogo</Link>
                    </Button>
                </div>
            </div>

            {/* --- 3. SECCIÓN QUIENES SOMOS --- */}
            <div className="bg-secondary/30 p-12 md:p-24">
                <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                    <div className="order-2 md:order-1">
                        <h2 className="text-3xl font-bold mb-6 text-foreground">Conoce a Carolina</h2>
                        <div className="w-16 h-1 bg-primary mb-6"></div>
                        <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                            ¡Hola! Soy Carolina López, fundadora de TMM. Mi misión es crear un refugio donde puedas desconectarte del estrés diario y reconectarte contigo misma a través de la creatividad y la artesanía.
                        </p>
                        <Button asChild variant="link" className="text-lg text-primary p-0 font-bold hover:underline">
                            <Link to="/quienes-somos">Leer nuestra historia completa →</Link>
                        </Button>
                    </div>
                    <div className="order-1 md:order-2 flex justify-center">
                        <div className="relative w-64 h-64 md:w-80 md:h-80">
                            {/* Círculo decorativo detrás */}
                            <div className="absolute inset-0 bg-primary/10 rounded-full transform translate-x-4 translate-y-4"></div>
                            {/* Imagen de Carolina */}
                            <div className="relative w-full h-full bg-white rounded-full flex items-center justify-center shadow-xl overflow-hidden border-4 border-white">
                                <img 
                                    src={FotoCarolina} 
                                    alt="Carolina López" 
                                    className="w-full h-full object-cover"
                                    onError={(e) => {e.target.style.display='none'; e.target.parentNode.style.backgroundColor='#e5e7eb'}} 
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}

export default Homepage;