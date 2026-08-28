"use client";

import Image from "next/image";
import { Ban, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useCart } from "@/features/carrito/CartContext";
import { useProductosActivos } from "@/features/productos/useProductos";
import { useToast } from "@/shared/hooks/use-toast";
import { getImageUrl } from "@/shared/lib/apiClient";
import { formatCLP } from "@/lib/utils";

/**
 * Grilla de productos activos, para el catálogo completo (/catalogo).
 * Mismo diseño de card que la vitrina de la portada (src/app/(site)/page.tsx)
 * — se extrajo acá para no duplicarlo, ya que antes cada uno vivía inline en
 * su propia página. La portada sigue mostrando solo los primeros 3 (ver
 * <ProductosDestacados> más abajo); acá se muestran todos los activos.
 */
export function GrillaProductos({ productos }: { productos: ReturnType<typeof useProductosActivos>["productos"] }) {
  const { addToCart } = useCart();
  const { toast } = useToast();

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
      {productos.map((prod) => {
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
              <CardTitle className="mb-2 text-xl">{prod.nombre}</CardTitle>
              <CardDescription className="mb-4 line-clamp-2 text-sm">
                {prod.descripcion}
              </CardDescription>
              <div className="flex items-end justify-between">
                <p className="text-2xl font-bold text-primary">
                  ${formatCLP(prod.precio)}
                </p>
                <p className="text-xs font-medium text-muted-foreground">
                  {sinStock ? "Sin stock" : `Disponibles: ${prod.stock}`}
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
                    <ShoppingCart className="h-4 w-4" /> Añadir al Carrito
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}

/** Sección completa para /catalogo: título + grilla + estados de carga/vacío. */
export function CatalogoProductos() {
  const { productos, cargando, error } = useProductosActivos();

  return (
    <section className="mt-20">
      <div className="mb-12 text-center">
        <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#E4007C]">
          Para llevar a casa
        </span>
        <h2 className="mb-4 mt-3 text-3xl font-semibold text-foreground md:text-4xl">
          Nuestros Productos y Kits
        </h2>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          Lleva la experiencia creativa a tu hogar con nuestros kits preparados
          con cariño.
        </p>
      </div>

      {cargando ? (
        <p className="text-center text-muted-foreground">Cargando productos...</p>
      ) : error ? (
        <p className="text-center text-destructive">{error}</p>
      ) : productos.length > 0 ? (
        <GrillaProductos productos={productos} />
      ) : (
        <div className="rounded-lg bg-secondary/30 py-12 text-center">
          <p className="text-lg text-muted-foreground">
            Pronto tendremos productos disponibles.
          </p>
        </div>
      )}
    </section>
  );
}

export default CatalogoProductos;
