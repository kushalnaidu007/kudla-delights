'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('email') ?? '');
    const password = String(formData.get('password') ?? '');

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError('Invalid email or password.');
      setLoading(false);
      return;
    }

    const from = params.get('from');
    window.location.href = from ?? '/';
  };

  return (
    <div className="mx-auto w-full max-w-md rounded-3xl border border-amber-100 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold text-stone-900">Welcome back</h1>
      <p className="mt-2 text-sm text-stone-500">Log in to complete your purchase.</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
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
          {loading ? 'Logging in...' : 'Log in'}
        </button>
      </form>

      <p className="mt-4 text-sm text-stone-500">
        Need an account?{' '}
        <Link href="/signup" className="font-semibold text-stone-900">
          Create one
        </Link>
      </p>
    </div>
  );
}
