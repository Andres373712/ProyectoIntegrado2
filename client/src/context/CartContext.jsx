import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    // Inicializamos el carrito desde localStorage si existe
    const [cart, setCart] = useState(() => {
        const savedCart = localStorage.getItem('tmm_cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    // Guardar en localStorage cada vez que cambie el carrito
    useEffect(() => {
        localStorage.setItem('tmm_cart', JSON.stringify(cart));
    }, [cart]);

    // Añadir producto
    const addToCart = (product) => {
        setCart((prevCart) => {
            // Verificar si ya existe
            const existingItem = prevCart.find((item) => item.id === product.id && item.tipo === product.tipo);
            
            if (existingItem) {
                // Si es producto físico, revisamos stock
                if (product.tipo === 'producto' && existingItem.cantidad >= product.stock) {
                    alert('No puedes añadir más unidades de las disponibles en stock.');
                    return prevCart;
                }
                // Si existe, aumentamos cantidad
                return prevCart.map((item) =>
                    item.id === product.id && item.tipo === product.tipo
                        ? { ...item, cantidad: item.cantidad + 1 }
                        : item
                );
            }
            // Si no existe, lo agregamos con cantidad 1
            return [...prevCart, { ...product, cantidad: 1 }];
        });
    };

    // Eliminar producto
    const removeFromCart = (id, tipo) => {
        setCart((prevCart) => prevCart.filter((item) => !(item.id === id && item.tipo === tipo)));
    };

    // Cambiar cantidad (sumar/restar)
    const updateQuantity = (id, tipo, amount) => {
        setCart((prevCart) => prevCart.map((item) => {
            if (item.id === id && item.tipo === tipo) {
                const nuevaCantidad = Math.max(1, item.cantidad + amount);
                // Validar stock para productos
                if (item.tipo === 'producto' && nuevaCantidad > item.stock) {
                    return item; // No hacer nada si excede stock
                }
                return { ...item, cantidad: nuevaCantidad };
            }
            return item;
        }));
    };

    // Vaciar carrito
    const clearCart = () => setCart([]);

    // Calcular total
    const total = cart.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    const count = cart.reduce((sum, item) => sum + item.cantidad, 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, total, count }}>
            {children}
        </CartContext.Provider>
    );
};