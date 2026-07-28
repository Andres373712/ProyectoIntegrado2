import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link, useLocation } from "react-router-dom";
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

function LoginCliente() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // --- DETECTAR SI VIENE DEL CORREO DE VERIFICACIÓN ---
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("success") === "verificado") {
      setSuccessMessage(
        "¡Tu cuenta ha sido verificada exitosamente! Ya puedes ingresar.",
      );
    } else if (params.get("error") === "token-invalido") {
      setError("El enlace de verificación es inválido o ha expirado.");
    }
  }, [location]);

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    axios
      .post("http://localhost:5000/api/auth/login-cliente", { email, password })
      .then((response) => {
        localStorage.setItem("tmm_token", response.data.token);
        navigate("/");
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
                  to="/forgot-password"
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
              to="/registro-cliente"
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

export default LoginCliente;
