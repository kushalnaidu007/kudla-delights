import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/slug';

const parseImageUrls = (value: FormDataEntryValue | null) =>
  String(value ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

async function createProduct(formData: FormData) {
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

  await prisma.product.create({
    data: {
      name,
      slug,
      description: description || null,
      pricePence,
      inventoryCount,
      active,
      categories: {
        create: categoryIds.map((categoryId) => ({ categoryId })),
      },
      images: {
        create: imageUrls.map((url, index) => ({ url, position: index })),
      },
    },
  });

  redirect('/admin');
}

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });

  return (
    <div className="mx-auto w-full max-w-2xl rounded-3xl border border-amber-100 bg-white p-8">
      <h1 className="text-2xl font-semibold text-stone-900">Add a product</h1>
      <form action={createProduct} className="mt-6 space-y-4">
        <label className="block text-sm font-medium text-stone-700">
          Name
          <input
            name="name"
            required
            className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-2"
          />
        </label>
        <label className="block text-sm font-medium text-stone-700">
          Slug
          <input
            name="slug"
            placeholder="auto-generated if left blank"
            className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-2"
          />
        </label>
        <label className="block text-sm font-medium text-stone-700">
          Description
          <textarea
            name="description"
            rows={3}
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
              className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-2"
            />
          </label>
        </div>
        <label className="block text-sm font-medium text-stone-700">
          Image URLs (one per line)
          <textarea
            name="imageUrls"
            rows={3}
            className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-2"
          />
        </label>

        {categories.length > 0 && (
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-stone-700">Categories</legend>
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <label key={category.id} className="flex items-center gap-2 text-sm">
                  <input name="categoryIds" type="checkbox" value={category.id} />
                  {category.name}
                </label>
              ))}
            </div>
          </fieldset>
        )}

        <label className="flex items-center gap-2 text-sm font-medium text-stone-700">
          <input name="active" type="checkbox" defaultChecked />
          Active
        </label>
        <button
          type="submit"
          className="w-full rounded-full bg-stone-900 px-4 py-2 text-sm font-semibold text-white"
        >
          Save product
        </button>
      </form>
    </div>
  );
}
