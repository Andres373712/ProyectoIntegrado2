"use client";

import React, { useState } from "react";
import { authService } from "@/features/auth/authService";
import { useAuth } from "@/shared/auth/AuthProvider";
import { useRouter } from "next/navigation";
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
import { UserCog } from "lucide-react"; // Icono de Admin

function Login() {
  // Usamos el email por defecto para que sea más rápido
  const [email, setEmail] = useState("carolina@tmm.cl");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    authService
      .loginAdmin(email, password)
      .then((response) => {
        // Si el login es exitoso, guardamos el token
        login(response.data.token);
        // Redirigimos al dashboard de administración
        router.push("/admin");
      })
      .catch((err) => {
        console.error("Error de login:", err);
        setError(
          err.response?.data?.message ||
            "Error de conexión o credenciales incorrectas.",
        );
      });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-xl duration-300 animate-in zoom-in">
        <CardHeader>
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-primary/10 p-3">
              <UserCog className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-center text-3xl">
            Acceso Administrador
          </CardTitle>
          <CardDescription className="text-center">
            Ingresa con tus credenciales de gestión.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded border bg-gray-50 p-3"
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
                className="w-full rounded border p-3"
                required
              />
            </div>
            {error && (
              <p className="text-center text-sm font-medium text-destructive">
                {error}
              </p>
            )}
            <Button type="submit" className="h-11 w-full">
              Ingresar
            </Button>

            {/* --- ENLACE DE RECUPERACIÓN AÑADIDO --- */}
            <div className="pt-1 text-right">
              <Link
                href="/forgot-password"
                className="text-xs text-muted-foreground transition-colors hover:text-primary"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default Login;
