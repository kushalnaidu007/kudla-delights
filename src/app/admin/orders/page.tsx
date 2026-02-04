import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@/lib/format';

export default async function OrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: { user: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-stone-900">Orders</h1>
        <p className="text-sm text-stone-500">Track fulfillment and payments.</p>
      </div>

      <div className="overflow-hidden rounded-3xl border border-amber-100 bg-white">
        <div className="grid grid-cols-5 gap-4 border-b border-amber-100 px-6 py-3 text-xs font-semibold uppercase text-stone-500">
          <span>Order</span>
          <span>Customer</span>
          <span>Status</span>
          <span>Total</span>
          <span></span>
        </div>
        {orders.length === 0 ? (
          <div className="px-6 py-6 text-sm text-stone-500">No orders yet.</div>
        ) : (
          <div className="divide-y divide-amber-50">
            {orders.map((order) => (
              <div key={order.id} className="grid grid-cols-5 items-center gap-4 px-6 py-4">
                <div>
                  <p className="text-sm font-semibold text-stone-900">{order.id}</p>
                  <p className="text-xs text-stone-500">
                    {order.createdAt.toLocaleDateString('en-GB')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-stone-700">{order.user.name ?? 'Customer'}</p>
                  <p className="text-xs text-stone-500">{order.user.email}</p>
                </div>
                <span className="w-fit rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                  {order.status}
                </span>
                <p className="text-sm font-semibold">
                  {formatCurrency(order.totalPence, order.currency)}
                </p>
                <Link href={`/admin/orders/${order.id}`} className="text-sm font-semibold text-amber-700">
                  View
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
