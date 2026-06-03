import { redirect } from "next/navigation";

import { createProductAction } from "@/app/actions";
import { AdminProductsTable } from "@/components/admin-products-table";
import { getSession } from "@/lib/session";
import { getProducts } from "@/lib/inventory";

type QueryValue = string | string[] | undefined;

type Props = {
  searchParams: Promise<{ saved?: QueryValue; error?: QueryValue }>;
};

function readQueryValue(value: QueryValue) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function AdminProductsPage({ searchParams }: Props) {
  const session = await getSession();

  if (!session || session.role !== "admin") {
    redirect("/login");
  }

  const products = await getProducts();
  const params = await searchParams;
  const saved = readQueryValue(params.saved);
  const error = readQueryValue(params.error);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="rounded-3xl border border-slate-200 bg-white px-5 py-6 shadow-sm sm:px-8">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
          Admin · Products
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
          Manage products
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Create, edit, and delete products.
        </p>
      </header>

      {saved ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Product saved.
        </div>
      ) : null}

      {error === "invalid-product" ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          Invalid product details. Check all fields and try again.
        </div>
      ) : error === "duplicate-product" ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          A product with that name already exists.
        </div>
      ) : null}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-xl font-semibold text-slate-950">Create product</h2>

        <form action={createProductAction} className="mt-5 grid gap-4 sm:grid-cols-3">
          <input
            name="name"
            placeholder="Product name"
            required
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
          />
          <input
            name="price"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="Price (₹)"
            required
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
          />
          <select
            name="unit"
            defaultValue="kg"
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
          >
            <option value="kg">kg</option>
            <option value="g">g</option>
            <option value="L">L</option>
            <option value="mL">mL</option>
            <option value="unit">unit</option>
          </select>

          <div className="sm:col-span-3">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Save product
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-slate-950">All products</h2>
          <span className="text-sm text-slate-500">{products.length} total</span>
        </div>
        <AdminProductsTable products={products} />
      </section>
    </main>
  );
}
