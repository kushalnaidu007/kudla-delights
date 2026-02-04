import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@/lib/format';

export default async function AccountPage() {
  const session = await getSession();

  if (!session?.user?.id) {
    return null;
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: { items: true },
  });

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-amber-100 bg-white p-8">
        <h1 className="text-2xl font-semibold text-stone-900">Your account</h1>
        <p className="mt-2 text-sm text-stone-500">{session.user.email}</p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-stone-900">Orders</h2>
        {orders.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-amber-200 bg-white p-8 text-sm text-stone-500">
            No orders yet.
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="rounded-3xl border border-amber-100 bg-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-stone-500">Order</p>
                    <p className="text-sm font-semibold text-stone-900">{order.id}</p>
                  </div>
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                    {order.status}
                  </span>
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <span>
                        {item.name} × {item.quantity}
                      </span>
                      <span>{formatCurrency(item.pricePence * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-amber-100 pt-3 text-sm">
                  <span className="text-stone-500">Shipping</span>
                  <span className="font-semibold">
                    {order.shippingPence === 0
                      ? 'Free'
                      : formatCurrency(order.shippingPence, order.currency)}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm font-semibold">
                  <span>Total</span>
                  <span>{formatCurrency(order.totalPence, order.currency)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
