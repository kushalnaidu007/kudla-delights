import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const bodySchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Auth required' }, { status: 401 });
  }

  const body = bodySchema.parse(await req.json());
  const product = await prisma.product.findUnique({ where: { id: body.productId } });
  if (!product || !product.active) {
    return NextResponse.json({ error: 'Product unavailable' }, { status: 400 });
  }

  const cart = await prisma.cart.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id },
    update: {},
  });

  const existing = await prisma.cartItem.findUnique({
    where: { cartId_productId: { cartId: cart.id, productId: product.id } },
  });

  const quantity = existing ? existing.quantity + body.quantity : body.quantity;

  await prisma.cartItem.upsert({
    where: { cartId_productId: { cartId: cart.id, productId: product.id } },
    create: {
      cartId: cart.id,
      productId: product.id,
      name: product.name,
      pricePence: product.pricePence,
      quantity,
    },
    update: {
      quantity,
      name: product.name,
      pricePence: product.pricePence,
    },
  });

  const updated = await prisma.cart.findUnique({
    where: { id: cart.id },
    include: { items: true },
  });

  return NextResponse.json({ items: updated?.items ?? [] });
}
