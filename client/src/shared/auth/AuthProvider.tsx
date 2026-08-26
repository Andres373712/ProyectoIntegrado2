"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { jwtDecode } from "jwt-decode";

interface TokenPayload {
  id?: number;
  email?: string;
  rol?: string;
}

interface AuthContextValue {
  token: string | null;
  rol: string | null;
  listo: boolean;
  isAdmin: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function decodificarRol(token: string): string | null {
  try {
    return jwtDecode<TokenPayload>(token).rol ?? null;
  } catch (error) {
    console.error("Error decodificando token:", error);
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [rol, setRol] = useState<string | null>(null);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("tmm_token");
    if (stored) {
      setToken(stored);
      setRol(decodificarRol(stored));
    }
    setListo(true);
  }, []);

  const login = useCallback((nuevoToken: string) => {
    localStorage.setItem("tmm_token", nuevoToken);
    setToken(nuevoToken);
    setRol(decodificarRol(nuevoToken));
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("tmm_token");
    setToken(null);
    setRol(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, rol, listo, isAdmin: rol === "admin", login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
