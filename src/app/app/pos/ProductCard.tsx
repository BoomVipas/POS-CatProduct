"use client";

import { formatTHB } from "@/lib/money/format";
import { useT } from "@/lib/i18n/provider";
import type { Product } from "@/lib/pos/types";

export function ProductCard({
  product,
  remaining,
  onAdd,
  onPreOrder,
}: {
  product: Product;
  remaining: number;
  onAdd: () => void;
  /** Called when staff taps a sold-out product. If omitted, sold-out is just disabled. */
  onPreOrder?: (product: Product) => void;
}) {
  const { t } = useT();
  const soldout = remaining <= 0;
  const low = remaining > 0 && remaining <= 5;

  const stockChip = soldout
    ? "chip chip-danger"
    : low
      ? "chip chip-warn"
      : "chip chip-ok";

  const handleClick = () => {
    if (soldout) {
      onPreOrder?.(product);
    } else {
      onAdd();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={soldout && !onPreOrder}
      className="panel-quiet group grid gap-2 p-2 text-left transition hover:-translate-y-px hover:shadow-[var(--shadow-card)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none"
    >
      <div className="relative grid aspect-[5/1.95] place-items-center overflow-hidden rounded-[var(--radius-md)] border border-line-soft bg-soft">
        {product.image_path ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image_path}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="headline-upright px-3 text-center text-sm text-accent-strong">
            {product.name}
          </span>
        )}
        <span className="mono absolute left-2 top-2 rounded-full border border-line-soft bg-panel-strong/90 px-2 py-0.5 text-[10px] font-semibold text-muted">
          {product.sku}
        </span>
        <span className={`${stockChip} absolute right-2 top-2`}>
          {soldout
            ? onPreOrder
              ? `★ ${t.preOrders.soldOutCta}`
              : "sold out"
            : (
                <span className="num">{remaining}</span>
              )}
        </span>
      </div>
      <div className="flex items-baseline justify-between gap-2 px-1 pt-0.5">
        <span className="headline-upright line-clamp-2 text-base leading-tight text-text">
          {product.name}
        </span>
        <span className="mono num shrink-0 text-lg font-semibold text-accent-strong">
          {formatTHB(product.price_satang)}
        </span>
      </div>
    </button>
  );
}
