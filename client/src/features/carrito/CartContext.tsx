"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import * as cartLogic from "@/features/carrito/cartLogic";
import type { CartItem } from "@/features/carrito/cartLogic";

interface CartContextValue {
  cart: CartItem[];
  addToCart: (product: Omit<CartItem, "cantidad"> & { stock?: number }) => void;
  removeFromCart: (id: number, tipo: string) => void;
  updateQuantity: (id: number, tipo: string, amount: number) => void;
  clearCart: () => void;
  total: number;
  count: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export const useCart = (): CartContextValue => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe usarse dentro de un <CartProvider>");
  }
  return context;
};

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  // Inicializamos el carrito desde localStorage si existe
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    const savedCart = localStorage.getItem("tmm_cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Guardar en localStorage cada vez que cambie el carrito
  useEffect(() => {
    localStorage.setItem("tmm_cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart: CartContextValue["addToCart"] = (product) =>
    setCart((prevCart) => cartLogic.addToCart(prevCart, product));
  const removeFromCart: CartContextValue["removeFromCart"] = (id, tipo) =>
    setCart((prevCart) => cartLogic.removeFromCart(prevCart, id, tipo));
  const updateQuantity: CartContextValue["updateQuantity"] = (id, tipo, amount) =>
    setCart((prevCart) => cartLogic.updateQuantity(prevCart, id, tipo, amount));
  const clearCart = () => setCart([]);

  const total = cartLogic.computeTotal(cart);
  const count = cartLogic.computeCount(cart);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        total,
        count,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
