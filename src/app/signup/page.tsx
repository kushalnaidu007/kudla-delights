'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const data = await response.json();
      setError(data.error ?? 'Unable to create account.');
      setLoading(false);
      return;
    }

    router.push('/login?new=1');
  };

  return (
    <div className="mx-auto w-full max-w-md rounded-3xl border border-amber-100 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold text-stone-900">Create your account</h1>
      <p className="mt-2 text-sm text-stone-500">Checkout requires an account.</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <label className="block text-sm font-medium text-stone-700">
          Name
          <input
            name="name"
            type="text"
            required
            className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-2"
          />
        </label>
        <label className="block text-sm font-medium text-stone-700">
          Email
          <input
            name="email"
            type="email"
            required
            className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-2"
          />
        </label>
        <label className="block text-sm font-medium text-stone-700">
          Password
          <input
            name="password"
            type="password"
            minLength={6}
            required
            className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-2"
          />
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-stone-900 px-4 py-2 text-sm font-semibold text-white"
        >
          {loading ? 'Creating...' : 'Create account'}
        </button>
      </form>

      <p className="mt-4 text-sm text-stone-500">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-stone-900">
          Log in
        </Link>
      </p>
    </div>
  );
}
