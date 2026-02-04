import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

async function createReview(productSlug: string, formData: FormData) {
  'use server';

  const session = await getSession();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const rating = Number(formData.get('rating') ?? 0);
  const title = String(formData.get('title') ?? '').trim();
  const comment = String(formData.get('comment') ?? '').trim();

  if (!rating || !title || !comment) {
    return;
  }

  const product = await prisma.product.findUnique({ where: { slug: productSlug } });
  if (!product) {
    redirect('/');
  }

  await prisma.review.create({
    data: {
      productId: product.id,
      userId: session.user.id,
      rating,
      title,
      comment,
    },
  });

  redirect(`/products/${productSlug}`);
}

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!slug) {
    redirect('/');
  }

  const session = await getSession();
  const product = await prisma.product.findUnique({
    where: { slug },
  });

  if (!product) {
    redirect('/');
  }

  const createReviewForProduct = createReview.bind(null, slug);

  return (
    <div className="mx-auto w-full max-w-2xl rounded-3xl border border-amber-100 bg-white p-8">
      <h1 className="text-2xl font-semibold text-stone-900">Review {product.name}</h1>
      {!session?.user?.id ? (
        <div className="mt-6 rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm text-stone-700">
          Please log in to write a review.
        </div>
      ) : (
        <form action={createReviewForProduct} className="mt-6 space-y-4">
          <label className="block text-sm font-medium text-stone-700">
            Rating
            <select
              name="rating"
              required
              className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-2"
            >
              <option value="">Select rating</option>
              {[5, 4, 3, 2, 1].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium text-stone-700">
            Title
            <input
              name="title"
              required
              className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-2"
            />
          </label>
          <label className="block text-sm font-medium text-stone-700">
            Review
            <textarea
              name="comment"
              rows={4}
              required
              className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-2"
            />
          </label>
          <button
            type="submit"
            className="w-full rounded-full bg-stone-900 px-4 py-2 text-sm font-semibold text-white"
          >
            Submit review
          </button>
        </form>
      )}
    </div>
  );
}
