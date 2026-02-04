import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-3xl border border-amber-100 bg-white p-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-amber-700">Admin</p>
          <h1 className="text-xl font-semibold text-stone-900">Kudla Delights</h1>
        </div>
        <div className="flex items-center gap-4 text-sm font-semibold text-stone-700">
          <Link href="/admin">Products</Link>
          <Link href="/admin/categories">Categories</Link>
          <Link href="/admin/orders">Orders</Link>
          <Link href="/">Back to shop</Link>
        </div>
      </div>
      {children}
    </div>
  );
}
