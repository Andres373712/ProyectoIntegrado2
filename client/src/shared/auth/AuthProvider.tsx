"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { jwtDecode } from "jwt-decode";

interface TokenPayload {
  id?: number;
  email?: string;
  rol?: string;
  nombre?: string;
}

interface AuthContextValue {
  token: string | null;
  rol: string | null;
  email: string | null;
  listo: boolean;
  isAdmin: boolean;
  isCliente: boolean;
  hasRole: (...roles: string[]) => boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function decodificarPayload(token: string): TokenPayload {
  try {
    return jwtDecode<TokenPayload>(token);
  } catch (error) {
    console.error("Error decodificando token:", error);
    return {};
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [rol, setRol] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    // No se puede leer localStorage en un initializer perezoso de useState:
    // este componente se renderiza primero en el servidor (sin storage) y el
    // primer render del cliente debe coincidir con ese HTML para no romper
    // la hidratación. Por eso la sesión se sincroniza acá, después del mount.
    const stored = localStorage.getItem("tmm_token");
    if (stored) {
      const payload = decodificarPayload(stored);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setToken(stored);
      setRol(payload.rol ?? null);
      setEmail(payload.email ?? null);
    }
    setListo(true);
  }, []);

  const login = useCallback((nuevoToken: string) => {
    localStorage.setItem("tmm_token", nuevoToken);
    const payload = decodificarPayload(nuevoToken);
    setToken(nuevoToken);
    setRol(payload.rol ?? null);
    setEmail(payload.email ?? null);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("tmm_token");
    setToken(null);
    setRol(null);
    setEmail(null);
  }, []);

  const hasRole = useCallback((...roles: string[]) => rol !== null && roles.includes(rol), [rol]);

  return (
    <AuthContext.Provider
      value={{
        token,
        rol,
        email,
        listo,
        isAdmin: rol === "admin",
        isCliente: rol === "cliente",
        hasRole,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
