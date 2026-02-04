import Link from 'next/link';
import { CartDrawer } from '@/components/cart-drawer';
import { UserMenu } from '@/components/user-menu';

export const SiteHeader = () => {
  return (
    <header className="border-b border-amber-100 bg-white/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="text-2xl font-semibold tracking-tight text-stone-900">
          Kudla Delights
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="hidden text-sm font-semibold text-stone-700 hover:text-stone-900 md:inline"
          >
            Shop
          </Link>
          <CartDrawer />
          <UserMenu />
        </div>
      </div>
    </header>
  );
};
