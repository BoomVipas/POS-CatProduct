"use client";

import { CartProvider } from "@/lib/pos/cart-store";
import { useDemoCatalog } from "@/lib/demo/useDemoCatalog";
import type { Product } from "@/lib/pos/types";
import { ProductGrid } from "./ProductGrid";
import { CartPanel } from "./CartPanel";
import { formatDateTimeTH } from "@/lib/date";

/**
 * The POS workspace uses, in priority order:
 *  1. Live demo catalog from /app/setup/products (localStorage), if non-empty.
 *  2. The bundled mockProducts (`fallbackProducts`).
 * When DD-65 lands, the page will fetch real Supabase rows on the server and
 * pass them as `fallbackProducts`; the demo-catalog override goes away.
 */
export function POSWorkspace({
  fallbackProducts,
}: {
  fallbackProducts: Product[];
}) {
  const { items, ready } = useDemoCatalog();
  const activeDemo = ready ? items.filter((p) => p.is_active) : [];
  const products = activeDemo.length > 0 ? activeDemo : fallbackProducts;
  const today = formatDateTimeTH(new Date().toISOString()).split(",")[0] ?? "";

  return (
    <CartProvider>
      <div className="mx-auto max-w-[96rem] px-3 py-4 lg:px-5">
        <header className="mb-4 flex flex-wrap items-end justify-between gap-3 border-b border-line pb-3">
          <div className="min-w-0">
            {/* TODO i18n: workspace header labels (not in pos dict) */}
            <p className="kicker">Point of Sale</p>
            <h1 className="headline-upright mt-1 text-2xl text-accent-deep">
              Booth workspace
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="mono num text-xs text-muted">{today}</span>
            <span className="chip chip-gold">Demo</span>
          </div>
        </header>

        <div className="flex gap-5">
          <div className="min-w-0 flex-1 pb-[40dvh] lg:pb-0">
            <ProductGrid products={products} />
          </div>
          <aside className="hidden w-[440px] flex-none lg:block">
            <div className="sticky top-4">
              <CartPanel products={products} />
            </div>
          </aside>
        </div>
      </div>
      <div className="fixed inset-x-0 bottom-0 z-30 max-h-[80dvh] overflow-y-auto rounded-t-3xl border-t border-line bg-panel/95 backdrop-blur shadow-[var(--shadow-lift)] lg:hidden">
        <CartPanel products={products} compact />
      </div>
    </CartProvider>
  );
}
