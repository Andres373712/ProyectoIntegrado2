import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/shared/hooks/use-toast", () => ({ toast: vi.fn() }));

import { toast } from "@/shared/hooks/use-toast";
import { addToCart, removeFromCart, updateQuantity, computeTotal, computeCount } from "./cartLogic";
import type { CartItem } from "./cartLogic";

beforeEach(() => {
  vi.mocked(toast).mockClear();
});

const producto = (overrides: Partial<CartItem> = {}) => ({
  id: 1,
  tipo: "producto",
  nombre: "Kit Aceites",
  precio: 10000,
  stock: 3,
  ...overrides,
});

describe("addToCart", () => {
  it("agrega un producto nuevo con cantidad 1", () => {
    const cart = addToCart([], producto());
    expect(cart).toEqual([{ ...producto(), cantidad: 1 }]);
  });

  it("incrementa la cantidad si el mismo producto ya está en el carrito", () => {
    const cart = addToCart([{ ...producto(), cantidad: 1 }], producto());
    expect(cart).toHaveLength(1);
    expect(cart[0].cantidad).toBe(2);
  });

  it("un taller y un producto con el mismo id se tratan como items distintos", () => {
    const carritoInicial: CartItem[] = [{ ...producto(), tipo: "taller", cantidad: 1 }];
    const cart = addToCart(carritoInicial, producto());
    expect(cart).toHaveLength(2);
  });

  it("no supera el stock disponible para productos, y avisa", () => {
    const carritoLleno: CartItem[] = [{ ...producto(), cantidad: 3 }]; // ya en el tope del stock

    const cart = addToCart(carritoLleno, producto());

    expect(cart).toEqual(carritoLleno); // sin cambios
    expect(toast).toHaveBeenCalledOnce();
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ variant: "destructive" }));
  });

  it("los talleres no tienen límite de stock", () => {
    const taller = producto({ tipo: "taller", stock: undefined });
    const carritoConTaller: CartItem[] = [{ ...taller, cantidad: 50 }];
    const cart = addToCart(carritoConTaller, taller);
    expect(cart[0].cantidad).toBe(51);
  });
});

describe("removeFromCart", () => {
  it("elimina solo el item que coincide en id y tipo", () => {
    const cart: CartItem[] = [
      { ...producto({ id: 1 }), cantidad: 1 },
      { ...producto({ id: 2 }), cantidad: 1 },
    ];
    const resultado = removeFromCart(cart, 1, "producto");
    expect(resultado).toHaveLength(1);
    expect(resultado[0].id).toBe(2);
  });
});

describe("updateQuantity", () => {
  it("incrementa la cantidad", () => {
    const cart: CartItem[] = [{ ...producto(), cantidad: 1 }];
    const resultado = updateQuantity(cart, 1, "producto", 1);
    expect(resultado[0].cantidad).toBe(2);
  });

  it("no baja de 1 aunque se reste más de lo que hay", () => {
    const cart: CartItem[] = [{ ...producto(), cantidad: 1 }];
    const resultado = updateQuantity(cart, 1, "producto", -5);
    expect(resultado[0].cantidad).toBe(1);
  });

  it("no supera el stock disponible al incrementar", () => {
    const cart: CartItem[] = [{ ...producto(), cantidad: 3 }]; // stock: 3
    const resultado = updateQuantity(cart, 1, "producto", 1);
    expect(resultado[0].cantidad).toBe(3); // sin cambios, ya en el tope
  });
});

describe("computeTotal / computeCount", () => {
  const cart: CartItem[] = [
    { ...producto({ id: 1, precio: 1000 }), cantidad: 2 },
    { ...producto({ id: 2, precio: 500 }), cantidad: 3 },
  ];

  it("computeTotal suma precio * cantidad de todos los items", () => {
    expect(computeTotal(cart)).toBe(1000 * 2 + 500 * 3);
  });

  it("computeCount suma las cantidades de todos los items", () => {
    expect(computeCount(cart)).toBe(5);
  });

  it("ambos devuelven 0 con el carrito vacío", () => {
    expect(computeTotal([])).toBe(0);
    expect(computeCount([])).toBe(0);
  });
});
