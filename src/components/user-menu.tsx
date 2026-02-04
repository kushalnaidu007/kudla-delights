'use client';

import Link from 'next/link';
import { signIn, signOut, useSession } from 'next-auth/react';

export const UserMenu = () => {
  const { data } = useSession();

  if (!data?.user) {
    return (
      <button
        type="button"
        onClick={() => signIn()}
        className="rounded-full border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-stone-300"
      >
        Log in
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/account"
        className="text-sm font-semibold text-stone-700 hover:text-stone-900"
      >
        Account
      </Link>
      <button
        type="button"
        onClick={() => signOut()}
        className="rounded-full border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-stone-300"
      >
        Log out
      </button>
    </div>
  );
};
