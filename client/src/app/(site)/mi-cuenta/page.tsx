"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/shared/auth/AuthProvider";
import { useMiCuenta } from "@/features/cuenta/useMiCuenta";
import { formatCLP, formatFechaCL } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { CalendarDays, MapPin, Package, User, LogOut } from "lucide-react";

function estadoBadgeClass(estado: string) {
  const normalizado = (estado || "").toLowerCase();
  if (["confirmada", "confirmado", "pagado", "completado", "activa"].includes(normalizado)) {
    return "bg-success/10 text-success";
  }
  if (["cancelada", "cancelado", "rechazado"].includes(normalizado)) {
    return "bg-destructive/10 text-destructive";
  }
  return "bg-warning/10 text-warning";
}

function MiCuentaContenido() {
  const router = useRouter();
  const { email, logout } = useAuth();
  const {
    inscripciones,
    pedidos,
    pedidosDisponibles,
    cargando,
    error,
    cancelarInscripcion,
    cancelandoId,
    errorCancelacion,
  } = useMiCuenta();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handleCancelar = (inscripcion: (typeof inscripciones)[number]) => {
    // No hay AlertDialog reusable en components/ui todavía — confirm nativo
    // como fallback simple, según lo pedido.
    const confirmado = window.confirm(
      `¿Seguro que quieres cancelar tu inscripción a "${inscripcion.tallerNombre}"?`,
    );
    if (confirmado) cancelarInscripcion(inscripcion.id);
  };

  return (
    <div className="min-h-screen bg-muted p-6 md:p-10">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* --- Encabezado / Perfil --- */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <User className="h-7 w-7" />
              </div>
              <div>
                <CardTitle className="text-2xl">Mi Cuenta</CardTitle>
                <CardDescription>{email || "Clienta TMM"}</CardDescription>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </Button>
          </CardHeader>
        </Card>

        {error && (
          <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm font-bold text-destructive">
            {error}
          </div>
        )}

        {errorCancelacion && (
          <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm font-bold text-destructive">
            {errorCancelacion}
          </div>
        )}

        {/* --- Mis Talleres --- */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <CalendarDays className="h-5 w-5 text-primary" />
              Mis Talleres
            </CardTitle>
            <CardDescription>
              Los talleres a los que te has inscrito con TMM Bienestar y Conexión.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {cargando ? (
              <p className="text-sm text-muted-foreground">Cargando tus inscripciones...</p>
            ) : inscripciones.length > 0 ? (
              <div className="space-y-4">
                {inscripciones.map((inscripcion) => (
                  <div
                    key={inscripcion.id}
                    className="flex flex-col justify-between gap-2 rounded-lg border border-border p-4 sm:flex-row sm:items-center"
                  >
                    <div>
                      <h3 className="font-bold text-foreground">{inscripcion.tallerNombre}</h3>
                      <p className="flex items-center gap-1 text-sm text-muted-foreground">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {formatFechaCL(inscripcion.tallerFecha)}
                      </p>
                      {inscripcion.tallerLugar && (
                        <p className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5" />
                          {inscripcion.tallerLugar}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-block w-fit rounded-full px-3 py-1 text-xs font-bold capitalize ${estadoBadgeClass(inscripcion.estado)}`}
                      >
                        {inscripcion.estado}
                      </span>
                      {inscripcion.estado === "proximo" && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={cancelandoId === inscripcion.id}
                          onClick={() => handleCancelar(inscripcion)}
                        >
                          {cancelandoId === inscripcion.id ? "Cancelando..." : "Cancelar"}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-sm text-muted-foreground">
                Aún no te has inscrito a ningún taller.{" "}
                <Link href="/catalogo" className="font-bold text-primary hover:underline">
                  Explora el catálogo
                </Link>
                .
              </div>
            )}
          </CardContent>
        </Card>

        {/* --- Mis Pedidos (se oculta si el backend aún no ofrece este endpoint) --- */}
        {pedidosDisponibles && (
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Package className="h-5 w-5 text-primary" />
                Mis Pedidos
              </CardTitle>
              <CardDescription>Tus compras de productos realizadas en la tienda.</CardDescription>
            </CardHeader>
            <CardContent>
              {cargando ? (
                <p className="text-sm text-muted-foreground">Cargando tus pedidos...</p>
              ) : pedidos.length > 0 ? (
                <div className="space-y-4">
                  {pedidos.map((pedido) => (
                    <div key={pedido.id} className="rounded-lg border border-border p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm text-muted-foreground">
                          Pedido #{pedido.id} · {formatFechaCL(pedido.fecha)}
                        </p>
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-xs font-bold capitalize ${estadoBadgeClass(pedido.estado)}`}
                        >
                          {pedido.estado}
                        </span>
                      </div>
                      <ul className="mt-3 space-y-1 text-sm text-foreground">
                        {pedido.productos.map((producto, index) => (
                          <li key={index} className="flex justify-between">
                            <span>
                              {producto.cantidad}x {producto.nombre}
                            </span>
                            <span>${formatCLP(producto.precio * producto.cantidad)}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-3 flex justify-end border-t border-border pt-2 text-sm font-bold text-foreground">
                        Total: ${formatCLP(pedido.total)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-sm text-muted-foreground">
                  Todavía no tienes pedidos registrados.
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function MiCuenta() {
  return (
    <ProtectedRoute allowedRoles={["cliente"]} redirectTo="/login-cliente">
      <MiCuentaContenido />
    </ProtectedRoute>
  );
}

export default MiCuenta;
