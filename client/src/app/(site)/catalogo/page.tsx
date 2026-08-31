import React from "react";
import type { Metadata } from "next";
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
import { talleresService } from "@/features/talleres/talleresService";
import { getImageUrl } from "@/shared/lib/apiClient";
import { formatCLP, formatFechaCL } from "@/lib/utils";
import FiltrosTalleres from "@/components/FiltrosTalleres";
import RevealOnScroll from "@/components/RevealOnScroll";
import CatalogoProductos from "@/components/CatalogoProductos";

export const metadata: Metadata = {
  title: "Catálogo de Talleres",
  description:
    "Explora todos los talleres de bienestar y artesanía disponibles: resina, encuadernación y más, presenciales y online. Revisa cupos, fechas y precios e inscríbete.",
};

// Server Component: sin interactividad propia (solo lectura + <Link>), se
// obtienen los talleres en el servidor en vez de con un hook + loading state.
// El filtrado (tipo/disponibilidad) es la única parte interactiva, y vive en
// la isla cliente <FiltrosTalleres />, que solo mueve los searchParams.
async function Catalogo({ searchParams }: PageProps<"/catalogo">) {
  const params = await searchParams;
  const tipo = typeof params.tipo === "string" ? params.tipo : undefined;
  const disponible = params.disponible === "true" ? true : undefined;
  const hayFiltrosActivos = Boolean(tipo || disponible);

  const { data: talleres } = await talleresService.getActivos({ tipo, disponible });

  return (
    <div className="min-h-screen bg-background p-8 text-foreground md:p-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <span className="text-xs font-bold uppercase tracking-[0.15em] text-brand">
            Catálogo
          </span>
          <h1 className="mb-4 mt-3 text-4xl font-semibold text-foreground md:text-5xl">
            Todos Nuestros Talleres
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-foreground/80 md:text-xl">
            Encuentra la próxima experiencia de bienestar para ti.
          </p>
        </div>

        <FiltrosTalleres />

        {talleres.length > 0 && (
          <RevealOnScroll className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {talleres.map((taller) => {
              // CÁLCULO DE CUPOS
              const cuposDisponibles =
                (taller.cupos_totales || 10) - (taller.cupos_inscritos || 0);
              const agotado = cuposDisponibles <= 0;

              return (
                <Card
                  key={taller.id}
                  className="flex flex-col justify-between overflow-hidden shadow-lg transition-shadow duration-300 hover:shadow-xl"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-2xl">
                        {taller.nombre}
                      </CardTitle>
                      {/* ETIQUETA DE CUPOS (MODIFICADA) */}
                      {!agotado ? (
                        <span className="whitespace-nowrap rounded-full border border-success/20 bg-success/10 px-2 py-1 text-xs font-bold text-success">
                          ¡Cupos disponibles! {/* <-- CAMBIO AQUÍ */}
                        </span>
                      ) : (
                        <span className="whitespace-nowrap rounded-full border border-destructive/20 bg-destructive/10 px-2 py-1 text-xs font-bold text-destructive">
                          Agotado
                        </span>
                      )}
                    </div>
                    <CardDescription>
                      {taller.fecha
                        ? formatFechaCL(taller.fecha, {
                            month: "long",
                            day: "numeric",
                          })
                        : "Próximamente"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="relative mb-4 h-48 w-full">
                      <Image
                        src={getImageUrl(taller.imageUrl)}
                        alt={taller.nombre}
                        fill
                        unoptimized
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 384px"
                        className={`rounded-md object-cover ${agotado ? "opacity-70 grayscale" : ""}`}
                      />
                      {agotado && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="rounded bg-black/70 px-4 py-2 text-lg font-bold text-white">
                            AGOTADO
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="mt-4 text-2xl font-bold">
                      $
                      {taller.precio ? formatCLP(taller.precio) : "N/A"}
                    </p>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-2">
                    {agotado ? (
                      <Button
                        disabled
                        className="w-full cursor-not-allowed bg-muted text-muted-foreground"
                      >
                        Sin Cupos
                      </Button>
                    ) : (
                      <Button
                        asChild
                        className="w-full bg-brand text-brand-foreground hover:bg-brand/90"
                      >
                        <Link href={`/inscribir/${taller.id}`}>
                          Inscribirme Ahora
                        </Link>
                      </Button>
                    )}
                    <Button asChild variant="secondary" className="w-full">
                      <Link href={`/inscribir/${taller.id}`}>Ver Detalles</Link>
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </RevealOnScroll>
        )}

        {talleres.length === 0 && (
          <p className="text-center text-lg text-foreground/70">
            {hayFiltrosActivos
              ? "No hay talleres que coincidan con estos filtros."
              : "No hay talleres activos en este momento."}
          </p>
        )}

        {/* El botón "Ver Todo el Catálogo" de la portada trae a la gente
            acá esperando ver también los productos, no solo talleres — antes
            esta página solo mostraba talleres y el catálogo de productos no
            existía en ningún lugar público más allá de los 3 destacados en
            la portada. */}
        <CatalogoProductos />
      </div>
    </div>
  );
}

export default Catalogo;
