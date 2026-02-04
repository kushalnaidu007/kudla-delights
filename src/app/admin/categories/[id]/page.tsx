import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/slug';

async function updateCategory(categoryId: string, formData: FormData) {
  'use server';

  const name = String(formData.get('name') ?? '').trim();
  const slugInput = String(formData.get('slug') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();

  if (!name) return;

  const slug = slugInput ? slugify(slugInput) : slugify(name);

  await prisma.category.update({
    where: { id: categoryId },
    data: {
      name,
      slug,
      description: description || null,
    },
  });

  redirect('/admin/categories');
}

export default async function EditCategoryPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const category = await prisma.category.findUnique({ where: { id } });

  if (!category) {
    redirect('/admin/categories');
  }

  const updateCategoryWithId = updateCategory.bind(null, id);

  return (
    <div className="mx-auto w-full max-w-xl rounded-3xl border border-amber-100 bg-white p-8">
      <h1 className="text-2xl font-semibold text-stone-900">Edit category</h1>
      <form action={updateCategoryWithId} className="mt-6 space-y-4">
        <label className="block text-sm font-medium text-stone-700">
          Name
          <input
            name="name"
            required
            defaultValue={category.name}
            className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-2"
          />
        </label>
        <label className="block text-sm font-medium text-stone-700">
          Slug
          <input
            name="slug"
            defaultValue={category.slug}
            className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-2"
          />
        </label>
        <label className="block text-sm font-medium text-stone-700">
          Description
          <textarea
            name="description"
            rows={3}
            defaultValue={category.description ?? ''}
            className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-2"
          />
        </label>
        <button
          type="submit"
          className="w-full rounded-full bg-stone-900 px-4 py-2 text-sm font-semibold text-white"
        >
          Update category
        </button>
      </form>
    </div>
  );
}
