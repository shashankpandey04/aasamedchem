import Link from "next/link";
import { redirect } from "next/navigation";

import { getSession } from "@/lib/session";
import { getProducts } from "@/lib/inventory";

export default async function UserPage() {
  const session = await getSession();

  if (!session || session.role !== "user") {
    redirect("/login");
  }

  const products = await getProducts();
  const featuredProducts = products.slice(0, 3);

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="rounded-3xl border border-slate-200 bg-white px-5 py-6 shadow-sm sm:px-8">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
          User dashboard
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
          Welcome back, {session.name}
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Browse products and place orders from here.
        </p>
      </header>

      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Role</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">User</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Products</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{products.length}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Action</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">Order ready</p>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
              Featured products
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Quick view</h2>
          </div>
          <div className="flex gap-3">
            <Link
              href="/order"
              className="text-sm font-medium text-slate-700 underline decoration-slate-300 underline-offset-4"
            >
              Place an order
            </Link>
            <Link
              href="/orders"
              className="text-sm font-medium text-slate-700 underline decoration-slate-300 underline-offset-4"
            >
              View all orders
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {featuredProducts.map((product) => (
            <article
              key={product.name}
              className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Product
              </p>
              <h3 className="mt-3 text-xl font-semibold text-slate-950">{product.name}</h3>
              <p className="mt-2 text-sm text-slate-600">
                ₹{product.price} per {product.unit}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
          User actions
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
            Place an order using the supported units.
          </div>
          <div className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
            See prices and units before you order.
          </div>
          <div className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
            Admin tools stay hidden from this dashboard.
          </div>
        </div>
      </section>
    </main>
  );
}
