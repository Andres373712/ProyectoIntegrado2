import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatCLP(valor: number | string | null | undefined): string {
  const numero = typeof valor === "number" ? valor : parseFloat(String(valor ?? 0));
  return (Number.isNaN(numero) ? 0 : numero).toLocaleString("es-CL");
}

export function formatFechaCL(
  fecha: string | number | Date | null | undefined,
  opciones?: Intl.DateTimeFormatOptions,
): string {
  if (!fecha) return "N/A";
  return new Date(fecha).toLocaleDateString("es-CL", opciones);
}
