"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

function ProtectedRoute({ children }) {
  const router = useRouter();
  const [autorizado, setAutorizado] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("tmm_token");

    // Si no hay token, redirigir al login de admin
    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      // Decodificar el token para obtener el rol
      const decoded = jwtDecode<{ rol?: string }>(token);

      // Verificar si el usuario es administrador
      if (decoded.rol !== "admin") {
        // Si no es admin, redirigir a la página principal
        router.replace("/");
        return;
      }

      // Si es admin, permitir el acceso
      setAutorizado(true);
    } catch (error) {
      // Si el token es inválido o ha expirado, limpiar y redirigir
      console.error("Token inválido:", error);
      localStorage.removeItem("tmm_token");
      router.replace("/login");
    }
  }, [router]);

  if (!autorizado) return null;

  return children;
}

export default ProtectedRoute;
