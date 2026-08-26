"use client";

import React, { useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

// --- IMPORTACIONES DE CARRUSEL E ICONOS ---
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { ShoppingCart, Ban } from "lucide-react";
import { useCart } from "@/features/carrito/CartContext";
import { useProductosActivos } from "@/features/productos/useProductos";
import { useTestimoniosActivos } from "@/features/testimonios/useTestimonios";
import { getImageUrl } from "@/shared/lib/apiClient";
import { formatCLP } from "@/lib/utils";

import { useToast } from "@/shared/hooks/use-toast";
import { useSearchParams } from "next/navigation";
import RevealOnScroll from "@/components/RevealOnScroll";
import StarRating from "@/components/StarRating";

// --- IMPORTACIONES DE ASSETS (AJUSTAR EXTENSIONES Y NOMBRES) ---
import HeroBackground from "@/assets/nuevo-fondo.jpg";
import CarouselImg1 from "@/assets/carousel-1.jpeg";
import CarouselImg2 from "@/assets/carousel-2.jpeg";
import CarouselImg3 from "@/assets/carousel-3.jpeg";
import FotoCarolina from "@/assets/carolina.jpg";
// --- FIN ASSETS ---

// useSearchParams exige un límite Suspense para poder prerenderizarse en Next.js.
function VerificationToastEffect() {
  const { toast } = useToast();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("verified") === "true") {
      toast({
        title: "Cuenta Verificada",
        description:
          "¡Tu cuenta ha sido verificada con éxito! Ya puedes iniciar sesión.",
        variant: "success",
      });
    }
    if (searchParams.get("error") === "invalid") {
      toast({
        title: "Error de Verificación",
        description: "El enlace de verificación no es válido o ha expirado.",
        variant: "destructive",
      });
    }
  }, [searchParams, toast]);

  return null;
}

function Homepage() {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { productos: todosLosProductos, cargando } = useProductosActivos();
  // Tomamos solo los 3 primeros productos para mostrar en la vitrina
  const productos = todosLosProductos.slice(0, 3);
  const { testimonios } = useTestimoniosActivos();

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
    cssEase: "linear",
    arrows: false,
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Suspense fallback={null}>
        <VerificationToastEffect />
      </Suspense>
      {/* --- 1. SECCIÓN HERO (Dividida con Fondo Estático) --- */}
      <div
        className="relative flex min-h-[600px] w-full items-center overflow-hidden p-8 md:p-12"
        style={{
          // Fondo estático con capa oscura suave (0.4) para que el texto blanco se lea bien
          backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${HeroBackground.src})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Contenedor Principal (Centrado y con ancho máximo) */}
        <div className="container relative z-10 mx-auto h-full px-6 py-12 md:px-12">
          {/* Grid de 2 Columnas */}
          <div className="grid h-full grid-cols-1 items-center gap-12 lg:grid-cols-2">
            {/* Columna 1: Texto (Izquierda) */}
            <div className="space-y-6 text-center text-white duration-700 animate-in fade-in slide-in-from-left lg:text-left">
              <span className="inline-block text-xs font-bold uppercase tracking-[0.15em] text-[#ff9dc7] drop-shadow-md md:text-sm">
                Talleres de bienestar &amp; artesanía
              </span>
              <h1 className="font-serif text-4xl font-semibold leading-tight drop-shadow-lg md:text-6xl">
                TMM Bienestar y Conexión
              </h1>
              <p className="mx-auto max-w-lg text-lg text-white/90 drop-shadow-md md:text-xl lg:mx-0">
                Un espacio de bienestar para ti. Descubre el poder sanador de la
                artesanía y conecta contigo misma.
              </p>
              <div className="pt-4">
                <Button
                  asChild
                  className="rounded-full border-none bg-[#E4007C] px-8 py-6 text-lg text-white shadow-lg transition-transform hover:scale-105 hover:bg-[#c8006c]"
                >
                  <Link href="/catalogo">Explorar Talleres</Link>
                </Button>
              </div>
            </div>

            {/* Columna 2: Carrusel (Derecha) */}
            <div className="mx-auto w-full max-w-md overflow-hidden rounded-xl border-4 border-white/20 shadow-2xl delay-200 duration-700 animate-in fade-in slide-in-from-right lg:max-w-full">
              <Slider {...sliderSettings}>
                <div className="relative h-64 w-full md:h-96">
                  <Image
                    src={CarouselImg1}
                    alt="Taller 1"
                    fill
                    sizes="(max-width: 1024px) 100vw, 448px"
                    className="object-cover"
                  />
                </div>
                <div className="relative h-64 w-full md:h-96">
                  <Image
                    src={CarouselImg2}
                    alt="Taller 2"
                    fill
                    sizes="(max-width: 1024px) 100vw, 448px"
                    className="object-cover"
                  />
                </div>
                <div className="relative h-64 w-full md:h-96">
                  <Image
                    src={CarouselImg3}
                    alt="Taller 3"
                    fill
                    sizes="(max-width: 1024px) 100vw, 448px"
                    className="object-cover"
                  />
                </div>
              </Slider>
            </div>
          </div>
        </div>

        {/* Degradado inferior para suavizar la transición al fondo blanco */}
        <div className="pointer-events-none absolute bottom-0 left-0 h-24 w-full bg-gradient-to-t from-background to-transparent"></div>
      </div>

      {/* --- 2. SECCIÓN PRODUCTOS DISPONIBLES --- */}
      <RevealOnScroll className="mx-auto max-w-6xl p-8 md:p-20">
        <div className="mb-12 text-center">
          <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#E4007C]">
            Para llevar a casa
          </span>
          <h2 className="mb-4 mt-3 text-3xl font-semibold text-foreground md:text-4xl">
            Nuestros Productos y Kits
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Lleva la experiencia creativa a tu hogar con nuestros kits
            preparados con cariño.
          </p>
        </div>

        {cargando ? (
          <p className="text-center text-muted-foreground">
            Cargando productos...
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {productos.length > 0 ? (
              productos.map((prod) => {
                const sinStock = prod.stock <= 0;

                return (
                  <Card
                    key={prod.id}
                    className="flex flex-col justify-between overflow-hidden border-none shadow-md transition-shadow duration-300 hover:shadow-xl"
                  >
                    <CardHeader className="p-0">
                      <div className="relative h-56 w-full">
                        <Image
                          src={getImageUrl(prod.imageUrl)}
                          alt={prod.nombre}
                          fill
                          unoptimized
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 384px"
                          className={`object-cover transition-transform duration-500 hover:scale-105 ${sinStock ? "opacity-60 grayscale" : ""}`}
                        />
                        {sinStock && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                            <span className="-rotate-12 transform rounded bg-destructive px-4 py-2 text-lg font-bold text-white shadow-lg">
                              AGOTADO
                            </span>
                          </div>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="p-6">
                      <CardTitle className="mb-2 text-xl">
                        {prod.nombre}
                      </CardTitle>
                      <CardDescription className="mb-4 line-clamp-2 text-sm">
                        {prod.descripcion}
                      </CardDescription>
                      <div className="flex items-end justify-between">
                        <p className="text-2xl font-bold text-primary">
                          ${formatCLP(prod.precio)}
                        </p>
                        <p className="text-xs font-medium text-muted-foreground">
                          {sinStock
                            ? "Sin stock"
                            : `Disponibles: ${prod.stock}`}
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
                            tipo: "producto",
                          });
                          toast({ description: `¡${prod.nombre} añadido al carrito!` });
                        }}
                      >
                        {sinStock ? (
                          <>
                            <Ban className="h-4 w-4" /> No Disponible
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="h-4 w-4" /> Añadir al
                            Carrito
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })
            ) : (
              <div className="col-span-3 rounded-lg bg-secondary/30 py-12 text-center">
                <p className="text-lg text-muted-foreground">
                  Pronto tendremos productos disponibles.
                </p>
              </div>
            )}
          </div>
        )}

        <div className="mt-12 text-center">
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-primary text-primary transition-colors hover:bg-primary hover:text-white"
          >
            <Link href="/catalogo">Ver Todo el Catálogo</Link>
          </Button>
        </div>
      </RevealOnScroll>

      {/* --- 2.5 SECCIÓN COMENTARIOS Y RECOMENDACIONES --- */}
      {testimonios.length > 0 && (
        <RevealOnScroll className="bg-white p-8 md:p-20">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#E4007C]">
                Lo que dicen nuestras clientas
              </span>
              <h2 className="mb-4 mt-3 text-3xl font-semibold text-foreground md:text-4xl">
                Comentarios y Recomendaciones
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {testimonios.slice(0, 3).map((t) => (
                <div
                  key={t.id}
                  className="flex flex-col rounded-xl border bg-card p-6 shadow-sm transition-shadow duration-300 hover:shadow-md"
                >
                  <StarRating value={t.calificacion} readOnly size={18} />
                  <p className="mt-4 flex-1 text-foreground/90">
                    &ldquo;{t.comentario}&rdquo;
                  </p>
                  <div className="mt-6">
                    <p className="font-serif font-semibold">{t.nombre}</p>
                    {t.curso && (
                      <p className="text-sm text-muted-foreground">{t.curso}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </RevealOnScroll>
      )}

      {/* --- 3. SECCIÓN QUIENES SOMOS --- */}
      <RevealOnScroll className="bg-secondary/30 p-12 md:p-24">
        <div className="mx-auto grid max-w-5xl items-center gap-12 md:grid-cols-2">
          <div className="order-2 md:order-1">
            <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#E4007C]">
              Nuestra historia
            </span>
            <h2 className="mb-6 mt-3 text-3xl font-semibold text-foreground">
              Conoce a Carolina
            </h2>
            <p className="mb-6 text-lg leading-relaxed text-muted-foreground">
              ¡Hola! Soy Carolina López, fundadora de TMM. Mi misión es crear un
              refugio donde puedas desconectarte del estrés diario y
              reconectarte contigo misma a través de la creatividad y la
              artesanía.
            </p>
            <Button
              asChild
              variant="link"
              className="p-0 text-lg font-bold text-[#E4007C] hover:underline"
            >
              <Link href="/quienes-somos">Leer nuestra historia completa →</Link>
            </Button>
          </div>
          <div className="order-1 flex justify-center md:order-2">
            <div className="relative h-64 w-64 md:h-80 md:w-80">
              {/* Círculo decorativo detrás */}
              <div className="absolute inset-0 translate-x-4 translate-y-4 transform rounded-full bg-[#E4007C]/10"></div>
              {/* Imagen de Carolina */}
              <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full border-4 border-white bg-white shadow-xl">
                <Image
                  src={FotoCarolina}
                  alt="Carolina López"
                  fill
                  sizes="320px"
                  className="object-cover"
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    (target.parentNode as HTMLElement).style.backgroundColor = "#e5e7eb";
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </RevealOnScroll>
    </div>
  );
}

export default Homepage;
