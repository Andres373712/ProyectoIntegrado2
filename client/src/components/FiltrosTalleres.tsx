"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * Isla cliente: el catálogo sigue siendo un Server Component, esta barra
 * solo actualiza los query params de la URL y deja que Next vuelva a
 * renderizar la página con los talleres ya filtrados.
 */
export default function FiltrosTalleres() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const tipo = searchParams.get("tipo") ?? "todos";
  const soloConCupos = searchParams.get("disponible") === "true";

  const actualizar = (cambios: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [clave, valor] of Object.entries(cambios)) {
      if (valor === null) params.delete(clave);
      else params.set(clave, valor);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="mb-10 flex flex-wrap items-center justify-center gap-6">
      <div className="flex items-center gap-2">
        <Label htmlFor="filtro-tipo" className="text-sm font-medium text-foreground/80">
          Tipo
        </Label>
        <Select
          value={tipo}
          onValueChange={(valor) => actualizar({ tipo: valor === "todos" ? null : valor })}
        >
          <SelectTrigger id="filtro-tipo" className="w-[200px]">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los talleres</SelectItem>
            <SelectItem value="B2C">Taller Público (B2C)</SelectItem>
            <SelectItem value="B2B">Taller Empresa (B2B)</SelectItem>
            <SelectItem value="KIT">Kit de Insumos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="filtro-disponibles"
          checked={soloConCupos}
          onCheckedChange={(checked) =>
            actualizar({ disponible: checked === true ? "true" : null })
          }
        />
        <Label htmlFor="filtro-disponibles" className="text-sm font-medium text-foreground/80">
          Solo con cupos disponibles
        </Label>
      </div>
    </div>
  );
}
