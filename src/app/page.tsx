import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { ProductCard } from '@/components/product-card';

export const dynamic = 'force-dynamic';

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{ category?: string }>;
}) {
  const resolved = searchParams ? await searchParams : undefined;
  const category = resolved?.category;

  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
  });

  const products = await prisma.product.findMany({
    where: {
      active: true,
      ...(category
        ? {
            categories: {
              some: {
                category: {
                  slug: category,
                },
              },
            },
          }
        : {}),
    },
    include: {
      images: { orderBy: { position: 'asc' } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-10">
      <section className="rounded-[32px] border border-amber-200 bg-gradient-to-br from-amber-100 via-orange-50 to-rose-50 p-10 md:p-16">
        <p className="text-sm uppercase tracking-[0.2em] text-amber-700">
          Mangalorean snacks in the UK
        </p>
        <h1 className="mt-3 text-4xl font-semibold text-stone-900 md:text-5xl">
          Kudla Delights brings coastal spice to your doorstep.
        </h1>
        <p className="mt-4 max-w-2xl text-base text-stone-700">
          Explore a curated collection of home-style treats from Mangalore. Freshly
          packed, artisan-made, and shipped across the UK.
        </p>
      </section>

      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-semibold text-stone-900">Featured snacks</h2>
          <p className="text-sm text-stone-500">{products.length} items</p>
        </div>

        {categories.length > 0 && (
          <div className="flex flex-wrap gap-3">
            <Link
              href="/"
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                !category
                  ? 'bg-stone-900 text-white'
                  : 'border border-stone-200 text-stone-700'
              }`}
            >
              All
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/?category=${cat.slug}`}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  category === cat.slug
                    ? 'bg-stone-900 text-white'
                    : 'border border-stone-200 text-stone-700'
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        )}

        {products.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-amber-200 bg-white p-10 text-center">
            <p className="text-sm text-stone-500">
              Products will appear here once you add them in the admin panel.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
