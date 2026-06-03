import Link from "next/link";
import { redirect } from "next/navigation";

import { getSession } from "@/lib/session";
import { getOrders, getProducts } from "@/lib/inventory";

export default async function AdminPage() {
  const session = await getSession();

  if (!session || session.role !== "admin") {
    redirect("/login");
  }

  const [products, orders] = await Promise.all([getProducts(), getOrders()]);

  const stats = [
    { label: "Products", value: products.length, href: "/admin/products" },
    { label: "Orders", value: orders.length, href: "/admin/orders" },
  ];

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="rounded-3xl border border-slate-200 bg-white px-5 py-6 shadow-sm sm:px-8">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Admin</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
          Welcome back, {session.name}
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Manage products and orders from the pages below.
        </p>
      </header>

      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        {stats.map(({ label, value, href }) => (
          <Link
            key={label}
            href={href}
            className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-400"
          >
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">{value}</p>
            <p className="mt-3 text-xs font-medium text-slate-400 transition group-hover:text-slate-600">
              Manage {label.toLowerCase()} →
            </p>
          </Link>
        ))}
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        <Link
          href="/admin/products"
          className="inline-flex items-center justify-center rounded-full bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Manage products
        </Link>
        <Link
          href="/admin/orders"
          className="inline-flex items-center justify-center rounded-full border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          View orders
        </Link>
        <Link
          href="/order"
          className="inline-flex items-center justify-center rounded-full border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Place order
        </Link>
      </section>
    </main>
  );
}
