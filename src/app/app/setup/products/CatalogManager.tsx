"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useDemoCatalog } from "@/lib/demo/useDemoCatalog";
import { useDemoAudit } from "@/lib/demo/useDemoAudit";
import { useDemoSales } from "@/lib/demo/useDemoSales";
import { useToast } from "@/components/ui/Toast";
import { formatTHB } from "@/lib/money/format";
import { useT } from "@/lib/i18n/provider";
import { forecastProduct } from "@/lib/demo/forecast";
import { ProductFormModal } from "./ProductFormModal";
import { SAMPLE_CATALOG } from "@/lib/demo/sample-catalog";
import type { Product } from "@/lib/pos/types";

const DEMO_WORKSPACE_ID = "demo-workspace";

export function CatalogManager() {
  const { items, ready, create, update, remove, setActive } = useDemoCatalog();
  const audit = useDemoAudit();
  const { orders } = useDemoSales();
  const { t } = useT();
  const [editing, setEditing] = useState<Product | null>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { push } = useToast();

  const forecastsByProduct = useMemo(() => {
    const out = new Map<string, ReturnType<typeof forecastProduct>>();
    for (const p of items) {
      out.set(
        p.id,
        forecastProduct({
          orders,
          productId: p.id,
          currentQty: p.current_qty,
        }),
      );
    }
    return out;
  }, [items, orders]);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (p) =>
        p.sku.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q),
    );
  }, [items, query]);

  function add() {
    setEditing(null);
    setOpen(true);
  }

  function edit(p: Product) {
    setEditing(p);
    setOpen(true);
  }

  function handleSubmit(values: Omit<Product, "id">, originalId: string | null) {
    if (originalId) {
      update(originalId, values);
      audit.log({
        action: "catalog_update",
        targetTable: "products",
        targetId: originalId,
        summary: `${values.sku} — ${values.name}`,
        newValue: {
          sku: values.sku,
          name: values.name,
          price_satang: values.price_satang,
          cost_satang: values.cost_satang ?? null,
          current_qty: values.current_qty,
          reorder_point: values.reorder_point ?? null,
        },
      });
    } else {
      const id = create(values);
      audit.log({
        action: "catalog_create",
        targetTable: "products",
        targetId: id,
        summary: `+${values.sku} — ${values.name}`,
        newValue: {
          sku: values.sku,
          name: values.name,
          price_satang: values.price_satang,
          cost_satang: values.cost_satang ?? null,
          current_qty: values.current_qty,
          reorder_point: values.reorder_point ?? null,
        },
      });
    }
  }

  function handleRemove(p: Product) {
    if (confirm(`Remove ${p.sku} — ${p.name}? This cannot be undone in demo mode.`)) {
      remove(p.id);
      audit.log({
        action: "catalog_delete",
        targetTable: "products",
        targetId: p.id,
        summary: `−${p.sku} — ${p.name}`,
        oldValue: { sku: p.sku, name: p.name },
      });
      push({
        kind: "info",
        title: "Removed",
        message: `${p.sku} deleted from demo catalog.`,
      });
    }
  }

  function handleSetActive(p: Product, isActive: boolean) {
    setActive(p.id, isActive);
    audit.log({
      action: "catalog_set_active",
      targetTable: "products",
      targetId: p.id,
      summary: `${p.sku} → ${isActive ? "active" : "inactive"}`,
      oldValue: { is_active: p.is_active },
      newValue: { is_active: isActive },
    });
  }

  function handleSetPinned(p: Product, pinned: boolean) {
    update(p.id, { pinned });
    audit.log({
      action: "catalog_update",
      targetTable: "products",
      targetId: p.id,
      summary: `${p.sku} → ${pinned ? "pinned" : "unpinned"}`,
      oldValue: { pinned: p.pinned ?? false },
      newValue: { pinned },
    });
  }

  function handleSeed() {
    if (
      items.length > 0 &&
      !confirm(
        "Adding sample products on top of your existing catalog. Continue?",
      )
    ) {
      return;
    }
    let created = 0;
    for (const p of SAMPLE_CATALOG) {
      if (items.some((existing) => existing.sku === p.sku)) continue;
      create(p);
      created++;
    }
    audit.log({
      action: "demo_seed",
      targetTable: "products",
      targetId: null,
      summary: `Loaded ${created} sample product${created === 1 ? "" : "s"}`,
      newValue: { added: created, total: SAMPLE_CATALOG.length },
    });
    push({
      kind: "success",
      title: "Sample catalog loaded",
      message: `${created} product${created === 1 ? "" : "s"} added.`,
    });
  }

  if (!ready) {
    return (
      <div className="panel-quiet mt-8 p-10 text-center text-sm text-muted">
        Loading…
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <>
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="kicker kicker-gold">Catalog</div>
            <h1 className="headline-upright text-3xl mt-2 text-accent-deep">
              {t.setupProducts.title}
            </h1>
            <p className="mt-2 max-w-[62ch] text-sm text-text-soft">
              {t.setupProducts.body}
            </p>
          </div>
        </header>

        <section className="panel-quiet mt-10 px-6 py-16 text-center">
          <div className="kicker kicker-gold justify-center">Catalog</div>
          <p
            className="headline mt-4 text-4xl text-accent-deep letterpress"
            style={{ fontStyle: "italic" }}
          >
            Add your first product
          </p>
          <p className="mt-4 mx-auto max-w-[52ch] text-sm text-text-soft">
            {t.setupProducts.emptyBody}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button type="button" onClick={add} className="btn-accent btn-lg">
              {t.setupProducts.addProduct}
            </button>
            <button type="button" onClick={handleSeed} className="btn-ghost btn-md">
              {t.setupProducts.loadSample}
            </button>
          </div>
          <p className="mt-6 text-xs text-muted">{t.setupProducts.demoNote}</p>
          <Link href="/app/pos" className="btn-link mt-6 inline-block text-sm">
            {t.setupProducts.tryDemo}
          </Link>
        </section>

        <ProductFormModal
          open={open}
          onClose={() => setOpen(false)}
          initial={editing}
          workspaceId={DEMO_WORKSPACE_ID}
          onSubmit={handleSubmit}
        />
      </>
    );
  }

  const activeCount = items.filter((p) => p.is_active).length;

  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="kicker kicker-gold">Catalog</div>
          <h1 className="headline-upright text-3xl mt-2 text-accent-deep">
            {t.setupProducts.title}
          </h1>
          <p className="mt-2 max-w-[62ch] text-sm text-text-soft">
            {t.setupProducts.body}
          </p>
          <p className="mt-1 text-xs text-muted">
            <span className="num">{items.length}</span> {t.setupProducts.countSummary}
            {" · "}
            <span className="num">{activeCount}</span> {t.setupProducts.activeSuffix}
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-64">
            <label className="field-label" htmlFor="catalog-search">
              Search
            </label>
            <input
              id="catalog-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.currentTarget.value)}
              placeholder="SKU, name, category"
              className="field text-right"
            />
          </div>
          <button type="button" onClick={add} className="btn-accent btn-md">
            {t.setupProducts.addProduct}
          </button>
        </div>
      </header>

      <section className="panel-quiet mt-8 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead>
              <tr>
                <th style={{ width: "72px" }}>Image</th>
                <th>Product</th>
                <th>SKU</th>
                <th className="text-right">Price</th>
                <th className="text-right">Stock</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((p) => {
                const lowStock =
                  typeof p.reorder_point === "number" &&
                  p.reorder_point > 0 &&
                  p.current_qty <= p.reorder_point;
                const outOfStock = p.current_qty <= 0;
                const stockChip = outOfStock
                  ? "chip chip-danger"
                  : lowStock
                    ? "chip chip-warn"
                    : "chip chip-ok";
                const stockLabel = outOfStock
                  ? "out"
                  : lowStock
                    ? "low"
                    : "ok";
                const forecast = forecastsByProduct.get(p.id);
                return (
                  <tr key={p.id} className={p.is_active ? "" : "opacity-60"}>
                    <td>
                      <div className="h-14 w-14 overflow-hidden rounded-[var(--radius-md)] border border-line-soft bg-soft">
                        {p.image_path ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={p.image_path}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="grid h-full w-full place-items-center text-[9px] font-bold uppercase tracking-wider text-faint">
                            no img
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="headline-upright text-base text-text">
                        {p.name}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted">
                        <span>{p.category}</span>
                        {p.pinned && (
                          <span className="chip chip-gold">★ {t.setupProducts.pinned}</span>
                        )}
                        {!p.is_active && (
                          <span className="chip chip-neutral">inactive</span>
                        )}
                        {p.send_later_enabled && (
                          <span className="chip chip-info">send-later</span>
                        )}
                      </div>
                      {forecast && forecast.window.qtySold > 0 && (
                        <p className="mt-1.5 text-[11px] font-semibold text-[var(--color-warn-soft-fg)]">
                          {t.pos.forecastSold(forecast.window.qtySold, 30)}
                          {forecast.suggestRestockQty > 0 && (
                            <>
                              {" · "}
                              {t.pos.forecastSuggestRestock(forecast.suggestRestockQty)}
                            </>
                          )}
                        </p>
                      )}
                    </td>
                    <td>
                      <span className="mono text-xs text-text-soft">{p.sku}</span>
                    </td>
                    <td className="text-right">
                      <div className="mono num text-sm text-text">
                        {formatTHB(p.price_satang)}
                      </div>
                      {p.cost_satang && p.cost_satang > 0 && (
                        <div className="mono num text-[11px] text-muted">
                          cost {formatTHB(p.cost_satang)}
                          {" · "}
                          <span className="text-[var(--color-ok-soft-fg)] font-semibold">
                            {Math.round(
                              ((p.price_satang - p.cost_satang) /
                                p.price_satang) *
                                100,
                            )}
                            %
                          </span>
                        </div>
                      )}
                      {p.shipping_fee_satang > 0 && (
                        <div className="mono num text-[11px] text-muted">
                          ship {formatTHB(p.shipping_fee_satang)}
                        </div>
                      )}
                    </td>
                    <td className="text-right">
                      <div className="inline-flex items-center gap-2">
                        <span className="mono num text-sm text-text">
                          {p.current_qty}
                        </span>
                        <span className={stockChip}>{stockLabel}</span>
                      </div>
                      {typeof p.reorder_point === "number" &&
                        p.reorder_point > 0 && (
                          <div className="mono num text-[11px] text-muted">
                            reorder@{p.reorder_point}
                          </div>
                        )}
                    </td>
                    <td className="text-right">
                      <div className="inline-flex flex-wrap justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => edit(p)}
                          className="btn-ghost btn-sm"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSetPinned(p, !p.pinned)}
                          className="btn-ghost btn-sm"
                        >
                          {p.pinned ? t.setupProducts.unpin : t.setupProducts.pin}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSetActive(p, !p.is_active)}
                          className="btn-ghost btn-sm"
                        >
                          {p.is_active ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemove(p)}
                          className="btn-ghost btn-sm text-[var(--color-danger-soft-fg)]"
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-sm text-muted">
                    No products match{query ? ` "${query}"` : ""}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <Link href="/app/pos" className="btn-link text-sm">
          {t.setupProducts.openPos}
        </Link>
        <p className="text-xs text-muted">{t.setupProducts.demoNote}</p>
      </div>

      <ProductFormModal
        open={open}
        onClose={() => setOpen(false)}
        initial={editing}
        workspaceId={DEMO_WORKSPACE_ID}
        onSubmit={handleSubmit}
      />
    </>
  );
}
