'use client';

import { useState } from 'react';
import { useCart } from '@/components/cart-provider';
import type { CartItem } from '@/lib/cart';

export const AddToCartButton = ({
  item,
  disabled,
}: {
  item: CartItem;
  disabled?: boolean;
}) => {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const onAdd = () => {
    if (disabled) return;
    addItem(item);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
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
  );
};
