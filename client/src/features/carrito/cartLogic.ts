// Lógica pura del carrito, separada del estado de React para que sea
// testeable sin necesidad de montar el Context.
import { toast } from "@/shared/hooks/use-toast";

export interface CartItem {
  id: number;
  tipo: string;
  nombre: string;
  precio: number;
  cantidad: number;
  stock?: number;
  imageUrl?: string | null;
  [key: string]: unknown;
}

// El "& { stock?: number }" es necesario porque Omit sobre un tipo con índice
// de firma ([key: string]: unknown) pierde el tipo específico de "stock" —
// sin esto, TypeScript ve product.stock como "unknown" en vez de "number".
export function addToCart(
  cart: CartItem[],
  product: Omit<CartItem, "cantidad"> & { stock?: number },
): CartItem[] {
  const existingItem = cart.find(
    (item) => item.id === product.id && item.tipo === product.tipo,
  );

  if (existingItem) {
    if (
      product.tipo === "producto" &&
      existingItem.cantidad >= (product.stock ?? Infinity)
    ) {
      toast({
        title: "Sin stock suficiente",
        description: "No puedes añadir más unidades de las disponibles en stock.",
        variant: "destructive",
      });
      return cart;
    }
    return cart.map((item) =>
      item.id === product.id && item.tipo === product.tipo
        ? { ...item, cantidad: item.cantidad + 1 }
        : item,
    );
  }
  return [...cart, { ...product, cantidad: 1 } as CartItem];
}

export function removeFromCart(cart: CartItem[], id: number, tipo: string): CartItem[] {
  return cart.filter((item) => !(item.id === id && item.tipo === tipo));
}

export function updateQuantity(
  cart: CartItem[],
  id: number,
  tipo: string,
  amount: number,
): CartItem[] {
  return cart.map((item) => {
    if (item.id === id && item.tipo === tipo) {
      const nuevaCantidad = Math.max(1, item.cantidad + amount);
      if (item.tipo === "producto" && nuevaCantidad > (item.stock ?? Infinity)) {
        return item;
      }
      return { ...item, cantidad: nuevaCantidad };
    }
    return item;
  });
}

export function computeTotal(cart: CartItem[]): number {
  return cart.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
}

export function computeCount(cart: CartItem[]): number {
  return cart.reduce((sum, item) => sum + item.cantidad, 0);
}
