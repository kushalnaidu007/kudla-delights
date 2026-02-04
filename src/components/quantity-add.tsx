'use client';

import { useState } from 'react';
import { useCart } from '@/components/cart-provider';
import type { CartItem } from '@/lib/cart';

export const QuantityAdd = ({
  item,
  disabled,
}: {
  item: CartItem;
  disabled?: boolean;
}) => {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const increment = () => setQuantity((prev) => prev + 1);
  const decrement = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const onAdd = () => {
    if (disabled) return;
    addItem({ ...item, quantity });
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center rounded-full border border-stone-200">
        <button
          type="button"
          onClick={decrement}
          className="h-9 w-9 rounded-full text-sm font-semibold text-stone-600"
        >
          -
        </button>
        <span className="min-w-[32px] text-center text-sm font-semibold text-stone-700">
          {quantity}
        </span>
        <button
          type="button"
          onClick={increment}
          className="h-9 w-9 rounded-full text-sm font-semibold text-stone-600"
        >
          +
        </button>
      </div>
      <button
        type="button"
        onClick={onAdd}
        disabled={disabled}
        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
          disabled
            ? 'cursor-not-allowed bg-stone-200 text-stone-500'
            : 'bg-amber-500 text-stone-900 hover:bg-amber-400'
        }`}
      >
        {disabled ? 'Out of stock' : added ? 'Added!' : 'Add to cart'}
      </button>
    </div>
  );
};
