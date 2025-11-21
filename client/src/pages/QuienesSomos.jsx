import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Heart, Users, Star } from 'lucide-react';

// Importamos la foto de la fundadora
// Asegúrate de que la imagen 'carolina.jpg' exista en 'client/src/assets/'
import FotoCarolina from '../assets/carolina.jpg'; 

function QuienesSomos() {
    return (
        <div className="bg-background min-h-screen">
            {/* --- Encabezado Hero --- */}
            <div className="bg-primary/10 py-16 md:py-24">
                <div className="container mx-auto px-6 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold text-primary mb-6">Nuestra Historia</h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Conoce el corazón detrás de TMM Bienestar y Conexión.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-6 py-12 max-w-5xl">
                {/* --- Bloque Principal: Historia --- */}
                <div className="grid md:grid-cols-2 gap-12 items-start mb-20">
                    {/* Foto */}
                    <div className="relative">
                        <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl border-8 border-white">
                            {/* Fallback por si no existe la foto */}
                            <img 
                                src={FotoCarolina} 
                                onError={(e) => {
                                    e.target.style.display = 'none'; 
                                    e.target.parentNode.style.backgroundColor = '#e5e7eb'; // Fondo gris
                                    // Opcional: mostrar texto alternativo si falla la imagen
                                }}
                                alt="Carolina López Fundadora" 
                                className="w-full h-full object-cover" 
                            />
                        </div>
                        {/* Decoración */}
                        <div className="absolute -bottom-6 -right-6 bg-accent p-6 rounded-xl shadow-lg hidden md:block">
                            <p className="font-serif text-2xl text-primary font-bold">"Crear es sanar"</p>
                        </div>
                    </div>

                    {/* Texto Biografía */}
                    <div className="space-y-6 text-lg text-foreground/80 leading-relaxed">
                        <h2 className="text-3xl font-bold text-foreground">Hola, soy Carolina López</h2>
                        <p>
                            Hace algunos años, me encontraba inmersa en una rutina estresante que dejaba poco espacio para mí misma. Sentía que la vida pasaba rápido y que había perdido la conexión con lo que realmente me hacía feliz.
                        </p>
                        <p>
                            Fue entonces cuando redescubrí el arte manual. Empecé con pequeños proyectos de encuadernación y resina, y me di cuenta de algo poderoso: <strong>cuando mis manos estaban ocupadas creando, mi mente encontraba calma.</strong>
                        </p>
                        <p>
                            Así nació <strong>TMM Bienestar y Conexión</strong>. No quería solo vender productos; quería compartir esa sensación de paz y logro. Quería crear un espacio seguro donde otras mujeres pudieran desconectarse de las exigencias diarias y reconectarse con su creatividad interior.
                        </p>
                        <p>
                            Hoy, cada taller que imparto y cada kit que preparo lleva esa intención: ofrecerte un momento de pausa, disfrute y bienestar.
                        </p>
                    </div>
                </div>

                {/* --- Valores --- */}
                <div className="grid md:grid-cols-3 gap-8 mb-20">
                    <Card className="border-none shadow-lg bg-secondary/20">
                        <CardContent className="p-6 text-center space-y-4">
                            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto text-primary">
                                <Heart size={24} />
                            </div>
                            <h3 className="font-bold text-xl">Bienestar Emocional</h3>
                            <p className="text-muted-foreground">La artesanía como herramienta terapéutica para reducir el estrés.</p>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-lg bg-secondary/20">
                        <CardContent className="p-6 text-center space-y-4">
                            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto text-primary">
                                <Users size={24} />
                            </div>
                            <h3 className="font-bold text-xl">Comunidad</h3>
                            <p className="text-muted-foreground">Un espacio para compartir, aprender juntas y crear lazos.</p>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-lg bg-secondary/20">
                        <CardContent className="p-6 text-center space-y-4">
                            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto text-primary">
                                <Star size={24} />
                            </div>
                            <h3 className="font-bold text-xl">Calidad Artesanal</h3>
                            <p className="text-muted-foreground">Materiales seleccionados y técnicas cuidadas en cada detalle.</p>
                        </CardContent>
                    </Card>
                </div>

                {/* --- Llamado a la Acción --- */}
                <div className="text-center">
                    <h3 className="text-2xl font-bold mb-6">¿Lista para crear tu propio momento?</h3>
                    <div className="flex justify-center gap-4">
                        <Button asChild size="lg" className="text-lg px-8">
                            <Link to="/catalogo">Ver Talleres Disponibles</Link>
                        </Button>
                        <Button asChild variant="outline" size="lg" className="text-lg px-8">
                            <Link to="/">
                                <ArrowLeft className="mr-2 h-4 w-4" /> Volver al Inicio
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default QuienesSomos;