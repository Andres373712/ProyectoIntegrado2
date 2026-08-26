"use client";

import React, { useState } from "react";
import { authService } from "@/features/auth/authService";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Check, UserPlus } from "lucide-react";
import { useToast } from "@/shared/hooks/use-toast";

function Registro() {
  const [nombre, setNombre] = useState(""); // CORREGIDO
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [aceptaTerminos, setAceptaTerminos] = useState(false);

  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const router = useRouter();
  const { toast } = useToast();



  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[@$!%*?&.,]/.test(password);
  const isPasswordStrong =
    hasMinLength && hasUpper && hasLower && hasNumber && hasSymbol;

  const isPhoneValid = /^9\d{8}$/.test(telefono);
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isNameValid = nombre.trim().length > 0 && !/\d/.test(nombre);
  const passwordsMatch = password === confirmPassword && password.length > 0;

  const handleRegistro = async (e) => {
    e.preventDefault();
    setError("");
    setCargando(true);

    if (!isNameValid)
      return (
        setError("El nombre no puede contener números."),
        setCargando(false)
      );
    if (!isEmailValid)
      return (setError("Ingresa un correo válido."), setCargando(false));
    if (!isPhoneValid)
      return (
        setError("Teléfono debe tener 9 dígitos y comenzar con 9."),
        setCargando(false)
      );
    if (!isPasswordStrong)
      return (
        setError("La contraseña debe tener mayúscula, número y símbolo."),
        setCargando(false)
      );
    if (!passwordsMatch)
      return (setError("Las contraseñas no coinciden."), setCargando(false));
    if (!aceptaTerminos)
      return (setError("Debes aceptar los términos."), setCargando(false));

    const userData = {
      nombre: nombre.trim(),
      email: email.toLowerCase().trim(),
      telefono,
      password,
      aceptaTerminos: Boolean(aceptaTerminos), // FORZAMOS A BOOLEANO
    };

    try {
      const res = await authService.registerCliente(userData);
      toast({ title: "Registro exitoso", description: res.data.message });
      router.push("/login-cliente");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Error al registrar. Inténtalo más tarde.",
      );
      setCargando(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 p-4">
      <Card className="w-full max-w-lg border-0 shadow-2xl">
        <CardHeader className="pb-8 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-pink-100">
            <UserPlus className="h-12 w-12 text-pink-600" />
          </div>
          <CardTitle className="text-4xl font-bold text-gray-800">
            Crear Cuenta
          </CardTitle>
          <CardDescription className="mt-2 text-lg">
            Únete a TMM Bienestar y Conexión
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleRegistro} className="space-y-6">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center font-medium text-red-700">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre Completo</Label>
                <Input
                  id="nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ana Pérez"
                  autoComplete="name"
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono (sin +56)</Label>
                <Input
                  id="telefono"
                  value={telefono}
                  onChange={(e) =>
                    setTelefono(e.target.value.replace(/\D/g, "").slice(0, 9))
                  }
                  placeholder="912345678"
                  maxLength={9}
                  autoComplete="tel"
                  className="h-12"
                />
                {telefono && !isPhoneValid && (
                  <p className="text-xs text-red-600">
                    Debe comenzar con 9 y tener 9 dígitos
                  </p>
                )}
                {isPhoneValid && (
                  <p className="text-xs text-green-600">Teléfono válido</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ana@ejemplo.com"
                autoComplete="email"
                className="h-12"
              />
            </div>

            <div className="rounded-lg border bg-muted/40 p-5">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                className="mt-2 h-12"
              />
              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <Req met={hasMinLength} text="8+ caracteres" />
                <Req met={hasUpper} text="Una mayúscula" />
                <Req met={hasLower} text="Una minúscula" />
                <Req met={hasNumber} text="Un número" />
                <Req met={hasSymbol} text="Un símbolo (@$!%*?&.,)" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                className="h-12"
              />
              {confirmPassword && (
                <p
                  className={
                    passwordsMatch
                      ? "mt-1 text-xs text-green-600"
                      : "mt-1 text-xs text-red-600"
                  }
                >
                  {passwordsMatch
                    ? "Las contraseñas coinciden"
                    : "No coinciden"}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-3 pt-4">
              <Checkbox
                id="terms"
                checked={aceptaTerminos}
                onCheckedChange={(checked) => setAceptaTerminos(checked === true)}
              />
              <Label
                htmlFor="terms"
                className="cursor-pointer text-sm leading-tight"
              >
                Acepto los{" "}
                <Link
                  href="/terminos-y-condiciones"
                  className="font-bold text-pink-600 hover:underline"
                  target="_blank"
                >
                  Términos y Condiciones
                </Link>{" "}
                y la Política de Privacidad
              </Label>
            </div>

            <Button
              type="submit"
              className="h-14 w-full bg-gradient-to-r from-pink-600 to-purple-600 text-lg font-bold text-white shadow-lg hover:from-pink-700 hover:to-purple-700"
              disabled={cargando}
            >
              {cargando ? "Creando cuenta..." : "Registrarme"}
            </Button>

            <p className="mt-8 text-center text-sm text-gray-600">
              ¿Ya tienes cuenta?{" "}
              <Link
                href="/login-cliente"
                className="font-bold text-pink-600 hover:underline"
              >
                Inicia sesión aquí
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function Req({ met, text }) {
  return (
    <div
      className={`flex items-center gap-2 text-xs ${met ? "font-medium text-green-600" : "text-gray-500"}`}
    >
      {met ? (
        <Check className="h-4 w-4" />
      ) : (
        <span className="text-gray-400">○</span>
      )}{" "}
      {text}
    </div>
  );
}

export default Registro;
