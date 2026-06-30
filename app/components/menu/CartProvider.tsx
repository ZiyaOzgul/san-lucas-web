"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type {
  CartItem,
  CartItemModifier,
  Product,
  OrderType,
} from "@/lib/types";

type AddItemArgs = {
  product: Product;
  quantity?: number;
  notes?: string;
  variantId?: number | null;
  variantName?: string | null;
  modifiers?: CartItemModifier[];
};

type CartContextValue = {
  items: CartItem[];
  addItem: (args: AddItemArgs) => void;
  removeItem: (index: number) => void;
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

function modifiersKey(mods: CartItemModifier[]): string {
  return [...mods]
    .sort((a, b) => a.modifierId - b.modifierId)
    .map((m) => `${m.modifierId}:${m.quantity}`)
    .join("|");
}

function modifiersDelta(mods: CartItemModifier[]): number {
  return mods.reduce(
    (s, m) => s + (Number(m.priceDelta) || 0) * (Number(m.quantity) || 1),
    0
  );
}

export function CartProvider({ children, tableId, orderType }: Props) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((args: AddItemArgs) => {
    const {
      product,
      quantity = 1,
      notes,
      variantId = null,
      variantName = null,
      modifiers = [],
    } = args;
    const key = modifiersKey(modifiers);
    setItems((prev) => {
      const existing = prev.find(
        (i) =>
          i.productId === product.id &&
          i.variantId === variantId &&
          modifiersKey(i.modifiers) === key &&
          (i.notes ?? "") === (notes ?? "")
      );
      if (existing) {
        return prev.map((i) =>
          i === existing ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          productName: product.name,
          variantId,
          variantName,
          quantity,
          unitPrice: product.price,
          pointsValue: product.points_value ?? 0,
          notes,
          modifiers,
        },
      ];
    });
  }, []);

  const removeItem = useCallback((index: number) => {
    setItems((prev) => {
      const target = prev[index];
      if (!target) return prev;
      if (target.quantity === 1) {
        return prev.filter((_, i) => i !== index);
      }
      return prev.map((i, idx) =>
        idx === index ? { ...i, quantity: i.quantity - 1 } : i
      );
    });
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const total = items.reduce(
    (sum, i) => sum + (i.unitPrice + modifiersDelta(i.modifiers)) * i.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, clearCart, itemCount, total, tableId, orderType }}
    >
      {children}
    </CartContext.Provider>
  );
}
