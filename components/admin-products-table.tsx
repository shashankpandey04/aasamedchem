"use client";

import { useState } from "react";

import { deleteProductAction, updateProductAction } from "@/app/actions";
import type { ProductSummary } from "@/lib/inventory";
import { ALL_UNITS } from "@/lib/pricing";

type Props = { products: ProductSummary[] };

export function AdminProductsTable({ products }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);

  if (!products.length) {
    return <p className="mt-4 text-sm text-slate-500">No products yet.</p>;
  }

  return (
    <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">Price</th>
            <th className="px-4 py-3 font-medium">Unit</th>
            <th className="px-4 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white text-slate-700">
          {products.map((product) =>
            editingId === product.id ? (
              <tr key={product.id} className="bg-slate-50">
                <td colSpan={4} className="px-4 py-3">
                  <form
                    action={updateProductAction}
                    className="flex flex-wrap items-end gap-3"
                  >
                    <input type="hidden" name="id" value={product.id} />

                    <div className="grid gap-1">
                      <label className="text-xs font-medium text-slate-500">Name</label>
                      <input
                        name="name"
                        defaultValue={product.name}
                        required
                        className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                      />
                    </div>

                    <div className="grid gap-1">
                      <label className="text-xs font-medium text-slate-500">Price (₹)</label>
                      <input
                        name="price"
                        type="number"
                        min="0.01"
                        step="0.01"
                        defaultValue={product.price}
                        required
                        className="w-28 rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                      />
                    </div>

                    <div className="grid gap-1">
                      <label className="text-xs font-medium text-slate-500">Unit</label>
                      <select
                        name="unit"
                        defaultValue={product.unit}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
                      >
                        {ALL_UNITS.map((u) => (
                          <option key={u} value={u}>{u}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="inline-flex items-center justify-center rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="inline-flex items-center justify-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </td>
              </tr>
            ) : (
              <tr key={product.id}>
                <td className="px-4 py-3 font-medium text-slate-950">{product.name}</td>
                <td className="px-4 py-3">₹{product.price}</td>
                <td className="px-4 py-3">{product.unit}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingId(product.id)}
                      className="inline-flex items-center justify-center rounded-full border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      Edit
                    </button>
                    <form action={deleteProductAction}>
                      <input type="hidden" name="id" value={product.id} />
                      <button
                        type="submit"
                        onClick={(e) => {
                          if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) {
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
            ),
          )}
        </tbody>
      </table>
    </div>
  );
}
