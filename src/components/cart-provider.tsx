'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import type { CartItem, CartState } from '@/lib/cart';
import { CART_STORAGE_KEY, mapServerItems } from '@/lib/cart';

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
  const { status } = useSession();
  const isAuthed = status === 'authenticated';

  useEffect(() => {
    setItems(readStoredCart().items);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ items }));
  }, [items]);

  useEffect(() => {
    if (!isAuthed) return;
    const sync = async () => {
      const localItems = readStoredCart().items;
      const response = await fetch('/api/cart/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: localItems }),
      });
      if (!response.ok) return;
      const data = await response.json();
      setItems(mapServerItems(data.items ?? []));
    };
    sync();
  }, [isAuthed]);

  const addItem = (item: CartItem) => {
    if (isAuthed) {
      fetch('/api/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: item.productId, quantity: item.quantity }),
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.items) setItems(mapServerItems(data.items));
        });
      return;
    }

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
    if (isAuthed) {
      fetch(`/api/cart/items/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.items) setItems(mapServerItems(data.items));
        });
      return;
    }

    setItems((prev) =>
      prev
        .map((entry) =>
          entry.productId === productId ? { ...entry, quantity } : entry,
        )
        .filter((entry) => entry.quantity > 0),
    );
  };

  const removeItem = (productId: string) => {
    if (isAuthed) {
      fetch(`/api/cart/items/${productId}`, { method: 'DELETE' })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.items) setItems(mapServerItems(data.items));
        });
      return;
    }

    setItems((prev) => prev.filter((entry) => entry.productId !== productId));
  };

  const clear = () => {
    if (isAuthed) {
      Promise.all(items.map((item) => fetch(`/api/cart/items/${item.productId}`, { method: 'DELETE' }))).finally(
        () => setItems([]),
      );
      return;
    }
    setItems([]);
  };

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
