import Link from 'next/link';
import { QuantityAdd } from '@/components/quantity-add';
import { formatCurrency } from '@/lib/format';
import type { Product, ProductImage } from '@prisma/client';

type ProductWithImages = Product & { images: ProductImage[] };

export const ProductCard = ({ product }: { product: ProductWithImages }) => {
  const primaryImage = product.images?.[0]?.url ?? null;

  return (
    <div className="flex h-full flex-col justify-between rounded-3xl border border-amber-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div>
        <Link href={`/products/${product.slug}`} className="block">
          <div className="mb-4 aspect-[4/3] w-full overflow-hidden rounded-2xl bg-amber-50">
            {primaryImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={primaryImage}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-stone-400">
                Image coming soon
              </div>
            )}
          </div>
          <h3 className="text-xl font-semibold text-stone-900">{product.name}</h3>
        </Link>
        {product.description && (
          <p className="mt-2 text-sm text-stone-600">{product.description}</p>
        )}
      </div>
      <div className="mt-6 flex items-center justify-between">
        <div>
          <p className="text-lg font-semibold text-stone-900">
            {formatCurrency(product.pricePence, product.currency)}
          </p>
          <p className="text-xs text-stone-500">In stock: {product.inventoryCount}</p>
        </div>
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
      </div>
    </div>
  );
};
