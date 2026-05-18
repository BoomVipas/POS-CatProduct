"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { useCart, useCartDispatch } from "@/lib/pos/cart-store";
import { getCombinedUpsells } from "@/lib/pos/upsell";
import { useT } from "@/lib/i18n/provider";
import { formatTHB } from "@/lib/money/format";
import type { Product } from "@/lib/pos/types";

const MAX_VISIBLE = 3;

export function UpsellPrompt({ products }: { products: Product[] }) {
  const cart = useCart();
  const dispatch = useCartDispatch();
  const { t } = useT();

  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const cartIds = useMemo(
    () => new Set(cart.lines.map((l) => l.productId)),
    [cart.lines],
  );

  const cartProducts = useMemo(() => {
    const idx = new Map(products.map((p) => [p.id, p]));
    return cart.lines
      .map((l) => idx.get(l.productId))
      .filter((p): p is Product => p !== undefined);
  }, [cart.lines, products]);

  const suggestions = useMemo(() => {
    if (cartProducts.length === 0) return [];
    const exclude = new Set([...cartIds, ...dismissedIds]);
    return getCombinedUpsells(cartProducts, products, {
      excludeIds: exclude,
      max: MAX_VISIBLE,
    });
  }, [cartProducts, products, cartIds, dismissedIds]);

  // When the cart fully clears, also clear dismissals so a fresh sale can
  // see the same suggestions again.
  useEffect(() => {
    if (cart.lines.length === 0 && dismissedIds.size > 0) {
      setDismissedIds(new Set());
    }
  }, [cart.lines.length, dismissedIds.size]);

  if (suggestions.length === 0) return null;

  return (
    <div className="panel-quiet border-gold-soft bg-gold-soft/25 p-3">
      <p className="kicker">★ {t.pos.upsellHeader}</p>
      <ul className="mt-2 grid gap-2">
        {suggestions.map((p) => (
          <li
            key={p.id}
            className="flex items-center justify-between gap-2 rounded-[var(--radius-md)] border border-line bg-panel-strong px-3 py-2"
          >
            <div className="min-w-0">
              <p className="mono text-[10px] text-muted">{p.sku}</p>
              <p className="headline-upright line-clamp-1 text-sm text-text">
                {p.name}
              </p>
              <p className="mono num text-xs text-muted">
                +{formatTHB(p.price_satang)} THB
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() =>
                  dispatch({ type: "ADD", productId: p.id })
                }
                className="btn-accent btn-sm"
              >
                {t.pos.upsellAdd}
              </button>
              <button
                type="button"
                onClick={() =>
                  setDismissedIds((s) => new Set(s).add(p.id))
                }
                aria-label="Dismiss suggestion"
                className="grid h-6 w-6 place-items-center self-end rounded-full bg-soft text-muted hover:text-text"
              >
                <X size={12} />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
