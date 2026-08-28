"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/shared/auth/AuthProvider";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Roles permitidos para ver la página. Por defecto, solo "admin" (comportamiento histórico). */
  allowedRoles?: string[];
  /** A dónde redirigir cuando no hay sesión iniciada. */
  redirectTo?: string;
}

function ProtectedRoute({
  children,
  allowedRoles = ["admin"],
  redirectTo = "/login",
}: ProtectedRouteProps) {
  const router = useRouter();
  const { token, rol, listo } = useAuth();
  const autorizado = rol !== null && allowedRoles.includes(rol);

  useEffect(() => {
    if (!listo) return;
    if (!token) {
      router.replace(redirectTo);
      return;
    }
    if (!autorizado) {
      router.replace("/");
    }
  }, [listo, token, autorizado, redirectTo, router]);

  if (!listo || !token || !autorizado) return null;

  return children;
}

export default ProtectedRoute;
