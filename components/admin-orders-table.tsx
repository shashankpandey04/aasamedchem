"use client";

import Link from "next/link";

import {
  deleteOrderAction,
  updateInvoiceStatusAction,
  updateOrderStatusAction,
} from "@/app/actions";
import type { InvoiceStatus, OrderStatus, OrderSummary } from "@/lib/inventory";

type Props = { orders: OrderSummary[] };

const ORDER_STATUSES: OrderStatus[] = ["processing", "in transit", "shipped", "cancelled"];
const INVOICE_STATUSES: InvoiceStatus[] = ["pending", "paid", "cancelled"];

const ORDER_STATUS_STYLES: Record<OrderStatus, string> = {
  processing: "text-amber-700 bg-amber-50 border-amber-200",
  "in transit": "text-blue-700 bg-blue-50 border-blue-200",
  shipped: "text-emerald-700 bg-emerald-50 border-emerald-200",
  cancelled: "text-rose-700 bg-rose-50 border-rose-200",
};

const INVOICE_STATUS_STYLES: Record<InvoiceStatus, string> = {
  pending: "text-amber-700 bg-amber-50 border-amber-200",
  paid: "text-emerald-700 bg-emerald-50 border-emerald-200",
  cancelled: "text-rose-700 bg-rose-50 border-rose-200",
};

export function AdminOrdersTable({ orders }: Props) {
  if (!orders.length) {
    return <p className="mt-4 text-sm text-slate-500">No orders yet.</p>;
  }

  return (
    <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="px-4 py-3 font-medium">Items</th>
            <th className="px-4 py-3 font-medium">Grand total</th>
            <th className="px-4 py-3 font-medium">Order status</th>
            <th className="px-4 py-3 font-medium">Invoice status</th>
            <th className="px-4 py-3 font-medium">Placed at</th>
            <th className="px-4 py-3 font-medium">Actions</th>
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

              {/* Order status */}
              <td className="px-4 py-3">
                <form action={updateOrderStatusAction}>
                  <input type="hidden" name="id" value={order.id} />
                  <select
                    name="orderStatus"
                    defaultValue={order.orderStatus}
                    onChange={(e) => {
                      const form = e.currentTarget.closest("form") as HTMLFormElement;
                      form.requestSubmit();
                    }}
                    className={`rounded-full border px-2.5 py-1 text-xs font-medium capitalize outline-none ${ORDER_STATUS_STYLES[order.orderStatus]}`}
                  >
                    {ORDER_STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </form>
              </td>

              {/* Invoice status */}
              <td className="px-4 py-3">
                <form action={updateInvoiceStatusAction}>
                  <input type="hidden" name="id" value={order.id} />
                  <select
                    name="invoiceStatus"
                    defaultValue={order.invoiceStatus}
                    onChange={(e) => {
                      const form = e.currentTarget.closest("form") as HTMLFormElement;
                      form.requestSubmit();
                    }}
                    className={`rounded-full border px-2.5 py-1 text-xs font-medium capitalize outline-none ${INVOICE_STATUS_STYLES[order.invoiceStatus]}`}
                  >
                    {INVOICE_STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </form>
              </td>

              <td className="px-4 py-3 text-slate-500">
                {new Date(order.createdAt).toLocaleString("en-IN")}
              </td>

              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <Link
                    href={`/invoice/${order.id}`}
                    className="inline-flex items-center justify-center rounded-full border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    Invoice
                  </Link>
                  <form action={deleteOrderAction}>
                    <input type="hidden" name="id" value={order.id} />
                    <button
                      type="submit"
                      onClick={(e) => {
                        if (!confirm("Delete this order? This cannot be undone.")) {
                          e.preventDefault();
                        }
                      }}
                      className="inline-flex items-center justify-center rounded-full border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-700 transition hover:bg-rose-50"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
