import { redirect } from "next/navigation";

import { OrderForm } from "@/components/order-form";
import { getSession } from "@/lib/session";
import { getProducts } from "@/lib/inventory";

type QueryValue = string | string[] | undefined;
type OrderPageProps = { searchParams: Promise<{ saved?: QueryValue; error?: QueryValue }> };

function readQueryValue(value: QueryValue) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function OrderPage({ searchParams }: OrderPageProps) {
  const session = await getSession();
  if (!session) redirect("/login");

  const params = await searchParams;
  const products = await getProducts();
  const saved = readQueryValue(params.saved);
  const error = readQueryValue(params.error);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Order</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
          Place a new order
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Add one or more products, choose quantities and units, then place the order.
        </p>
      </section>

      {saved ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Order placed successfully.
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          Could not place the order. Check your items and try again.
        </div>
      ) : null}

      <OrderForm products={products} />
    </main>
  );
}
