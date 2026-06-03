"use client";

import { useState } from "react";

import { createOrderAction } from "@/app/actions";
import type { ProductSummary } from "@/lib/inventory";
import { calculateTotalPrice, getAllowedUnits, type Unit } from "@/lib/pricing";

type CartRow = {
  id: number;
  filter: string;
  productName: string;
  quantity: string;
  unit: Unit;
};

type OrderFormProps = {
  products: ProductSummary[];
};

let nextId = 1;

function makeRow(productName: string, unit: Unit): CartRow {
  return { id: nextId++, filter: "", productName, quantity: "1", unit };
}

export function OrderForm({ products }: OrderFormProps) {
  const defaultName = products[0]?.name ?? "";
  const defaultUnit = getAllowedUnits(products[0]?.unit ?? "unit")[0] ?? "unit";

  const [rows, setRows] = useState<CartRow[]>([makeRow(defaultName, defaultUnit)]);

  if (!products.length) {
    return (
      <p className="text-sm text-slate-500">
        No products available. Ask an admin to add products first.
      </p>
    );
  }

  function updateRow(id: number, patch: Partial<Omit<CartRow, "id">>) {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const updated = { ...r, ...patch };
        if (patch.productName && patch.productName !== r.productName) {
          const p = products.find((p) => p.name === patch.productName);
          updated.unit = p ? getAllowedUnits(p.unit)[0] : "unit";
        }
        return updated;
      }),
    );
  }

  function handleFilterChange(id: number, value: string) {
    const trimmed = value.trim().toLowerCase();
    const patch: Partial<Omit<CartRow, "id">> = { filter: value };
    if (trimmed) {
      const match = products.find((p) => p.name.toLowerCase().includes(trimmed));
      if (match) {
        patch.productName = match.name;
        patch.unit = getAllowedUnits(match.unit)[0];
      }
    }
    updateRow(id, patch);
  }

  function addRow() {
    const p = products[0];
    setRows((prev) => [
      ...prev,
      makeRow(p?.name ?? defaultName, p ? getAllowedUnits(p.unit)[0] : defaultUnit),
    ]);
  }

  function removeRow(id: number) {
    setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev));
  }

  function lineTotal(row: CartRow): number | null {
    const p = products.find((p) => p.name === row.productName);
    const q = row.quantity.trim() === "" ? NaN : Number(row.quantity);
    if (!p || !Number.isFinite(q) || q <= 0) return null;
    return calculateTotalPrice(p.price, p.unit, q, row.unit);
  }

  const grand = rows.reduce<number | null>((acc, row) => {
    const lt = lineTotal(row);
    if (lt === null) return null;
    return (acc ?? 0) + lt;
  }, 0);

  const cartPayload = rows.map((r) => ({
    productName: r.productName,
    quantity: Number(r.quantity),
    unit: r.unit,
  }));

  return (
    <form action={createOrderAction} className="grid gap-4">
      <input type="hidden" name="items" value={JSON.stringify(cartPayload)} />

      {/* Cart rows */}
      <div className="grid gap-3">
        {rows.map((row, idx) => {
          const p = products.find((p) => p.name === row.productName);
          const unitOptions = p ? getAllowedUnits(p.unit) : (["unit"] as const);
          const lt = lineTotal(row);

          const filteredProducts =
            row.filter.trim()
              ? products.filter((p) =>
                  p.name.toLowerCase().includes(row.filter.trim().toLowerCase()),
                )
              : products;
          const visibleProducts = filteredProducts.length > 0 ? filteredProducts : products;

          return (
            <div key={row.id} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
                  Item {idx + 1}
                </span>
                {rows.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRow(row.id)}
                    className="text-xs font-medium text-rose-500 transition hover:text-rose-700"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {/* Per-row filter */}
                <div className="grid gap-1 sm:col-span-3">
                  <label className="text-xs font-medium text-slate-500">Search</label>
                  <input
                    type="text"
                    value={row.filter}
                    onChange={(e) => handleFilterChange(row.id, e.target.value)}
                    placeholder="Type to filter products…"
                    className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                  />
                </div>

                {/* Product */}
                <div className="grid gap-1 sm:col-span-3">
                  <label className="text-xs font-medium text-slate-500">
                    Product
                    {filteredProducts.length !== products.length && (
                      <span className="ml-1.5 font-normal text-slate-400">
                        {filteredProducts.length} of {products.length}
                      </span>
                    )}
                  </label>
                  <select
                    value={
                      visibleProducts.some((p) => p.name === row.productName)
                        ? row.productName
                        : visibleProducts[0]?.name ?? ""
                    }
                    onChange={(e) => updateRow(row.id, { productName: e.target.value })}
                    className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
                  >
                    {visibleProducts.map((prod) => (
                      <option key={prod.name} value={prod.name}>
                        {prod.name} — ₹{prod.price}/{prod.unit}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quantity */}
                <div className="grid gap-1">
                  <label className="text-xs font-medium text-slate-500">Quantity</label>
                  <input
                    type="number"
                    min="0.001"
                    step="0.001"
                    value={row.quantity}
                    onChange={(e) => updateRow(row.id, { quantity: e.target.value })}
                    className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                  />
                </div>

                {/* Unit */}
                <div className="grid gap-1">
                  <label className="text-xs font-medium text-slate-500">Unit</label>
                  <select
                    value={row.unit}
                    onChange={(e) => updateRow(row.id, { unit: e.target.value as Unit })}
                    className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
                  >
                    {unitOptions.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Line total */}
                <div className="grid gap-1">
                  <label className="text-xs font-medium text-slate-500">Line total</label>
                  <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-950">
                    {lt === null ? <span className="text-slate-400">—</span> : `₹${lt.toFixed(2)}`}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add item */}
      <button
        type="button"
        onClick={addRow}
        className="inline-flex items-center justify-center gap-1.5 rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
      >
        + Add item
      </button>

      {/* Grand total + submit */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-600">Grand total</span>
          <span className="text-base font-semibold text-slate-950">
            {grand === null ? (
              <span className="text-sm font-normal text-slate-400">Check quantities</span>
            ) : (
              `₹${grand.toFixed(2)}`
            )}
          </span>
        </div>

        <button
          type="submit"
          disabled={grand === null || grand === 0}
          className="mt-4 w-full inline-flex items-center justify-center rounded-full bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-40"
        >
          Place order
        </button>
      </div>
    </form>
  );
}
