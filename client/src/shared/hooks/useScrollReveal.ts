"use client";

import { useEffect, useRef, useState } from "react";

const REVEAL_CLASSES = "duration-700 animate-in fade-in slide-in-from-bottom-8";

/**
 * Revela un elemento (fade + slide) la primera vez que entra en pantalla,
 * reutilizando las animaciones de tailwindcss-animate ya usadas en el hero.
 * Respeta prefers-reduced-motion: si está activo, se muestra directo, sin animar.
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);
  // Se calcula una sola vez al montar; typeof window === "undefined" cubre el
  // render inicial en el servidor (no cambia el resultado visual: "visible"
  // sigue siendo false en ese render de todas formas).
  const [permiteMovimiento] = useState(
    () =>
      typeof window === "undefined" ||
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const revealClassName = !visible ? "opacity-0" : permiteMovimiento ? REVEAL_CLASSES : "";

  return { ref, visible, revealClassName };
}
