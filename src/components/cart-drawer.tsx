'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/components/cart-provider';
import { formatCurrency } from '@/lib/format';

export const CartDrawer = () => {
  const { items, itemCount, subtotalPence, updateQuantity, removeItem } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="rounded-full border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-stone-300"
      >
        Cart ({itemCount})
      </button>
      {open && (
        <div className="absolute right-0 mt-3 w-[320px] max-w-[90vw] rounded-3xl border border-stone-200 bg-white p-4 shadow-xl sm:w-[360px] sm:max-w-none">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Your cart</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-xs uppercase tracking-wide text-stone-500"
            >
              Close
            </button>
          </div>
          <div className="mt-4 space-y-3">
            {items.length === 0 ? (
              <p className="text-sm text-stone-500">No items yet.</p>
            ) : (
              items.map((item) => (
                <div key={item.productId} className="rounded-2xl border border-stone-100 p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-stone-800">{item.name}</p>
                      <p className="text-xs text-stone-500">{formatCurrency(item.pricePence)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId)}
                      className="text-xs text-stone-400 hover:text-stone-600"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="h-7 w-7 rounded-full border border-stone-200 text-sm"
                    >
                      -
                    </button>
                    <span className="text-sm">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="h-7 w-7 rounded-full border border-stone-200 text-sm"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="mt-4 border-t border-stone-200 pt-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-stone-500">Subtotal</span>
              <span className="font-semibold">{formatCurrency(subtotalPence)}</span>
            </div>
            <Link
              href="/checkout"
              className="mt-3 block rounded-full bg-stone-900 px-4 py-2 text-center text-sm font-semibold text-white"
            >
              Checkout
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
