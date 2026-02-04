import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';
import { getStripe } from '@/lib/stripe';
import { calculateShippingPence, SHIPPING_CONFIG } from '@/lib/shipping';

const itemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
});

const bodySchema = z.object({
  items: z.array(itemSchema).min(1),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  try {
    const body = bodySchema.parse(await req.json());

    const productIds = body.items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, active: true },
      include: { images: { orderBy: { position: 'asc' } } },
    });

    const productMap = new Map(products.map((product) => [product.id, product]));

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    let subtotalPence = 0;

    for (const item of body.items) {
      const product = productMap.get(item.productId);
      if (!product) {
        return NextResponse.json({ error: 'Product unavailable.' }, { status: 400 });
      }
      if (item.quantity > product.inventoryCount) {
        return NextResponse.json({ error: 'Insufficient inventory.' }, { status: 400 });
      }

      subtotalPence += product.pricePence * item.quantity;

      const primaryImage = product.images?.[0]?.url ?? undefined;

      lineItems.push({
        quantity: item.quantity,
        price_data: {
          currency: product.currency,
          unit_amount: product.pricePence,
          product_data: {
            name: product.name,
            description: product.description ?? undefined,
            images: primaryImage ? [primaryImage] : undefined,
          },
        },
      });
    }

    const shippingPence = calculateShippingPence(subtotalPence);
    const totalPence = subtotalPence + shippingPence;

    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        totalPence,
        shippingPence,
        currency: 'GBP',
        items: {
          create: body.items.map((item) => {
            const product = productMap.get(item.productId)!;
            return {
              productId: product.id,
              name: product.name,
              pricePence: product.pricePence,
              quantity: item.quantity,
            };
          }),
        },
      },
    });

    const appUrl = process.env.APP_URL ?? 'http://localhost:3000';
    const lineItemsWithShipping = [...lineItems];
    if (shippingPence > 0) {
      lineItemsWithShipping.push({
        quantity: 1,
        price_data: {
          currency: SHIPPING_CONFIG.currency,
          unit_amount: shippingPence,
          product_data: {
            name: 'UK Shipping',
          },
        },
      });
    }

    const stripe = getStripe();
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItemsWithShipping,
      success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/checkout/cancel`,
      customer_email: session.user.email ?? undefined,
      shipping_address_collection: { allowed_countries: ['GB'] },
      custom_text: {
        submit: {
          message: 'Packed fresh from Kudla Delights.',
        },
      },
      metadata: {
        orderId: order.id,
        userId: session.user.id,
      },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: checkoutSession.id },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    return NextResponse.json({ error: 'Unable to start checkout.' }, { status: 400 });
  }
}
