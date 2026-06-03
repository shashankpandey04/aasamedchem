import { redirect } from "next/navigation";

import { AdminOrdersTable } from "@/components/admin-orders-table";
import { getSession } from "@/lib/session";
import { getOrders } from "@/lib/inventory";

export default async function AdminOrdersPage() {
  const session = await getSession();

  if (!session || session.role !== "admin") {
    redirect("/login");
  }

  const orders = await getOrders();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="rounded-3xl border border-slate-200 bg-white px-5 py-6 shadow-sm sm:px-8">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
          Admin · Orders
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
          All orders
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Review and delete orders placed by all users.
        </p>
      </header>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-slate-950">Orders</h2>
          <span className="text-sm text-slate-500">{orders.length} total</span>
        </div>
        <AdminOrdersTable orders={orders} />
      </section>
    </main>
  );
}
