import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@/lib/format';
import { QuantityAdd } from '@/components/quantity-add';

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!slug) {
    notFound();
  }

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { position: 'asc' } },
      reviews: {
        orderBy: { createdAt: 'desc' },
        include: { user: true },
      },
    },
  });

  if (!product || !product.active) {
    notFound();
  }

  const primaryImage = product.images?.[0]?.url ?? null;

  return (
    <div className="space-y-10">
      <Link href="/" className="text-sm font-semibold text-stone-600">
        ← Back to shop
      </Link>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="aspect-[4/3] w-full overflow-hidden rounded-3xl bg-amber-50">
            {primaryImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={primaryImage} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-stone-400">
                Image coming soon
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-3 gap-3">
              {product.images.slice(1).map((image) => (
                <div key={image.id} className="aspect-[4/3] overflow-hidden rounded-2xl bg-amber-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image.url} alt={product.name} className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-semibold text-stone-900">{product.name}</h1>
            <p className="mt-2 text-lg font-semibold text-stone-900">
              {formatCurrency(product.pricePence, product.currency)}
            </p>
            {product.description && (
              <p className="mt-4 text-sm text-stone-600">{product.description}</p>
            )}
          </div>

          <div className="flex items-center gap-4">
            <QuantityAdd
              item={{
                productId: product.id,
                name: product.name,
                pricePence: product.pricePence,
                quantity: 1,
                imageUrl: primaryImage,
              }}
              disabled={product.inventoryCount <= 0}
            />
            <span className="text-sm text-stone-500">In stock: {product.inventoryCount}</span>
          </div>
        </div>
      </div>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-stone-900">Reviews</h2>
          <Link
            href={`/products/${product.slug}/review`}
            className="rounded-full border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-700"
          >
            Write a review
          </Link>
        </div>

        {product.reviews.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-amber-200 bg-white p-8 text-sm text-stone-500">
            No reviews yet.
          </div>
        ) : (
          <div className="space-y-4">
            {product.reviews.map((review) => (
              <div key={review.id} className="rounded-3xl border border-amber-100 bg-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-stone-900">{review.title}</p>
                    <p className="text-xs text-stone-500">by {review.user.name ?? review.user.email}</p>
                  </div>
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                    {review.rating} / 5
                  </span>
                </div>
                <p className="mt-3 text-sm text-stone-600">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
