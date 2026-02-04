import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/slug';

async function createCategory(formData: FormData) {
  'use server';

  const name = String(formData.get('name') ?? '').trim();
  const slugInput = String(formData.get('slug') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();

  if (!name) return;

  const slug = slugInput ? slugify(slugInput) : slugify(name);

  await prisma.category.create({
    data: {
      name,
      slug,
      description: description || null,
    },
  });

  redirect('/admin/categories');
}

export default function NewCategoryPage() {
  return (
    <div className="mx-auto w-full max-w-xl rounded-3xl border border-amber-100 bg-white p-8">
      <h1 className="text-2xl font-semibold text-stone-900">Add a category</h1>
      <form action={createCategory} className="mt-6 space-y-4">
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
        <button
          type="submit"
          className="w-full rounded-full bg-stone-900 px-4 py-2 text-sm font-semibold text-white"
        >
          Save category
        </button>
      </form>
    </div>
  );
}
