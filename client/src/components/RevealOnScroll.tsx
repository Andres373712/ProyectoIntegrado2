"use client";

import type { ReactNode } from "react";
import { useScrollReveal } from "@/shared/hooks/useScrollReveal";
import { cn } from "@/lib/utils";

/**
 * Envoltorio chico para revelar secciones al hacer scroll. Funciona igual
 * dentro de un Client Component (home) o como isla dentro de un Server
 * Component (catálogo).
 */
export default function RevealOnScroll({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { ref, revealClassName } = useScrollReveal<HTMLDivElement>();

  return (
    <div ref={ref} className={cn(revealClassName, className)}>
      {children}
    </div>
  );
}
