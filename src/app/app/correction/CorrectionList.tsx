"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useDemoSales } from "@/lib/demo/useDemoSales";
import { useDemoCatalog } from "@/lib/demo/useDemoCatalog";
import { useDemoAudit } from "@/lib/demo/useDemoAudit";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { formatTHB } from "@/lib/money/format";
import { formatDateTimeTH } from "@/lib/date";
import {
  effectiveTotalSatang,
  newRefundId,
  remainingQty,
  orderSourceLabel,
  type DemoOrder,
  type DemoRefund,
} from "@/lib/demo/sales";

type RangeKey = "7d" | "30d" | "all";

const RANGE_LABEL: Record<RangeKey, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  all: "All time",
};

function rangeCutoff(range: RangeKey): number | null {
  if (range === "all") return null;
  const days = range === "7d" ? 7 : 30;
  return Date.now() - days * 24 * 60 * 60 * 1000;
}

export function CorrectionList() {
  const { orders, ready, update } = useDemoSales();
  const { items: catalog, update: updateProduct } = useDemoCatalog();
  const audit = useDemoAudit();
  const { push } = useToast();

  const [range, setRange] = useState<RangeKey>("30d");
  const [voiding, setVoiding] = useState<DemoOrder | null>(null);
  const [voidReason, setVoidReason] = useState("");

  const [refunding, setRefunding] = useState<DemoOrder | null>(null);
  const [refundQty, setRefundQty] = useState<Record<number, number>>({});
  const [refundReason, setRefundReason] = useState("");

  const recent = useMemo(() => {
    const cutoff = rangeCutoff(range);
    return [...orders]
      .filter((o) => {
        if (cutoff === null) return true;
        const t = new Date(o.createdAt).getTime();
        return Number.isFinite(t) ? t >= cutoff : true;
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 60);
  }, [orders, range]);

  if (!ready) {
    return (
      <section className="panel-quiet mt-8 px-6 py-10 text-center">
        <p className="kicker">Loading</p>
        <p className="mt-2 text-sm text-muted">Fetching recent sales…</p>
      </section>
    );
  }

  function startVoid(o: DemoOrder) {
    setVoiding(o);
    setVoidReason("");
  }

  function confirmVoid() {
    if (!voiding) return;
    if (voidReason.trim().length < 3) {
      push({
        kind: "warn",
        title: "Reason required",
        message: "At least 3 characters.",
      });
      return;
    }

    update(voiding.id, {
      status: "voided",
      voidedAt: new Date().toISOString(),
      voidReason: voidReason.trim(),
    });

    const incrementBy = new Map<string, number>();
    voiding.items.forEach((it, idx) => {
      const remaining = remainingQty(voiding, idx);
      if (remaining > 0) {
        incrementBy.set(
          it.productId,
          (incrementBy.get(it.productId) ?? 0) + remaining,
        );
      }
    });
    for (const [productId, qty] of incrementBy) {
      const p = catalog.find((c) => c.id === productId);
      if (p) {
        updateProduct(productId, { current_qty: p.current_qty + qty });
      }
    }

    audit.log({
      action: "order_void",
      targetTable: "orders",
      targetId: voiding.id,
      summary: `${voiding.orderNumber} voided · ${formatTHB(voiding.totalSatang)} THB · reason: ${voidReason.trim()}`,
      oldValue: { totalSatang: voiding.totalSatang, status: "completed" },
      newValue: { status: "voided", voidReason: voidReason.trim() },
    });

    push({
      kind: "success",
      title: "Voided",
      message: `${voiding.orderNumber} voided. Stock restored.`,
    });
    setVoiding(null);
    setVoidReason("");
  }

  function startRefund(o: DemoOrder) {
    setRefunding(o);
    setRefundQty({});
    setRefundReason("");
  }

  function confirmRefund() {
    if (!refunding) return;
    if (refundReason.trim().length < 3) {
      push({
        kind: "warn",
        title: "Reason required",
        message: "At least 3 characters.",
      });
      return;
    }
    const newRefunds: DemoRefund[] = [];
    let totalRefundedSatang = 0;
    Object.entries(refundQty).forEach(([idxStr, qty]) => {
      const idx = Number(idxStr);
      const q = Math.max(0, Math.floor(qty));
      if (q <= 0) return;
      const item = refunding.items[idx];
      if (!item) return;
      const remaining = remainingQty(refunding, idx);
      const cap = Math.min(q, remaining);
      if (cap <= 0) return;
      newRefunds.push({
        id: newRefundId(),
        lineIndex: idx,
        qty: cap,
        amountSatang: item.unitPriceSatang * cap,
        reason: refundReason.trim(),
        refundedAt: new Date().toISOString(),
      });
      totalRefundedSatang += item.unitPriceSatang * cap;
    });
    if (newRefunds.length === 0) {
      push({
        kind: "warn",
        title: "Nothing to refund",
        message: "Pick at least one line and a qty.",
      });
      return;
    }
    update(refunding.id, {
      refunds: [...(refunding.refunds ?? []), ...newRefunds],
    });
    const incrementBy = new Map<string, number>();
    for (const r of newRefunds) {
      const item = refunding.items[r.lineIndex];
      if (!item) continue;
      incrementBy.set(
        item.productId,
        (incrementBy.get(item.productId) ?? 0) + r.qty,
      );
    }
    for (const [productId, qty] of incrementBy) {
      const p = catalog.find((c) => c.id === productId);
      if (p) {
        updateProduct(productId, { current_qty: p.current_qty + qty });
      }
    }
    audit.log({
      action: "order_void",
      targetTable: "orders",
      targetId: refunding.id,
      summary: `${refunding.orderNumber} partial refund · ${formatTHB(totalRefundedSatang)} THB · ${newRefunds.length} line${newRefunds.length === 1 ? "" : "s"} · reason: ${refundReason.trim()}`,
      newValue: { refunds: newRefunds, totalRefundedSatang },
    });
    push({
      kind: "success",
      title: "Refunded",
      message: `${formatTHB(totalRefundedSatang)} THB refunded. Stock restored for those lines.`,
    });
    setRefunding(null);
    setRefundQty({});
    setRefundReason("");
  }

  return (
    <>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p className="kicker">Recent activity</p>
        <div className="flex items-center gap-1.5" role="tablist" aria-label="Filter range">
          {(Object.keys(RANGE_LABEL) as RangeKey[]).map((k) => {
            const active = range === k;
            return (
              <button
                key={k}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setRange(k)}
                className={
                  active
                    ? "chip chip-gold cursor-pointer"
                    : "chip chip-neutral cursor-pointer"
                }
              >
                {RANGE_LABEL[k]}
              </button>
            );
          })}
        </div>
      </div>

      {recent.length === 0 ? (
        <section className="panel-quiet mt-4 px-6 py-12 text-center">
          <p className="kicker kicker-gold mx-auto inline-flex">No corrections</p>
          <p
            className="mt-3 text-2xl text-accent-deep"
            style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}
          >
            No corrections this period
          </p>
          <p className="mx-auto mt-2 max-w-[42ch] text-sm text-muted">
            Confirm a sale at the POS and it will appear here for void or
            refund.
          </p>
          <Link href="/app/pos" className="btn-link mt-5 inline-block text-sm">
            Open POS →
          </Link>
        </section>
      ) : (
        <section className="panel-quiet mt-4 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Order #</th>
                  <th>Reason / Notes</th>
                  <th className="text-right">Amount</th>
                  <th>Status</th>
                  <th>Source</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((o) => {
                  const isVoided = (o.status ?? "completed") === "voided";
                  const refundCount = (o.refunds ?? []).length;
                  const effective = effectiveTotalSatang(o);
                  const isFullyRefunded =
                    !isVoided && effective === 0 && refundCount > 0;
                  const isPartial =
                    !isVoided && !isFullyRefunded && refundCount > 0;
                  const refundedTotal = (o.refunds ?? []).reduce(
                    (s, r) => s + r.amountSatang,
                    0,
                  );
                  const hasCorrection = isVoided || refundCount > 0;
                  return (
                    <tr key={o.id}>
                      <td className="mono text-xs text-text-soft whitespace-nowrap">
                        {formatDateTimeTH(o.createdAt)}
                      </td>
                      <td className="whitespace-nowrap">
                        <Link
                          href={`/app/audit-log?target=${encodeURIComponent(o.id)}`}
                          className="btn-link mono text-sm"
                        >
                          {o.orderNumber}
                        </Link>
                        <div className="mt-1 text-[11px] text-muted">
                          {o.items.length} line
                          {o.items.length === 1 ? "" : "s"} · {o.paymentMethod}
                        </div>
                      </td>
                      <td className="text-sm text-text-soft">
                        {o.voidReason ? (
                          <span>
                            <span className="text-muted">Void reason: </span>
                            <strong className="text-[var(--color-danger-soft-fg)]">
                              {o.voidReason}
                            </strong>
                          </span>
                        ) : refundCount > 0 ? (
                          <span className="text-muted">
                            {refundCount} refund
                            {refundCount === 1 ? "" : "s"} recorded
                          </span>
                        ) : (
                          <span className="text-faint">—</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap text-right align-top">
                        <div
                          className={`mono num text-sm font-bold ${
                            effective < o.totalSatang
                              ? "text-[var(--color-warn-soft-fg)]"
                              : "text-accent-strong"
                          }`}
                        >
                          {formatTHB(effective)}
                        </div>
                        {effective < o.totalSatang && (
                          <div className="mono num mt-0.5 text-[10px] text-muted">
                            of {formatTHB(o.totalSatang)}
                          </div>
                        )}
                        {refundedTotal > 0 && (
                          <div className="mt-1">
                            <span className="chip chip-danger mono">
                              −{formatTHB(refundedTotal)}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="whitespace-nowrap align-top">
                        {isVoided ? (
                          <span className="chip chip-danger">full void</span>
                        ) : isFullyRefunded ? (
                          <span className="chip chip-warn">fully refunded</span>
                        ) : isPartial ? (
                          <span className="chip chip-warn">partial</span>
                        ) : (
                          <span className="chip chip-ok">completed</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap align-top text-xs text-text-soft">
                        {o.source ? orderSourceLabel(o.source) : "booth"}
                      </td>
                      <td className="whitespace-nowrap text-right align-top">
                        {!isVoided && !isFullyRefunded ? (
                          <div className="inline-flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => startRefund(o)}
                            >
                              Refund
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => startVoid(o)}
                            >
                              Void
                            </Button>
                          </div>
                        ) : hasCorrection ? (
                          <Link
                            href={`/app/audit-log?target=${encodeURIComponent(o.id)}`}
                            className="btn-link text-xs"
                          >
                            Audit trail
                          </Link>
                        ) : (
                          <span className="text-faint text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <Modal
        open={voiding !== null}
        onClose={() => setVoiding(null)}
        title={`Void ${voiding?.orderNumber ?? ""}`}
        size="sm"
      >
        <p className="text-sm text-text-soft">
          Restores inventory for each remaining line and excludes the order
          from dashboard totals. Cannot be undone in demo mode.
        </p>
        <label className="field-label mt-4 block">Reason</label>
        <textarea
          value={voidReason}
          onChange={(e) => setVoidReason(e.currentTarget.value)}
          placeholder="Reason (required, min 3 chars)"
          rows={3}
          className="field"
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setVoiding(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmVoid}>
            Confirm void
          </Button>
        </div>
      </Modal>

      <Modal
        open={refunding !== null}
        onClose={() => setRefunding(null)}
        title={`Refund ${refunding?.orderNumber ?? ""}`}
        size="md"
      >
        <p className="text-sm text-text-soft">
          Pick which lines to refund and how many of each. Stock is restored
          for the refunded quantities. The order stays in the audit trail; the
          dashboard total adjusts.
        </p>
        <ul className="mt-4 grid gap-2">
          {refunding?.items.map((it, idx) => {
            const remaining = remainingQty(refunding, idx);
            return (
              <li
                key={idx}
                className="panel-quiet grid grid-cols-[minmax(0,1fr)_minmax(0,96px)] items-center gap-3 px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="mono text-[10px] font-bold uppercase tracking-wider text-muted">
                    {it.sku}
                  </p>
                  <p className="text-sm font-semibold text-text">
                    {it.productName}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    <span className="mono num">{remaining}</span>/
                    <span className="mono num">{it.qty}</span> refundable ·{" "}
                    <span className="mono num">
                      {formatTHB(it.unitPriceSatang)}
                    </span>{" "}
                    each
                  </p>
                </div>
                <input
                  type="number"
                  min={0}
                  max={remaining}
                  step={1}
                  value={refundQty[idx] ?? 0}
                  onChange={(e) => {
                    const n = Number(e.currentTarget.value);
                    setRefundQty((m) => ({
                      ...m,
                      [idx]: Number.isFinite(n)
                        ? Math.max(0, Math.min(remaining, Math.floor(n)))
                        : 0,
                    }));
                  }}
                  disabled={remaining === 0}
                  className="field mono num text-right font-bold disabled:opacity-50"
                />
              </li>
            );
          })}
        </ul>
        <label className="field-label mt-4 block">Reason</label>
        <textarea
          value={refundReason}
          onChange={(e) => setRefundReason(e.currentTarget.value)}
          placeholder="Reason (required, min 3 chars)"
          rows={2}
          className="field"
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setRefunding(null)}>
            Cancel
          </Button>
          <Button variant="secondary" onClick={confirmRefund}>
            Confirm refund
          </Button>
        </div>
      </Modal>
    </>
  );
}
