'use client';

import { useState } from 'react';
import { useCart } from '@/components/cart-provider';
import { formatCurrency } from '@/lib/format';
import { calculateShippingPence } from '@/lib/shipping';

export default function CheckoutPage() {
  const { items, subtotalPence } = useCart();
  const shippingPence = calculateShippingPence(subtotalPence);
  const totalPence = subtotalPence + shippingPence;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onCheckout = async () => {
    setLoading(true);
    setError(null);

    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });

    if (!response.ok) {
      const data = await response.json();
      setError(data.error ?? 'Unable to start checkout.');
      setLoading(false);
      return;
    }

    const data = await response.json();
    window.location.href = data.url;
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div className="rounded-3xl border border-amber-100 bg-white p-8">
        <h1 className="text-2xl font-semibold text-stone-900">Checkout</h1>
        <p className="mt-2 text-sm text-stone-500">
          Review your cart and proceed to payment.
        </p>
      </div>

      <div className="rounded-3xl border border-amber-100 bg-white p-8">
        {items.length === 0 ? (
          <p className="text-sm text-stone-500">Your cart is empty.</p>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.productId} className="flex items-center justify-between text-sm">
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span>{formatCurrency(item.pricePence * item.quantity)}</span>
              </div>
            ))}
            <div className="space-y-2 border-t border-amber-100 pt-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-stone-500">Subtotal</span>
                <span>{formatCurrency(subtotalPence)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-500">Shipping (UK only)</span>
                <span>
                  {shippingPence === 0 ? 'Free' : formatCurrency(shippingPence)}
                </span>
              </div>
              <div className="flex items-center justify-between text-base font-semibold">
                <span>Total</span>
                <span>{formatCurrency(totalPence)}</span>
              </div>
            </div>
            <p className="text-xs text-stone-500">Free UK shipping on orders £40+.</p>
          </div>
        )}

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <button
          type="button"
          disabled={loading || items.length === 0}
          onClick={onCheckout}
          className="mt-6 w-full rounded-full bg-stone-900 px-4 py-3 text-sm font-semibold text-white"
        >
          {loading ? 'Redirecting...' : 'Proceed to payment'}
        </button>
      </div>
    </div>
  );
}
