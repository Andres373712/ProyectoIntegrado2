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

// --- IMPORTACIONES PARA EL HERO Y EL CARRUSEL ---
import Slider from "react-slick";
// 1. Tu imagen de fondo estática
import HeroBackground from '../assets/image.png'; // <-- Tu imagen de fondo
// 2. Imágenes para el carrusel (asegúrate de que existan)
import CarouselImg1 from '../assets/carousel-1.jpeg';
import CarouselImg2 from '../assets/carousel-2.jpeg';
import CarouselImg3 from '../assets/carousel-3.jpeg';

function Homepage() {
    const [talleres, setTalleres] = useState([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        axios.get('http://localhost:5000/api/talleres/activos')
            .then(response => {
                setTalleres(response.data.slice(0, 3)); 
                setCargando(false);
            })
            .catch(error => {
                console.error("Error al cargar talleres:", error);
                setCargando(false);
            });
    }, []);

    // --- Configuración para el Carrusel del Hero ---
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
            
            {/* --- 1. Sección Hero (Fondo Estático + Layout Dividido) --- */}
            <div 
                className="relative w-full p-8 md:p-12 min-h-[500px] flex items-center justify-center overflow-hidden" 
                style={{ 
                    // Usamos tu image.png como fondo
                    backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${HeroBackground})`,
                    backgroundSize: 'cover', 
                    backgroundPosition: 'center' 
                }}
            >
                {/* Contenedor de 2 columnas (Texto + Carrusel) */}
                <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    
                    {/* --- Columna 1: Texto --- */}
                    <div className="text-center md:text-left text-white">
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            TMM Bienestar y Conexión
                        </h1>
                        <p className="text-lg md:text-xl text-white/90">
                            Un espacio de bienestar para ti. Descubre el poder sanador de la artesanía y conecta contigo misma.
                        </p>
                        <Button asChild className="mt-8 text-lg px-8 py-6">
                            <Link to="/catalogo">Explorar Talleres</Link>
                        </Button>
                    </div>

                    {/* --- Columna 2: Carrusel --- */}
                    <div className="w-full rounded-lg overflow-hidden shadow-xl">
                        <Slider {...sliderSettings}>
                            <div>
                                <img src={CarouselImg1} alt="Taller de Bienestar 1" className="w-full h-80 md:h-96 object-cover" />
                            </div>
                            <div>
                                <img src={CarouselImg2} alt="Taller de Bienestar 2" className="w-full h-80 md:h-96 object-cover" />
                            </div>
                            <div>
                                <img src={CarouselImg3} alt="Taller de Bienestar 3" className="w-full h-80 md:h-96 object-cover" />
                            </div>
                        </Slider>
                    </div>

                </div>
            </div>

            {/* --- 2. Sección Talleres Destacados (Sin cambios) --- */}
            <div className="max-w-6xl mx-auto p-8 md:p-12">
                <h2 className="text-3xl font-bold text-center mb-8">Talleres Destacados</h2>
                
                {cargando ? (
                    <p className="text-center">Cargando talleres...</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {talleres.map(taller => (
                            <Card key={taller.id} className="flex flex-col justify-between overflow-hidden">
                                <CardHeader>
                                    <CardTitle className="text-2xl">{taller.nombre}</CardTitle>
                                    <CardDescription>
                                        {taller.fecha ? new Date(taller.fecha).toLocaleDateString('es-CL', { month: 'long', day: 'numeric' }) : 'Próximamente'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <img 
                                        src={`http://localhost:5000${taller.imageUrl || '/placeholder.png'}`} 
                                        alt={taller.nombre} 
                                        className="w-full h-48 object-cover rounded-md mb-4" 
                                    />
                                    <p className="text-2xl font-bold mt-4">${taller.precio ? taller.precio.toLocaleString('es-CL') : 'N/A'}</p>
                                </CardContent>
                                <CardFooter>
                                    <Button asChild variant="secondary" className="w-full">
                                        <Link to={`/inscribir/${taller.id}`}>Ver Detalles</Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
                 <div className="text-center mt-12">
                    <Button asChild variant="outline" size="lg">
                        <Link to="/catalogo">Ver Todos los Talleres</Link>
                    </Button>
                </div>
            </div>

            {/* --- 3. Sección "Quienes Somos" (Con Placeholder) --- */}
            <div className="bg-white p-12 md:p-20">
                <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 items-center">
                    <div>
                        <h2 className="text-3xl font-bold mb-4">Conoce a Carolina</h2>
                        <p className="text-lg text-foreground/80 mb-4">
                            ¡Hola! Soy Carolina López, fundadora de TMM. Mi misión es crear un refugio donde puedas desconectarte del estrés diario y reconectarte contigo misma a través de la creatividad y la artesanía.
                        </p>
                        <Button asChild variant="link" className="text-lg text-primary p-0">
                            <Link to="/quienes-somos">Leer más sobre nuestra historia</Link>
                        </Button>
                    </div>
                    <div>
                        {/* Dejamos el placeholder aquí */}
                        <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-gray-500">Imagen de Carolina</span>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}

export default Homepage;