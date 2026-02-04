'use client';

import { signOut } from 'next-auth/react';

export const AdminLogout = () => {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: '/' })}
      className="text-sm font-semibold text-stone-700"
    >
      Logout
    </button>
  );
};
