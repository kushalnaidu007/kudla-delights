import Link from 'next/link';

export default function CheckoutCancelPage() {
  return (
    <div className="mx-auto w-full max-w-xl rounded-3xl border border-amber-100 bg-white p-8 text-center">
      <h1 className="text-2xl font-semibold text-stone-900">Checkout canceled</h1>
      <p className="mt-2 text-sm text-stone-500">
        No worries. Your cart is still saved if you want to try again.
      </p>
      <Link
        href="/checkout"
        className="mt-6 inline-block rounded-full bg-stone-900 px-5 py-2 text-sm font-semibold text-white"
      >
        Return to checkout
      </Link>
    </div>
  );
}
