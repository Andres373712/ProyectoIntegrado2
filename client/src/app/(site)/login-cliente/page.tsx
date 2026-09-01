"use client";

import React, { useState, useEffect, Suspense } from "react";
import { authService } from "@/features/auth/authService";
import { useAuth } from "@/shared/auth/AuthProvider";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";

function LoginClienteInner() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  // --- DETECTAR SI VIENE DEL CORREO DE VERIFICACIÓN ---
  // No es solo un valor derivado del render: handleLogin también limpia
  // estos mismos estados al reintentar, así que se sincronizan con
  // searchParams acá en vez de calcularse directo en el cuerpo del componente.
  useEffect(() => {
    if (searchParams.get("success") === "verificado") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSuccessMessage(
        "¡Tu cuenta ha sido verificada exitosamente! Ya puedes ingresar.",
      );
    } else if (searchParams.get("error") === "token-invalido") {
      setError("El enlace de verificación es inválido o ha expirado.");
    }
  }, [searchParams]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    authService
      .loginCliente(email, password)
      .then((response) => {
        login(response.data.token);
        router.push("/");
      })
      .catch((err) => {
        setError(
          err.response?.data?.message ||
            "Credenciales inválidas. Inténtalo de nuevo.",
        );
      });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-center text-3xl">
            Acceso Clientes
          </CardTitle>
          <CardDescription className="text-center">
            Ingresa para gestionar tus inscripciones.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* --- MENSAJES DE ESTADO --- */}
          {successMessage && (
            <div className="mb-4 flex items-center gap-2 rounded-md border border-green-200 bg-green-100 p-3 text-sm font-bold text-green-700">
              <CheckCircle className="h-5 w-5" />
              {successMessage}
            </div>
          )}
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-md border border-red-200 bg-red-100 p-3 text-sm font-bold text-red-700">
              <XCircle className="h-5 w-5" />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              {/* --- ENLACE DE RECUPERACIÓN AÑADIDO AQUÍ --- */}
              <div className="mt-2 text-right">
                <Link
                  href="/forgot-password"
                  className="text-xs text-muted-foreground transition-colors hover:text-primary"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            </div>

            <Button type="submit" className="h-11 w-full">
              Ingresar
            </Button>
          </form>
          <p className="mt-4 text-center text-sm">
            ¿No tienes cuenta?{" "}
            <Link
              href="/registro-cliente"
              className="font-bold text-primary hover:underline"
            >
              Regístrate aquí
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function LoginCliente() {
  return (
    <Suspense fallback={null}>
      <LoginClienteInner />
    </Suspense>
  );
}

export default LoginCliente;
