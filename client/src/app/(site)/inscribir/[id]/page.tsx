"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Users } from "lucide-react";
import { useTaller } from "@/features/talleres/useTalleres";
import { useInscripcion } from "@/features/inscripcion/useInscripcion";
import { getImageUrl } from "@/shared/lib/apiClient";
import { formatCLP, formatFechaCL } from "@/lib/utils";
import { useToast } from "@/shared/hooks/use-toast";

function Inscripcion() {
  const { id } = useParams();
  const { taller, cargando } = useTaller(id as string);
  const { mensaje, exito, inscribir } = useInscripcion();
  const { toast } = useToast();

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const exitoso = await inscribir({
      tallerId: id as string,
      nombre,
      email,
      telefono,
      intereses: taller.tipo,
    });

    if (exitoso) {
      // NUEVO: Redirigir automáticamente a MercadoPago después de 2 segundos
      setTimeout(() => {
        window.open("https://www.mercadopago.cl/", "_blank");
        toast({
          title: "Modo demostración",
          description:
            `En un sistema real, aquí se abriría tu enlace de pago personalizado de MercadoPago ` +
            `para el taller "${taller.nombre}" por $${formatCLP(taller.precio)}.`,
        });
      }, 2000);
    }
  };

  if (cargando) return <p className="p-10 text-center">Cargando taller...</p>;
  if (!taller) return <p className="p-10 text-center">Taller no encontrado.</p>;

  // CÁLCULO DE CUPOS
  const cuposDisponibles =
    (taller.cupos_totales || 10) - (taller.cupos_inscritos || 0);
  const agotado = cuposDisponibles <= 0;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2">
        <Card className="h-fit border-none shadow-lg">
          <CardHeader>
            {taller.imageUrl ? (
              <div className={`relative mb-4 h-64 w-full ${agotado ? "grayscale" : ""}`}>
                <Image
                  src={getImageUrl(taller.imageUrl)}
                  alt={taller.nombre}
                  fill
                  unoptimized
                  sizes="(max-width: 768px) 100vw, 552px"
                  className="rounded-md object-cover"
                />
              </div>
            ) : (
              <div className="mb-4 flex h-64 w-full items-center justify-center rounded-md bg-muted">
                <span className="text-muted-foreground">Sin imagen</span>
              </div>
            )}
            <CardTitle className="text-3xl">{taller.nombre}</CardTitle>
            <CardDescription className="text-lg text-foreground/80">
              {taller.descripcion}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-2xl font-bold text-primary">
              ${formatCLP(taller.precio)}
            </div>
            <div className="text-md flex items-center text-foreground/90">
              <strong>Fecha:</strong>&nbsp;{" "}
              {formatFechaCL(taller.fecha, {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
            {taller.lugar && (
              <div className="text-md flex items-center text-foreground/90">
                <MapPin className="mr-2 h-4 w-4 text-primary" />
                En: {taller.lugar}
              </div>
            )}

            {/* --- AVISO DE CUPOS (MODIFICADO) --- */}
            <div
              className={`flex items-center rounded-lg border p-3 ${agotado ? "border-red-200 bg-red-50 text-red-700" : "border-green-200 bg-green-50 text-green-700"}`}
            >
              <Users className="mr-2 h-5 w-5" />
              {agotado ? (
                <span className="font-bold">¡Lo sentimos! Cupos Agotados.</span>
              ) : (
                <span className="font-bold">
                  ¡Aún quedan cupos disponibles!
                </span> // <-- CAMBIO AQUÍ
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="h-fit border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl">
              {agotado ? "Inscripción Cerrada" : "Inscríbete Aquí"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {agotado ? (
              <div className="p-8 text-center">
                <p className="mb-6 text-lg text-gray-600">
                  Lo sentimos, este taller ya alcanzó su capacidad máxima.
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/catalogo">Ver otros talleres disponibles</Link>
                </Button>
              </div>
            ) : exito ? (
              <div className="p-8 text-center">
                <h2 className="mb-4 text-2xl font-bold text-green-600">
                  ¡Inscripción Exitosa!
                </h2>
                <p className="mb-6">
                  Tu cupo ha sido reservado. Recibirás un correo de confirmación
                  con los detalles del taller.
                </p>
                <Button asChild variant="secondary">
                  <Link href="/catalogo">Volver al Catálogo</Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre Completo</Label>
                  <Input
                    id="nombre"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono (WhatsApp)</Label>
                  <Input
                    id="telefono"
                    type="tel"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                  />
                </div>
                {mensaje && !exito && (
                  <p className="text-center text-red-500">{mensaje}</p>
                )}
                <Button type="submit" className="h-12 w-full text-lg">
                  Proceder al pago
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
export default Inscripcion;
