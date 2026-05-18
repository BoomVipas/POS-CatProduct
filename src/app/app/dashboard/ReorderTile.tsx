import Link from "next/link";
import type { Product } from "@/lib/pos/types";

export function ReorderTile({ catalog }: { catalog: Product[] }) {
  const flagged = catalog
    .filter((p) => p.is_active)
    .filter(
      (p) =>
        typeof p.reorder_point === "number" &&
        p.reorder_point > 0 &&
        p.current_qty <= p.reorder_point,
    )
    .sort((a, b) => a.current_qty - b.current_qty);

  if (flagged.length === 0) return null;

  return (
    <div className="panel-quiet border-l-2 border-line-strong px-5 py-4">
      <div className="flex items-baseline justify-between gap-3">
        <p className="kicker">Reorder needed</p>
        <span className="chip chip-warn">
          <span className="num">{flagged.length}</span>{" "}
          product{flagged.length === 1 ? "" : "s"}
        </span>
      </div>
      <table className="tbl mt-3">
        <thead>
          <tr>
            <th>SKU</th>
            <th>Product</th>
            <th className="text-right">On hand / Reorder</th>
          </tr>
        </thead>
        <tbody>
          {flagged.slice(0, 6).map((p) => (
            <tr key={p.id}>
              <td>
                <span className="mono num text-[11px] font-semibold text-muted">
                  {p.sku}
                </span>
              </td>
              <td>
                <span className="line-clamp-1 font-semibold text-text">
                  {p.name}
                </span>
              </td>
              <td className="mono num text-right font-semibold text-accent-deep">
                {p.current_qty} / {p.reorder_point}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {flagged.length > 6 && (
        <p className="mt-2 text-[11px] text-muted">
          +{flagged.length - 6} more below reorder point.
        </p>
      )}
      <Link
        href="/app/setup/products"
        className="btn-link mt-3 inline-block text-xs"
      >
        Manage catalog →
      </Link>
    </div>
  );
}
