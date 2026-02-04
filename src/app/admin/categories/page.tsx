import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Categories</h1>
          <p className="text-sm text-stone-500">Organize your collections.</p>
        </div>
        <Link
          href="/admin/categories/new"
          className="rounded-full bg-stone-900 px-4 py-2 text-sm font-semibold text-white"
        >
          Add category
        </Link>
      </div>

      <div className="overflow-hidden rounded-3xl border border-amber-100 bg-white">
        <div className="grid grid-cols-3 gap-4 border-b border-amber-100 px-6 py-3 text-xs font-semibold uppercase text-stone-500">
          <span>Name</span>
          <span>Slug</span>
          <span></span>
        </div>
        {categories.length === 0 ? (
          <div className="px-6 py-6 text-sm text-stone-500">No categories yet.</div>
        ) : (
          <div className="divide-y divide-amber-50">
            {categories.map((category) => (
              <div key={category.id} className="grid grid-cols-3 items-center gap-4 px-6 py-4">
                <p className="text-sm font-semibold text-stone-900">{category.name}</p>
                <p className="text-sm text-stone-500">{category.slug}</p>
                <Link
                  href={`/admin/categories/${category.id}`}
                  className="text-sm font-semibold text-amber-700"
                >
                  Edit
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
