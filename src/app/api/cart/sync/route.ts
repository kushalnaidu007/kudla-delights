import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const itemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
});

const bodySchema = z.object({
  items: z.array(itemSchema),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ items: [] });
  }

  const body = bodySchema.parse(await req.json());
  const cart = await prisma.cart.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id },
    update: {},
  });

  const productIds = body.items.map((item) => item.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, active: true },
  });
  const productMap = new Map(products.map((product) => [product.id, product]));

  for (const item of body.items) {
    const product = productMap.get(item.productId);
    if (!product) continue;

    await prisma.cartItem.upsert({
      where: { cartId_productId: { cartId: cart.id, productId: product.id } },
      create: {
        cartId: cart.id,
        productId: product.id,
        name: product.name,
        pricePence: product.pricePence,
        quantity: item.quantity,
      },
      update: {
        quantity: item.quantity,
        name: product.name,
        pricePence: product.pricePence,
      },
    });
  }

  const updated = await prisma.cart.findUnique({
    where: { id: cart.id },
    include: { items: true },
  });

  return NextResponse.json({ items: updated?.items ?? [] });
}
