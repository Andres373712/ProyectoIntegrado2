"use client";

import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

interface TokenPayload {
  id?: number;
  email?: string;
  rol?: string;
}

export function useAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [rol, setRol] = useState<string | null>(null);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("tmm_token");
    if (stored) {
      setToken(stored);
      try {
        const decoded = jwtDecode<TokenPayload>(stored);
        setRol(decoded.rol ?? null);
      } catch (error) {
        console.error("Error decodificando token:", error);
      }
    }
    setListo(true);
  }, []);

  const logout = () => {
    localStorage.removeItem("tmm_token");
    setToken(null);
    setRol(null);
  };

  return { token, rol, listo, isAdmin: rol === "admin", logout };
}
