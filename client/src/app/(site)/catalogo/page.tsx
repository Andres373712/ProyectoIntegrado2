import React from "react";
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

// Server Component: sin interactividad propia (solo lectura + <Link>), se
// obtienen los talleres en el servidor en vez de con un hook + loading state.
async function Catalogo() {
  const { data: talleres } = await talleresService.getActivos();

  return (
    <div className="min-h-screen bg-background p-8 text-foreground md:p-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-primary md:text-5xl">
            Todos Nuestros Talleres
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-foreground/80 md:text-xl">
            Encuentra la próxima experiencia de bienestar para ti.
          </p>
        </div>

        {talleres.length > 0 && (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
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
                        <span className="whitespace-nowrap rounded-full border border-green-200 bg-green-100 px-2 py-1 text-xs font-bold text-green-700">
                          ¡Cupos disponibles! {/* <-- CAMBIO AQUÍ */}
                        </span>
                      ) : (
                        <span className="whitespace-nowrap rounded-full border border-red-200 bg-red-100 px-2 py-1 text-xs font-bold text-red-700">
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
                        className="w-full cursor-not-allowed bg-gray-300 text-gray-500"
                      >
                        Sin Cupos
                      </Button>
                    ) : (
                      <Button asChild className="w-full">
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
          </div>
        )}

        {talleres.length === 0 && (
          <p className="text-center text-lg text-foreground/70">
            No hay talleres activos en este momento.
          </p>
        )}
      </div>
    </div>
  );
}

export default Catalogo;
