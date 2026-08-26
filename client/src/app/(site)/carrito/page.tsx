"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useCart } from "@/features/carrito/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, Minus, ShoppingBag, CheckCircle } from "lucide-react";
import Link from "next/link";
import { usePedido } from "@/features/carrito/usePedido";
import { getImageUrl } from "@/shared/lib/apiClient";
import { formatCLP } from "@/lib/utils";

function Carrito() {
  const { cart, removeFromCart, updateQuantity, total, clearCart } = useCart();
  const { mensaje, exito, confirmarPedido } = usePedido();

  // Estados para el formulario de checkout
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [mostrarCheckout, setMostrarCheckout] = useState(false);

  const handleProcederCheckout = () => {
    setMostrarCheckout(true);
  };

  const handleConfirmarPedido = async (e) => {
    e.preventDefault();

    const exitoso = await confirmarPedido({
      nombre,
      email,
      telefono,
      productos: cart.map((item) => ({
        id: item.id,
        nombre: item.nombre,
        cantidad: item.cantidad,
        precio: item.precio,
      })),
      total,
    });

    if (exitoso) {
      clearCart();
      // NUEVO: Redirigir automáticamente a MercadoPago después de 2 segundos
      setTimeout(() => {
        window.open("https://www.mercadopago.cl/", "_blank");
        alert(
          "En un sistema real, aquí se abriría tu enlace de pago personalizado de MercadoPago con el monto de $" +
            formatCLP(total),
        );
      }, 2000);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center bg-background p-8 pt-24 text-center">
        <div className="mb-4 rounded-full bg-muted p-6">
          <ShoppingBag size={64} className="text-muted-foreground" />
        </div>
        <h2 className="mb-2 text-2xl font-bold text-foreground">
          Tu carrito está vacío
        </h2>
        <p className="mb-8 text-muted-foreground">
          Parece que aún no has añadido ningún producto.
        </p>
        <Button asChild size="lg">
          <Link href="/">Explorar Productos</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 pt-24 md:p-12">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-8 text-3xl font-bold text-primary">
          Tu Carrito de Compras
        </h1>

        {exito ? (
          // Pantalla de éxito
          <Card className="border-none shadow-lg">
            <CardContent className="p-12 text-center">
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-100 p-6">
                <CheckCircle size={48} className="text-green-600" />
              </div>
              <h2 className="mb-4 text-3xl font-bold text-green-600">
                ¡Pedido Confirmado!
              </h2>
              <p className="mb-2 text-lg">Hola {nombre},</p>
              <p className="mb-8 text-muted-foreground">{mensaje}</p>

              {/* Simulación de MercadoPago */}
              <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-6">
                <p className="mb-4 text-sm text-muted-foreground">
                  Para completar tu compra, procede al pago seguro:
                </p>
                <Button
                  onClick={() => {
                    // Simular redirección a MercadoPago
                    window.open("https://www.mercadopago.cl/", "_blank");
                    alert(
                      "En un sistema real, aquí se abriría tu enlace de pago personalizado de MercadoPago.",
                    );
                  }}
                  className="h-14 w-full bg-blue-500 text-lg font-bold hover:bg-blue-600"
                >
                  💳 Pagar con MercadoPago
                </Button>
                <p className="mt-3 text-xs text-muted-foreground">
                  Serás redirigido a la pasarela de pago segura
                </p>
              </div>

              <Button asChild size="lg" variant="outline">
                <Link href="/">Volver al Catálogo</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Lista de Productos */}
            <div className="space-y-4 lg:col-span-2">
              <h2 className="mb-4 text-xl font-bold">
                Productos ({cart.length})
              </h2>
              {cart.map((item) => (
                <Card
                  key={`${item.tipo}-${item.id}`}
                  className="flex flex-row items-center gap-4 overflow-hidden p-4"
                >
                  {/* Imagen Miniatura */}
                  <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                    <Image
                      src={getImageUrl(item.imageUrl)}
                      alt={item.nombre}
                      fill
                      unoptimized
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-grow">
                    <h3 className="text-lg font-bold">{item.nombre}</h3>
                    <p className="text-sm capitalize text-muted-foreground">
                      {item.tipo}
                    </p>
                    <p className="font-bold text-primary">
                      ${formatCLP(item.precio)}
                    </p>
                  </div>

                  {/* Controles */}
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center rounded-md border">
                      <button
                        onClick={() => updateQuantity(item.id, item.tipo, -1)}
                        className="p-2 transition-colors hover:bg-muted"
                        disabled={item.cantidad <= 1}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">
                        {item.cantidad}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.tipo, 1)}
                        className="p-2 transition-colors hover:bg-muted"
                        disabled={
                          item.tipo === "producto" &&
                          item.cantidad >= item.stock
                        }
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id, item.tipo)}
                      className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={12} /> Eliminar
                    </button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Panel de Checkout */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24 border-none shadow-lg">
                <CardContent className="p-6">
                  {!mostrarCheckout ? (
                    // Resumen inicial
                    <>
                      <h3 className="mb-4 text-xl font-bold">Resumen</h3>
                      <div className="mb-4 space-y-2 border-b pb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Subtotal
                          </span>
                          <span>${formatCLP(total)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Envío</span>
                          <span className="font-medium text-green-600">
                            Por calcular
                          </span>
                        </div>
                      </div>
                      <div className="mb-6 flex items-center justify-between">
                        <span className="text-lg font-bold">Total</span>
                        <span className="text-2xl font-bold text-primary">
                          ${formatCLP(total)}
                        </span>
                      </div>
                      <Button
                        onClick={handleProcederCheckout}
                        className="h-12 w-full text-lg font-bold shadow-md"
                      >
                        Finalizar compra
                      </Button>
                    </>
                  ) : (
                    // Formulario de checkout
                    <>
                      <h3 className="mb-4 text-xl font-bold">
                        Finalizar Compra
                      </h3>
                      <form
                        onSubmit={handleConfirmarPedido}
                        className="space-y-4"
                      >
                        <div>
                          <Label htmlFor="nombre">Nombre Completo</Label>
                          <Input
                            id="nombre"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            required
                          />
                        </div>
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
                          <Label htmlFor="telefono">Teléfono (WhatsApp)</Label>
                          <Input
                            id="telefono"
                            type="tel"
                            value={telefono}
                            onChange={(e) => setTelefono(e.target.value)}
                            placeholder="+56912345678"
                            required
                          />
                        </div>

                        <div className="mt-4 border-t pt-4">
                          <div className="mb-4 flex items-center justify-between">
                            <span className="font-bold">Total a pagar:</span>
                            <span className="text-2xl font-bold text-primary">
                              ${formatCLP(total)}
                            </span>
                          </div>
                        </div>

                        {mensaje && !exito && (
                          <p className="text-center text-sm text-red-500">
                            {mensaje}
                          </p>
                        )}

                        <Button
                          type="submit"
                          className="h-12 w-full text-lg font-bold shadow-md"
                        >
                          Proceder al pago
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full"
                          onClick={() => setMostrarCheckout(false)}
                        >
                          Volver
                        </Button>
                      </form>
                    </>
                  )}

                  <div className="mt-4 text-center text-xs text-muted-foreground">
                    <p>Te contactaremos para coordinar el pago y envío.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Carrito;
