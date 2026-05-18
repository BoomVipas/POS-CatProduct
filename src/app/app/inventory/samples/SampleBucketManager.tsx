"use client";

import { useMemo, useState } from "react";
import { useDemoCatalog } from "@/lib/demo/useDemoCatalog";
import { useDemoSampleBucket } from "@/lib/demo/useDemoSampleBucket";
import { useToast } from "@/components/ui/Toast";

/** Demo event id — matches the seed event in pos-for-sell/database/seed.sql. */
const DEMO_EVENT_ID = "demo-event-1";

/** Demo "available event stock" cap — for now the demo doesn't track per-event
 *  stock independently, so we use product.current_qty as the ceiling
 *  for "not enough event stock" validation. When real event_inventory wires
 *  up post-Wave-39a, this becomes a live `current_qty` read. */
function defaultAvailable(qty: number): number {
  return Math.max(0, qty);
}

const LOW_THRESHOLD = 1;

export function SampleBucketManager() {
  const catalog = useDemoCatalog();
  const samples = useDemoSampleBucket();
  const { push } = useToast();
  const [busySku, setBusySku] = useState<string | null>(null);

  const products = useMemo(
    () =>
      [...catalog.items]
        .filter((p) => p.is_active)
        .sort((a, b) => a.sku.localeCompare(b.sku)),
    [catalog.items],
  );

  if (!catalog.ready || !samples.ready) {
    return (
      <div className="panel-quiet p-6 text-center text-sm text-muted">
        Loading…
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="panel-quiet flex flex-col items-center gap-3 px-6 py-16 text-center">
        <p className="kicker kicker-gold">Empty bucket</p>
        <p className="headline text-3xl text-accent-deep">
          No samples tracked
        </p>
        <p className="mt-1 max-w-[52ch] text-sm text-text-soft">
          Add a few items in product setup, then move units to the bucket
          when they go on display.
        </p>
        <a href="/app/setup/products" className="btn-link mt-3 text-sm">
          Go to product setup
        </a>
      </div>
    );
  }

  function handleMake(productId: string, productName: string, sku: string) {
    setBusySku(sku);
    const product = products.find((p) => p.id === productId);
    const cap = defaultAvailable(product?.current_qty ?? 0);
    const result = samples.make(DEMO_EVENT_ID, productId, 1, cap);
    setBusySku(null);
    if (result.ok) {
      push({
        kind: "info",
        message: `+1 sample · ${productName}`,
      });
    } else if (result.reason === "not-enough-event-stock") {
      push({
        kind: "warn",
        message: `Not enough event stock for ${productName} (cap ${cap}).`,
      });
    } else {
      push({ kind: "warn", message: `Could not make sample (${result.reason}).` });
    }
  }

  function handleReturn(productId: string, productName: string, sku: string) {
    setBusySku(sku);
    const result = samples.returnToEvent(DEMO_EVENT_ID, productId, 1);
    setBusySku(null);
    if (result.ok) {
      push({
        kind: "info",
        message: `-1 sample · returned to event stock · ${productName}`,
      });
    } else if (result.reason === "not-enough-sample") {
      push({
        kind: "warn",
        message: `${productName} has no sample to return.`,
      });
    } else {
      push({ kind: "warn", message: `Could not return sample (${result.reason}).` });
    }
  }

  const totalSampleQty = products.reduce(
    (sum, p) => sum + samples.qtyFor(DEMO_EVENT_ID, p.id),
    0,
  );
  const totalCap = products.reduce(
    (sum, p) => sum + defaultAvailable(p.current_qty ?? 0),
    0,
  );
  const productsWithSamples = products.filter(
    (p) => samples.qtyFor(DEMO_EVENT_ID, p.id) > 0,
  ).length;

  return (
    <section className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="panel-quiet border-l-2 border-gold p-5">
          <p className="kicker">Samples on hand</p>
          <p className="mono num mt-3 text-3xl text-accent-deep">
            {totalSampleQty}
          </p>
          <p className="mt-1 text-xs text-muted">
            Units currently on display
          </p>
        </div>
        <div className="panel-quiet border-l-2 border-gold p-5">
          <p className="kicker">Lines with samples</p>
          <p className="mono num mt-3 text-3xl text-accent-deep">
            {productsWithSamples}
          </p>
          <p className="mt-1 text-xs text-muted">
            Out of {products.length} active
          </p>
        </div>
        <div className="panel-quiet border-l-2 border-gold p-5">
          <p className="kicker">Event stock cap</p>
          <p className="mono num mt-3 text-3xl text-accent-deep">
            {totalCap}
          </p>
          <p className="mt-1 text-xs text-muted">
            Ceiling for sample conversion
          </p>
        </div>
      </div>

      <div className="panel-quiet overflow-hidden">
        <table className="tbl table-fixed">
          <thead>
            <tr>
              <th className="w-[36%]">Product</th>
              <th className="w-[14%]">SKU</th>
              <th className="w-[12%]">On hand</th>
              <th className="w-[12%]">Cap</th>
              <th className="w-[12%]">Status</th>
              <th className="w-[14%] text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const cap = defaultAvailable(p.current_qty ?? 0);
              const qty = samples.qtyFor(DEMO_EVENT_ID, p.id);
              const canMake = !busySku && cap > 0;
              const canReturn = !busySku && qty > 0;
              const chipClass =
                qty === 0
                  ? "chip chip-danger"
                  : qty <= LOW_THRESHOLD
                    ? "chip chip-warn"
                    : "chip chip-ok";
              const chipLabel =
                qty === 0 ? "Out" : qty <= LOW_THRESHOLD ? "Low" : "Healthy";
              return (
                <tr key={p.id}>
                  <td>
                    <a
                      href="/app/setup/products"
                      className="btn-link text-sm"
                    >
                      {p.name}
                    </a>
                  </td>
                  <td className="mono text-sm text-text-soft">{p.sku}</td>
                  <td className="mono num text-text">{qty}</td>
                  <td className="mono num text-muted">{cap}</td>
                  <td>
                    <span className={chipClass}>{chipLabel}</span>
                  </td>
                  <td>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        disabled={!canMake}
                        onClick={() => handleMake(p.id, p.name, p.sku)}
                        className="btn-ghost btn-sm disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        +1 Make
                      </button>
                      <button
                        type="button"
                        disabled={!canReturn}
                        onClick={() => handleReturn(p.id, p.name, p.sku)}
                        className="btn-ghost btn-sm disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        -1 Return
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="max-w-[72ch] text-xs text-muted">
        <strong className="text-text-soft">Cap</strong> shows the product&apos;s
        default event stock — a proxy for available event-sellable qty in this
        demo. When real event_inventory wires up after Wave 39a (PR #4) merges,
        this becomes a live <code className="mono">current_qty</code> read from
        the database.
      </p>
    </section>
  );
}
