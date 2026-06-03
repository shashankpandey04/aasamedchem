import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { getSession } from "@/lib/session";
import { getOrderById, type InvoiceStatus, type OrderStatus } from "@/lib/inventory";

type Props = { params: Promise<{ id: string }> };

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

function StatusBadge({ label, styles }: { label: string; styles: string }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${styles}`}>
      {label}
    </span>
  );
}

export default async function InvoicePage({ params }: Props) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();

  if (session.role !== "admin" && order.userId !== session.userId) {
    redirect("/orders");
  }

  const invoiceNumber = `INV-${id.slice(-8).toUpperCase()}`;
  const placedAt = new Date(order.createdAt);
  const backHref = session.role === "admin" ? "/admin/orders" : "/orders";

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-950"
      >
        ← Back to orders
      </Link>

      <div className="mt-4 rounded-3xl border border-slate-200 bg-white shadow-sm">
        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-slate-100 p-6 sm:flex-row sm:items-start sm:justify-between sm:p-8">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">Invoice</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
              {invoiceNumber}
            </h1>
          </div>
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <StatusBadge label={order.invoiceStatus} styles={INVOICE_STATUS_STYLES[order.invoiceStatus]} />
            <StatusBadge label={order.orderStatus} styles={ORDER_STATUS_STYLES[order.orderStatus]} />
          </div>
        </div>

        {/* Meta */}
        <div className="grid gap-6 p-6 sm:grid-cols-2 sm:p-8">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.15em] text-slate-400">Date issued</p>
            <p className="mt-1 text-sm text-slate-700">
              {placedAt.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.15em] text-slate-400">Order ID</p>
            <p className="mt-1 font-mono text-sm text-slate-700">{id}</p>
          </div>
        </div>

        {/* Line items */}
        <div className="px-6 pb-2 sm:px-8">
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">Quantity</th>
                  <th className="px-4 py-3 font-medium">Unit price</th>
                  <th className="px-4 py-3 text-right font-medium">Line total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {order.items.map((item, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3 font-medium text-slate-950">{item.productName}</td>
                    <td className="px-4 py-3 text-slate-700">{item.quantity} {item.unit}</td>
                    <td className="px-4 py-3 text-slate-700">₹{item.unitPrice.toFixed(2)}/{item.unit}</td>
                    <td className="px-4 py-3 text-right font-medium text-slate-950">
                      ₹{item.lineTotal.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Grand total */}
        <div className="flex justify-end p-6 sm:p-8">
          <div className="w-full max-w-xs rounded-2xl bg-slate-50 px-5 py-4">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Subtotal</span>
              <span>₹{order.grandTotal.toFixed(2)}</span>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">
              <span className="font-semibold text-slate-950">Grand total</span>
              <span className="text-lg font-semibold text-slate-950">₹{order.grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
