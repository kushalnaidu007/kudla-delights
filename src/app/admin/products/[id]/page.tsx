import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/slug';

const parseImageUrls = (value: FormDataEntryValue | null) =>
  String(value ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

async function updateProduct(productId: string, formData: FormData) {
  'use server';

  const name = String(formData.get('name') ?? '').trim();
  const slugInput = String(formData.get('slug') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const pricePence = Number(formData.get('pricePence') ?? 0);
  const inventoryCount = Number(formData.get('inventoryCount') ?? 0);
  const active = formData.get('active') === 'on';
  const categoryIds = formData.getAll('categoryIds').map(String);
  const imageUrls = parseImageUrls(formData.get('imageUrls'));

  if (!name || Number.isNaN(pricePence)) {
    return;
  }

  const slug = slugInput ? slugify(slugInput) : slugify(name);

  await prisma.product.update({
    where: { id: productId },
    data: {
      name,
      slug,
      description: description || null,
      pricePence,
      inventoryCount,
      active,
      categories: {
        deleteMany: {},
        create: categoryIds.map((categoryId) => ({ categoryId })),
      },
      images: {
        deleteMany: {},
        create: imageUrls.map((url, index) => ({ url, position: index })),
      },
    },
  });

  redirect('/admin');
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        categories: true,
        images: { orderBy: { position: 'asc' } },
      },
    }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
  ]);

  if (!product) {
    return (
      <div className="rounded-3xl border border-amber-100 bg-white p-8">
        <h1 className="text-2xl font-semibold text-stone-900">Product not found</h1>
        <p className="mt-2 text-sm text-stone-500">ID: {id}</p>
      </div>
    );
  }

  const selectedCategoryIds = new Set(product.categories.map((entry) => entry.categoryId));
  const imageUrls = product.images.map((image) => image.url).join('\n');
  const updateProductWithId = updateProduct.bind(null, id);

  return (
    <div className="mx-auto w-full max-w-2xl rounded-3xl border border-amber-100 bg-white p-8">
      <h1 className="text-2xl font-semibold text-stone-900">Edit product</h1>
      <form action={updateProductWithId} className="mt-6 space-y-4">
        <label className="block text-sm font-medium text-stone-700">
          Name
          <input
            name="name"
            defaultValue={product.name}
            required
            className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-2"
          />
        </label>
        <label className="block text-sm font-medium text-stone-700">
          Slug
          <input
            name="slug"
            defaultValue={product.slug}
            className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-2"
          />
        </label>
        <label className="block text-sm font-medium text-stone-700">
          Description
          <textarea
            name="description"
            rows={3}
            defaultValue={product.description ?? ''}
            className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-2"
          />
        </label>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm font-medium text-stone-700">
            Price (pence)
            <input
              name="pricePence"
              type="number"
              min={0}
              required
              defaultValue={product.pricePence}
              className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-2"
            />
          </label>
          <label className="block text-sm font-medium text-stone-700">
            Inventory count
            <input
              name="inventoryCount"
              type="number"
              min={0}
              required
              defaultValue={product.inventoryCount}
              className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-2"
            />
          </label>
        </div>
        <label className="block text-sm font-medium text-stone-700">
          Image URLs (one per line)
          <textarea
            name="imageUrls"
            rows={3}
            defaultValue={imageUrls}
            className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-2"
          />
        </label>

        {categories.length > 0 && (
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-stone-700">Categories</legend>
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <label key={category.id} className="flex items-center gap-2 text-sm">
                  <input
                    name="categoryIds"
                    type="checkbox"
                    value={category.id}
                    defaultChecked={selectedCategoryIds.has(category.id)}
                  />
                  {category.name}
                </label>
              ))}
            </div>
          </fieldset>
        )}

        <label className="flex items-center gap-2 text-sm font-medium text-stone-700">
          <input name="active" type="checkbox" defaultChecked={product.active} />
          Active
        </label>
        <button
          type="submit"
          className="w-full rounded-full bg-stone-900 px-4 py-2 text-sm font-semibold text-white"
        >
          Update product
        </button>
      </form>
    </div>
  );
}
