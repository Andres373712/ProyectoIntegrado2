"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import * as cartLogic from "@/features/carrito/cartLogic";
import type { CartItem } from "@/features/carrito/cartLogic";

const CartContext = createContext(undefined);

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
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

  const addToCart = (product) => setCart((prevCart) => cartLogic.addToCart(prevCart, product));
  const removeFromCart = (id, tipo) =>
    setCart((prevCart) => cartLogic.removeFromCart(prevCart, id, tipo));
  const updateQuantity = (id, tipo, amount) =>
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
