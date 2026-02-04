import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@/lib/format';
import { sendOrderEmail } from '@/lib/email';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET ?? '',
    );
  } catch (error) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    if (session.metadata?.orderId) {
      const existing = await prisma.order.findUnique({
        where: { id: session.metadata.orderId },
        include: { items: true, user: true },
      });

      if (!existing || existing.status === 'PAID') {
        return NextResponse.json({ received: true });
      }

      const order = await prisma.order.update({
        where: { id: session.metadata.orderId },
        data: {
          status: 'PAID',
          stripePaymentIntentId: session.payment_intent?.toString() ?? null,
        },
        include: { items: true, user: true },
      });

      await prisma.$transaction(
        order.items.map((item) =>
          prisma.product.update({
            where: { id: item.productId },
            data: { inventoryCount: { decrement: item.quantity } },
          }),
        ),
      );

      if (order.user.email) {
        const itemsHtml = order.items
          .map(
            (item) =>
              `<tr><td style=\"padding:4px 0;\">${item.name} × ${item.quantity}</td><td style=\"padding:4px 0;text-align:right;\">${formatCurrency(
                item.pricePence * item.quantity,
                order.currency,
              )}</td></tr>`,
          )
          .join('');

        const html = `\n          <div style=\"font-family:Arial,sans-serif;font-size:14px;color:#1c1917;\">\n            <h2 style=\"margin:0 0 8px;\">Thanks for your order!</h2>\n            <p style=\"margin:0 0 12px;\">We received your order and will start packing your snacks.</p>\n            <table style=\"width:100%;border-collapse:collapse;\">\n              ${itemsHtml}\n              <tr><td style=\"padding-top:8px;border-top:1px solid #eee;\">Shipping</td><td style=\"padding-top:8px;border-top:1px solid #eee;text-align:right;\">${\n                order.shippingPence === 0\n                  ? 'Free'\n                  : formatCurrency(order.shippingPence, order.currency)\n              }</td></tr>\n              <tr><td style=\"padding-top:6px;font-weight:bold;\">Total</td><td style=\"padding-top:6px;font-weight:bold;text-align:right;\">${formatCurrency(\n                order.totalPence,\n                order.currency,\n              )}</td></tr>\n            </table>\n            <p style=\"margin-top:12px;\">Order ID: ${order.id}</p>\n          </div>\n        `;\n\n        await sendOrderEmail({\n          to: order.user.email,\n          subject: 'Your Kudla Delights order confirmation',\n          html,\n        });\n      }\n     }
  }
  }

  return NextResponse.json({ received: true });
}
