import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@/lib/format';

export default async function AdminPage() {
  const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Inventory</h1>
          <p className="text-sm text-stone-500">Manage your product catalog.</p>
        </div>
        <Link
          href="/admin/products/new"
          className="rounded-full bg-stone-900 px-4 py-2 text-sm font-semibold text-white"
        >
          Add product
        </Link>
      </div>

      <div className="overflow-hidden rounded-3xl border border-amber-100 bg-white">
        <div className="grid grid-cols-5 gap-4 border-b border-amber-100 px-6 py-3 text-xs font-semibold uppercase text-stone-500">
          <span>Product</span>
          <span>Price</span>
          <span>Stock</span>
          <span>Status</span>
          <span></span>
        </div>
        {products.length === 0 ? (
          <div className="px-6 py-6 text-sm text-stone-500">No products yet.</div>
        ) : (
          <div className="divide-y divide-amber-50">
            {products.map((product) => (
              <div key={product.id} className="grid grid-cols-5 items-center gap-4 px-6 py-4">
                <div>
                  <p className="text-sm font-semibold text-stone-900">{product.name}</p>
                  <p className="text-xs text-stone-500">{product.slug}</p>
                  <p className="text-[11px] text-stone-400">{product.id}</p>
                </div>
                <p className="text-sm">{formatCurrency(product.pricePence, product.currency)}</p>
                <p className="text-sm">{product.inventoryCount}</p>
                <span
                  className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                    product.active
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-stone-100 text-stone-600'
                  }`}
                >
                  {product.active ? 'Active' : 'Hidden'}
                </span>
                <a
                  href={`/admin/products/${encodeURIComponent(product.id)}`}
                  className="text-sm font-semibold text-amber-700"
                >
                  Edit
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
