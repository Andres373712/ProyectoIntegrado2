"use client";

import React, { useState } from "react";
import { authService } from "@/features/auth/authService";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X } from "lucide-react";
import { useToast } from "@/shared/hooks/use-toast";

function NuevaPassword() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { token } = useParams(); // Obtenemos el token de la URL
  const router = useRouter();
  const { toast } = useToast();

  // Validación visual (actualizada con . y ,)
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[@$!%*?&.,]/.test(password); // <-- AÑADIDO . y ,
  const isStrong =
    hasMinLength && hasUpper && hasLower && hasNumber && hasSymbol;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStrong) {
      setError("La contraseña no cumple los requisitos.");
      return;
    }
    authService
      .resetPassword(token as string, password)
      .then((res) => {
        toast({ title: "Contraseña actualizada", description: res.data.message });
        router.push("/login-cliente");
      })
      .catch((err) =>
        setError(
          err.response?.data?.message ||
            "Error al restablecer. Token inválido.",
        ),
      );
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            Nueva Contraseña
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Nueva Contraseña</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              {/* Requisitos Visuales */}
              <div className="space-y-1 pt-2 text-xs text-muted-foreground">
                <RequirementItem
                  met={hasMinLength}
                  text="Mínimo 8 caracteres"
                />
                <RequirementItem met={hasUpper} text="Mayúscula" />
                <RequirementItem met={hasLower} text="Minúscula" />
                <RequirementItem met={hasNumber} text="Número" />
                <RequirementItem
                  met={hasSymbol}
                  text="Símbolo (@ $ ! % * ? & . ,)"
                />
              </div>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full" disabled={!isStrong}>
              Cambiar Contraseña
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function RequirementItem({ met, text }: { met: boolean; text: string }) {
  return (
    <div className={`flex items-center ${met ? "text-green-600" : ""}`}>
      {met ? (
        <Check size={12} className="mr-1" />
      ) : (
        <X size={12} className="mr-1" />
      )}{" "}
      {text}
    </div>
  );
}

export default NuevaPassword;
