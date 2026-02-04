import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@/lib/format';

async function updateOrder(orderId: string, formData: FormData) {
  'use server';

  const status = String(formData.get('status') ?? '');
  const shippingCarrier = String(formData.get('shippingCarrier') ?? '').trim();
  const trackingNumber = String(formData.get('trackingNumber') ?? '').trim();

  if (!status) return;

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: status as 'PENDING' | 'PAID' | 'FULFILLING' | 'SHIPPED' | 'FAILED' | 'CANCELED',
      shippingCarrier: shippingCarrier || null,
      trackingNumber: trackingNumber || null,
    },
  });

  redirect(`/admin/orders/${orderId}`);
}

export default async function OrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: true, user: true },
  });

  if (!order) {
    redirect('/admin/orders');
  }

  const updateOrderWithId = updateOrder.bind(null, order.id);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-amber-100 bg-white p-6">
        <h1 className="text-2xl font-semibold text-stone-900">Order {order.id}</h1>
        <p className="text-sm text-stone-500">Placed {order.createdAt.toLocaleDateString('en-GB')}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-amber-100 bg-white p-6">
          <h2 className="text-lg font-semibold text-stone-900">Customer</h2>
          <p className="mt-2 text-sm text-stone-700">{order.user.name ?? 'Customer'}</p>
          <p className="text-sm text-stone-500">{order.user.email}</p>
        </div>

        <div className="rounded-3xl border border-amber-100 bg-white p-6">
          <h2 className="text-lg font-semibold text-stone-900">Payment</h2>
          <p className="mt-2 text-sm text-stone-700">Status: {order.status}</p>
          <p className="text-sm text-stone-500">Stripe session: {order.stripeSessionId ?? '—'}</p>
        </div>
      </div>

      <div className="rounded-3xl border border-amber-100 bg-white p-6">
        <h2 className="text-lg font-semibold text-stone-900">Items</h2>
        <div className="mt-4 space-y-2 text-sm">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between">
              <span>
                {item.name} × {item.quantity}
              </span>
              <span>{formatCurrency(item.pricePence * item.quantity, order.currency)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-1 border-t border-amber-100 pt-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-stone-500">Shipping</span>
            <span>{order.shippingPence === 0 ? 'Free' : formatCurrency(order.shippingPence)}</span>
          </div>
          <div className="flex items-center justify-between font-semibold">
            <span>Total</span>
            <span>{formatCurrency(order.totalPence, order.currency)}</span>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-amber-100 bg-white p-6">
        <h2 className="text-lg font-semibold text-stone-900">Fulfillment</h2>
        <form action={updateOrderWithId} className="mt-4 space-y-4">
          <label className="block text-sm font-medium text-stone-700">
            Status
            <select
              name="status"
              defaultValue={order.status}
              className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-2"
            >
              {['PENDING', 'PAID', 'FULFILLING', 'SHIPPED', 'FAILED', 'CANCELED'].map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium text-stone-700">
            Shipping carrier
            <input
              name="shippingCarrier"
              defaultValue={order.shippingCarrier ?? ''}
              className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-2"
            />
          </label>
          <label className="block text-sm font-medium text-stone-700">
            Tracking number
            <input
              name="trackingNumber"
              defaultValue={order.trackingNumber ?? ''}
              className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-2"
            />
          </label>
          <button
            type="submit"
            className="w-full rounded-full bg-stone-900 px-4 py-2 text-sm font-semibold text-white"
          >
            Update order
          </button>
        </form>
      </div>
    </div>
  );
}
