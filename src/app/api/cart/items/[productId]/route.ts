import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const bodySchema = z.object({
  quantity: z.number().int().min(0),
});

export async function PATCH(
  req: Request,
  { params }: { params: { productId: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Auth required' }, { status: 401 });
  }

  const { quantity } = bodySchema.parse(await req.json());
  const cart = await prisma.cart.findUnique({ where: { userId: session.user.id } });
  if (!cart) return NextResponse.json({ items: [] });

  if (quantity === 0) {
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id, productId: params.productId },
    });
  } else {
    await prisma.cartItem.updateMany({
      where: { cartId: cart.id, productId: params.productId },
      data: { quantity },
    });
  }

  const updated = await prisma.cart.findUnique({
    where: { id: cart.id },
    include: { items: true },
  });

  return NextResponse.json({ items: updated?.items ?? [] });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { productId: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Auth required' }, { status: 401 });
  }

  const cart = await prisma.cart.findUnique({ where: { userId: session.user.id } });
  if (!cart) return NextResponse.json({ items: [] });

  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id, productId: params.productId },
  });

  const updated = await prisma.cart.findUnique({
    where: { id: cart.id },
    include: { items: true },
  });

  return NextResponse.json({ items: updated?.items ?? [] });
}
