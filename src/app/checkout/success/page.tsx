'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useCart } from '@/components/cart-provider';

export default function CheckoutSuccessPage() {
  const { clear } = useCart();

  useEffect(() => {
    clear();
  }, [clear]);

  return (
    <div className="mx-auto w-full max-w-xl rounded-3xl border border-amber-100 bg-white p-8 text-center">
      <h1 className="text-2xl font-semibold text-stone-900">Payment received</h1>
      <p className="mt-2 text-sm text-stone-500">
        Thanks for your order. We’ll start packing your snacks right away.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-full bg-amber-500 px-5 py-2 text-sm font-semibold text-stone-900"
      >
        Back to shop
      </Link>
    </div>
  );
}
