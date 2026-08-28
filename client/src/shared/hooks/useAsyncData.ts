"use client";

import { useCallback, useEffect, useRef, useState, type DependencyList } from "react";

type ErrorMessageResolver = string | ((error: unknown) => string);

const MENSAJE_ERROR_GENERICO = "No pudimos cargar los datos. Intenta más tarde.";

export interface UseAsyncDataOptions<T> {
  /** Valor inicial de `data` mientras se resuelve el primer fetch. */
  initialData?: T;
  /** Mensaje a mostrar al usuario si `fetchFn` rechaza (string fijo o función que recibe el error). */
  errorMessage?: ErrorMessageResolver;
  /** Si es `false`, no dispara el fetch (útil cuando falta un dato requerido, ej. un id). */
  enabled?: boolean;
}

export interface UseAsyncDataResult<T> {
  data: T | undefined;
  loading: boolean;
  error: string | null;
  /** Vuelve a ejecutar `fetchFn` manualmente (ej. tras crear/editar/eliminar un registro). */
  refetch: () => void;
  /** Permite actualizar `data` de forma optimista sin esperar un refetch. */
  setData: React.Dispatch<React.SetStateAction<T | undefined>>;
}

/**
 * Encapsula el patrón then/catch/finally + useState(loading/error) que se
 * repetía en varios hooks de datos del proyecto (productos, testimonios,
 * talleres, mensajes de contacto): dispara `fetchFn` dentro de un efecto,
 * expone `{data, loading, error}` y permite refrescar manualmente con
 * `refetch` — por ejemplo después de un alta, edición o borrado desde el
 * panel de admin.
 *
 * `deps` funciona igual que en `useEffect`/`useCallback`: son las variables
 * externas de las que depende `fetchFn` (por ejemplo un id de ruta) y que
 * deben disparar un nuevo fetch al cambiar.
 */
export function useAsyncData<T>(
  fetchFn: () => Promise<T>,
  deps: DependencyList = [],
  options: UseAsyncDataOptions<T> = {},
): UseAsyncDataResult<T> {
  const { initialData, errorMessage, enabled = true } = options;

  const [data, setData] = useState<T | undefined>(initialData);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  // `fetchFn` casi siempre es una arrow function nueva en cada render, así
  // que no puede ir directo en las deps de useCallback (dispararía un fetch
  // infinito). La guardamos en un ref y quien controla cuándo se vuelve a
  // pedir son las `deps` explícitas que pasa quien llama al hook.
  const fetchFnRef = useRef(fetchFn);
  fetchFnRef.current = fetchFn;

  // Evita condiciones de carrera: si `deps` cambia y se dispara un fetch
  // nuevo antes de que termine el anterior, el resultado del fetch viejo
  // se ignora al llegar.
  const fetchIdRef = useRef(0);

  const ejecutar = useCallback(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    const id = ++fetchIdRef.current;
    setLoading(true);
    setError(null);

    fetchFnRef
      .current()
      .then((resultado) => {
        if (fetchIdRef.current === id) setData(resultado);
      })
      .catch((err: unknown) => {
        if (fetchIdRef.current !== id) return;
        console.error(err);
        setError(
          typeof errorMessage === "function"
            ? errorMessage(err)
            : (errorMessage ?? MENSAJE_ERROR_GENERICO),
        );
      })
      .finally(() => {
        if (fetchIdRef.current === id) setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, errorMessage, ...deps]);

  useEffect(() => {
    ejecutar();
  }, [ejecutar]);

  return { data, loading, error, refetch: ejecutar, setData };
}
