import Link from "next/link";
import { redirect } from "next/navigation";

import { getSession } from "@/lib/session";
import { getOrders, type InvoiceStatus, type OrderStatus } from "@/lib/inventory";

const ORDER_STATUS_STYLES: Record<OrderStatus, string> = {
  processing: "bg-amber-50 text-amber-700 border-amber-200",
  "in transit": "bg-blue-50 text-blue-700 border-blue-200",
  shipped: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-rose-50 text-rose-700 border-rose-200",
};

const INVOICE_STATUS_STYLES: Record<InvoiceStatus, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-rose-50 text-rose-700 border-rose-200",
};

export default async function OrdersPage() {
  const session = await getSession();
  if (!session || session.role !== "user") redirect("/login");

  const orders = await getOrders(session.userId);

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="rounded-3xl border border-slate-200 bg-white px-5 py-6 shadow-sm sm:px-8">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">My orders</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Order history</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">All orders placed by you, newest first.</p>
      </header>

      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        {orders.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm font-medium text-slate-500">No orders yet</p>
            <p className="mt-2 text-sm text-slate-400">Place your first order to see it here.</p>
            <Link
              href="/order"
              className="mt-5 inline-flex items-center justify-center rounded-full bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Place order
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Items</th>
                  <th className="px-4 py-3 font-medium">Grand total</th>
                  <th className="px-4 py-3 font-medium">Order status</th>
                  <th className="px-4 py-3 font-medium">Invoice status</th>
                  <th className="px-4 py-3 font-medium">Placed at</th>
                  <th className="px-4 py-3 font-medium">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white text-slate-700">
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        {order.items.map((item, i) => (
                          <span key={i} className="text-slate-700">
                            <span className="font-medium text-slate-950">{item.productName}</span>
                            {" · "}{item.quantity} {item.unit}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-950">
                      ₹{order.grandTotal.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${ORDER_STATUS_STYLES[order.orderStatus]}`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${INVOICE_STATUS_STYLES[order.invoiceStatus]}`}>
                        {order.invoiceStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(order.createdAt).toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/invoice/${order.id}`}
                        className="inline-flex items-center justify-center rounded-full border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
