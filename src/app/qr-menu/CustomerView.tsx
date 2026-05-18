"use client";

import { useMemo, useState } from "react";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { useDemoCatalog } from "@/lib/demo/useDemoCatalog";
import { useDemoClaims } from "@/lib/demo/useDemoClaims";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { TextInput } from "@/components/ui/TextInput";
import { useToast } from "@/components/ui/Toast";
import { useT } from "@/lib/i18n/provider";
import { formatTHB } from "@/lib/money/format";
import type { CartLine, Product } from "@/lib/pos/types";

type ClaimResult = {
  code: string;
  customerName: string;
  totalSatang: number;
};

export function CustomerView() {
  const { items: catalog, ready } = useDemoCatalog();
  const claims = useDemoClaims();
  const { push } = useToast();
  const { t } = useT();

  const [lines, setLines] = useState<CartLine[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [showSubmit, setShowSubmit] = useState(false);
  const [submitted, setSubmitted] = useState<ClaimResult | null>(null);

  const productIndex = useMemo(
    () => new Map(catalog.map((p) => [p.id, p])),
    [catalog],
  );

  const subtotal = useMemo(
    () =>
      lines.reduce((sum, l) => {
        const p = productIndex.get(l.productId);
        return p ? sum + p.price_satang * l.qty : sum;
      }, 0),
    [lines, productIndex],
  );

  function addLine(p: Product) {
    setLines((prev) => {
      const idx = prev.findIndex((l) => l.productId === p.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + 1 };
        return next;
      }
      return [...prev, { productId: p.id, qty: 1, fulfillment: "take_now" }];
    });
  }

  function adjustQty(productId: string, delta: number) {
    setLines((prev) =>
      prev
        .map((l) =>
          l.productId === productId
            ? { ...l, qty: Math.max(0, l.qty + delta) }
            : l,
        )
        .filter((l) => l.qty > 0),
    );
  }

  function submit() {
    if (lines.length === 0) {
      push({
        kind: "warn",
        title: t.qrMenu.cartEmpty,
        message: t.qrMenu.addSomething,
      });
      return;
    }
    if (name.trim().length < 2) {
      push({
        kind: "warn",
        title: t.qrMenu.nameRequired,
        message: t.qrMenu.nameRequiredHint,
      });
      return;
    }
    setSubmitting(true);
    const claim = claims.create({ lines, customerName: name.trim() });
    setSubmitted({
      code: claim.code,
      customerName: claim.customerName,
      totalSatang: subtotal,
    });
    setLines([]);
    setName("");
    setShowSubmit(false);
    setSubmitting(false);
  }

  if (!ready) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="kicker">{t.common.loading}</p>
      </div>
    );
  }

  if (catalog.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="kicker kicker-gold justify-center">{t.qrMenu.title}</p>
        <h1 className="headline letterpress mt-4 text-4xl text-accent-deep">
          {t.qrMenu.noCatalogTitle}
        </h1>
        <div className="fleuron mt-6">
          <span>※</span>
        </div>
        <p className="mt-4 text-sm text-muted">{t.qrMenu.noCatalogBody}</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-md px-4 py-12">
        <div className="panel-lift relative p-8 text-center">
          <span className="panel-tag">{t.qrMenu.claimReady}</span>
          <p
            className="mono num mt-4 text-5xl font-bold tracking-[0.3em] text-accent-deep"
          >
            {submitted.code}
          </p>
          <div className="fleuron mt-5">
            <span>※</span>
          </div>
          <p className="mt-4 text-sm text-text-soft">
            {t.qrMenu.showAtBooth(submitted.customerName)}
          </p>
          <p className="kicker mt-4">
            {t.pos.total}{" "}
            <span className="mono num ml-1 text-accent-strong">
              {formatTHB(submitted.totalSatang)} THB
            </span>
          </p>
          <div className="mt-6 flex justify-center">
            <Button onClick={() => setSubmitted(null)}>
              {t.qrMenu.startOver}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const activeCatalog = catalog
    .filter((p) => p.is_active)
    .sort((a, b) => {
      const ap = a.pinned ? 1 : 0;
      const bp = b.pinned ? 1 : 0;
      if (ap !== bp) return bp - ap;
      return a.name.localeCompare(b.name);
    });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 pb-36 md:py-12">
      <header className="rise rise-1 max-w-2xl">
        <p className="kicker kicker-gold">{t.qrMenu.title}</p>
        <h1 className="headline letterpress mt-4 text-4xl text-accent-deep md:text-5xl">
          <span className="underline-grow">{t.qrMenu.title}</span>
        </h1>
        <p className="mt-4 max-w-[62ch] text-sm text-text-soft md:text-base">
          {t.qrMenu.body}
        </p>
        <div className="fleuron mt-6">
          <span>※</span>
        </div>
      </header>

      <section className="rise rise-2 panel mt-8 p-4 md:p-6">
        <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {activeCatalog.map((p) => {
            const line = lines.find((l) => l.productId === p.id);
            const qty = line?.qty ?? 0;
            const remaining = Math.max(0, p.current_qty - qty);
            const soldout = remaining <= 0 && qty === 0;
            const lowStock = !soldout && p.current_qty > 0 && p.current_qty <= 3;
            return (
              <li
                key={p.id}
                className="panel-quiet flex flex-col gap-3 p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="kicker mono num text-[0.65rem] tracking-[0.18em]">
                    {p.sku}
                  </p>
                  <div className="flex flex-wrap items-center justify-end gap-1.5">
                    {p.pinned && (
                      <span className="chip chip-gold">Featured</span>
                    )}
                    {lowStock && (
                      <span className="chip chip-warn">
                        {/* TODO: i18n key for low stock */}
                        Low stock
                      </span>
                    )}
                    {soldout && (
                      <span className="chip chip-neutral">
                        {t.pos.soldOut}
                      </span>
                    )}
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="headline-upright line-clamp-2 text-lg text-text">
                    {p.name}
                  </h3>
                  <p className="mono num mt-2 text-base text-accent-strong">
                    {formatTHB(p.price_satang)}
                    <span className="ml-1 text-xs text-muted">THB</span>
                  </p>
                </div>
                <div className="flex items-center justify-end pt-1">
                  {qty > 0 ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => adjustQty(p.id, -1)}
                        aria-label="Decrease"
                        className="grid h-9 w-9 place-items-center rounded-full border border-line bg-panel text-accent-strong transition-colors hover:border-line-strong"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="mono num min-w-[1.75rem] text-center text-base font-bold text-text">
                        {qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => adjustQty(p.id, 1)}
                        aria-label="Increase"
                        disabled={remaining === 0}
                        className="grid h-9 w-9 place-items-center rounded-full border border-line bg-panel text-accent-strong transition-colors hover:border-line-strong disabled:opacity-50"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => addLine(p)}
                      disabled={soldout}
                    >
                      <Plus size={14} />
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="mt-10 flex justify-center">
        <a href="/apply" className="btn-link text-xs">
          {/* TODO: i18n key for seller apply CTA */}
          Sell at your own booth →
        </a>
      </div>

      {lines.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 border-t border-line-strong bg-panel-strong/95 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3">
            <ShoppingCart size={20} className="text-accent-strong" />
            <div className="flex-1">
              <p className="kicker">{t.pos.total}</p>
              <p className="mono num text-lg font-bold text-accent-deep">
                {formatTHB(subtotal)}{" "}
                <span className="text-xs text-muted">THB</span>
              </p>
            </div>
            <Button onClick={() => setShowSubmit(true)}>
              {t.qrMenu.submitOrder}
            </Button>
          </div>
        </div>
      )}

      <Modal
        open={showSubmit}
        onClose={() => setShowSubmit(false)}
        title={t.qrMenu.submitTitle}
        size="sm"
      >
        <p className="text-sm text-text-soft">{t.qrMenu.submitBody}</p>
        <div className="mt-4">
          <TextInput
            label={t.qrMenu.fName}
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            autoComplete="name"
            placeholder={t.qrMenu.fNamePlaceholder}
          />
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setShowSubmit(false)}>
            {t.common.cancel}
          </Button>
          <Button onClick={submit} loading={submitting}>
            {t.qrMenu.generateCode}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
