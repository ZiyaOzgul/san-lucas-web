"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { CartItem, Product, OrderType } from "@/lib/types";

type CartContextValue = {
  items: CartItem[];
  addItem: (product: Product, quantity?: number, notes?: string) => void;
  removeItem: (productId: number) => void;
  clearCart: () => void;
  itemCount: number;
  total: number;
  tableId: number;
  orderType: OrderType;
};

const CartContext = createContext<CartContextValue | null>(null);

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}

type Props = {
  children: ReactNode;
  tableId: number;
  orderType: OrderType;
};

export function CartProvider({ children, tableId, orderType }: Props) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback(
    (product: Product, quantity: number = 1, notes?: string) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.productId === product.id);
        if (existing) {
          return prev.map((i) =>
            i.productId === product.id
              ? { ...i, quantity: i.quantity + quantity, notes: notes ?? i.notes }
              : i
          );
        }
        return [
          ...prev,
          {
            productId: product.id,
            productName: product.name,
            quantity,
            unitPrice: product.price,
            notes,
          },
        ];
      });
    },
    []
  );

  const removeItem = useCallback((productId: number) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === productId);
      if (!existing) return prev;
      if (existing.quantity === 1) {
        return prev.filter((i) => i.productId !== productId);
      }
      return prev.map((i) =>
        i.productId === productId ? { ...i, quantity: i.quantity - 1 } : i
      );
    });
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const total = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, clearCart, itemCount, total, tableId, orderType }}
    >
      {children}
    </CartContext.Provider>
  );
}
