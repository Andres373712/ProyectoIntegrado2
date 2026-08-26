"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Heart, Users, Star } from "lucide-react";

// Importamos la foto de la fundadora
import FotoCarolina from "@/assets/carolina.jpg";

function QuienesSomos() {
  return (
    <div className="min-h-screen bg-background">
      {/* --- Encabezado Hero --- */}
      <div className="bg-white py-16 md:py-24">
        <div className="container mx-auto px-6 text-center">
          <h1 className="mb-6 text-4xl font-bold text-primary md:text-6xl">
            Nuestra Historia
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
            Conoce el corazón detrás de TMM Bienestar y Conexión.
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-5xl px-6 py-12">
        {/* --- Bloque Principal: Historia --- */}
        <div className="mb-20 grid items-start gap-12 md:grid-cols-2">
          {/* Foto */}
          <div className="relative">
            <div className="aspect-square overflow-hidden rounded-2xl border-8 border-white shadow-2xl">
              {/* Fallback por si no existe la foto */}
              <img
                src={FotoCarolina.src}
                onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  (target.parentNode as HTMLElement).style.backgroundColor = "#e5e7eb"; // Fondo gris
                  // Opcional: mostrar texto alternativo si falla la imagen
                }}
                alt="Carolina López Fundadora"
                className="h-full w-full object-cover"
              />
            </div>
            {/* Decoración */}
            <div className="absolute -bottom-6 -right-6 hidden rounded-xl bg-accent p-6 shadow-lg md:block">
              <p className="font-serif text-2xl font-bold text-primary">
                &quot;Crear es sanar&quot;
              </p>
            </div>
          </div>

          {/* Texto Biografía */}
          <div className="space-y-6 text-lg leading-relaxed text-foreground/80">
            <h2 className="text-3xl font-bold text-foreground">
              Hola, soy Carolina López
            </h2>
            <p>
              Hace algunos años, me encontraba inmersa en una rutina estresante
              que dejaba poco espacio para mí misma. Sentía que la vida pasaba
              rápido y que había perdido la conexión con lo que realmente me
              hacía feliz.
            </p>
            <p>
              Fue entonces cuando redescubrí el arte manual. Empecé con pequeños
              proyectos de encuadernación y resina, y me di cuenta de algo
              poderoso:{" "}
              <strong>
                cuando mis manos estaban ocupadas creando, mi mente encontraba
                calma.
              </strong>
            </p>
            <p>
              Así nació <strong>TMM Bienestar y Conexión</strong>. No quería
              solo vender productos; quería compartir esa sensación de paz y
              logro. Quería crear un espacio seguro donde otras mujeres pudieran
              desconectarse de las exigencias diarias y reconectarse con su
              creatividad interior.
            </p>
            <p>
              Hoy, cada taller que imparto y cada kit que preparo lleva esa
              intención: ofrecerte un momento de pausa, disfrute y bienestar.
            </p>
          </div>
        </div>

        {/* --- Valores --- */}
        <div className="mb-20 grid gap-8 md:grid-cols-3">
          <Card className="border-none bg-secondary/20 shadow-lg">
            <CardContent className="space-y-4 p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary">
                <Heart size={24} />
              </div>
              <h3 className="text-xl font-bold">Bienestar Emocional</h3>
              <p className="text-muted-foreground">
                La artesanía como herramienta terapéutica para reducir el
                estrés.
              </p>
            </CardContent>
          </Card>
          <Card className="border-none bg-secondary/20 shadow-lg">
            <CardContent className="space-y-4 p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary">
                <Users size={24} />
              </div>
              <h3 className="text-xl font-bold">Comunidad</h3>
              <p className="text-muted-foreground">
                Un espacio para compartir, aprender juntas y crear lazos.
              </p>
            </CardContent>
          </Card>
          <Card className="border-none bg-secondary/20 shadow-lg">
            <CardContent className="space-y-4 p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary">
                <Star size={24} />
              </div>
              <h3 className="text-xl font-bold">Calidad Artesanal</h3>
              <p className="text-muted-foreground">
                Materiales seleccionados y técnicas cuidadas en cada detalle.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* --- Llamado a la Acción --- */}
        <div className="text-center">
          <h3 className="mb-6 text-2xl font-bold">
            ¿Lista para crear tu propio momento?
          </h3>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg" className="px-8 text-lg">
              <Link href="/catalogo">Ver Talleres Disponibles</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="px-8 text-lg"
            >
              <Link href="/">
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
