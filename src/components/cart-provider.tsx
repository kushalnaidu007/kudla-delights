'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { CartItem, CartState } from '@/lib/cart';
import { CART_STORAGE_KEY } from '@/lib/cart';

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotalPence: number;
  addItem: (item: CartItem) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

const readStoredCart = (): CartState => {
  if (typeof window === 'undefined') return { items: [] };
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return { items: [] };
    const parsed = JSON.parse(raw) as CartState;
    if (!parsed.items) return { items: [] };
    return parsed;
  } catch {
    return { items: [] };
  }
};

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setItems(readStoredCart().items);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ items }));
  }, [items]);

  const addItem = (item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((entry) => entry.productId === item.productId);
      if (existing) {
        return prev.map((entry) =>
          entry.productId === item.productId
            ? { ...entry, quantity: entry.quantity + item.quantity }
            : entry,
        );
      }
      return [...prev, item];
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setItems((prev) =>
      prev
        .map((entry) =>
          entry.productId === productId ? { ...entry, quantity } : entry,
        )
        .filter((entry) => entry.quantity > 0),
    );
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((entry) => entry.productId !== productId));
  };

  const clear = () => setItems([]);

  const value = useMemo(() => {
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotalPence = items.reduce(
      (sum, item) => sum + item.pricePence * item.quantity,
      0,
    );
    return { items, itemCount, subtotalPence, addItem, updateQuantity, removeItem, clear };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
