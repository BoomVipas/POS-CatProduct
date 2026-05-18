"use client";

import { useMemo } from "react";
import { useToast } from "@/components/ui/Toast";
import { useDemoCatalog } from "@/lib/demo/useDemoCatalog";
import { useDemoStockCount } from "@/lib/demo/useDemoStockCount";
import { useDemoAudit } from "@/lib/demo/useDemoAudit";
import {
  STOCK_COUNT_REASONS,
  lineCommittable,
  lineVariance,
  sessionCommittable,
  sessionVarianceSummary,
  type StockCountLine,
  type StockCountReason,
  type StockCountSession,
} from "@/lib/demo/stock-count";
import { formatDateTimeTH } from "@/lib/date";

export function StockCountManager() {
  const catalog = useDemoCatalog();
  const counts = useDemoStockCount();
  const audit = useDemoAudit();
  const { push } = useToast();

  const open = counts.sessions.find((s) => s.status === "open") ?? null;
  const history = useMemo(
    () =>
      [...counts.sessions]
        .filter((s) => s.status !== "open")
        .sort((a, b) => b.openedAt.localeCompare(a.openedAt))
        .slice(0, 8),
    [counts.sessions],
  );

  function handleOpen() {
    if (!catalog.ready) return;
    const active = catalog.items.filter((p) => p.is_active);
    if (active.length === 0) {
      push({
        kind: "warn",
        title: "No products",
        message: "Add at least one active product before opening a count.",
      });
      return;
    }
    const session = counts.open(catalog.items);
    audit.log({
      action: "stock_count_open",
      targetTable: "stock_counts",
      targetId: session.id,
      summary: `Stock count opened · ${session.lines.length} SKU${session.lines.length === 1 ? "" : "s"}`,
      newValue: { lines: session.lines.length },
    });
    push({
      kind: "info",
      title: "Count session opened",
      message: `${session.lines.length} active SKUs to count.`,
    });
  }

  function handleCommit() {
    if (!open) return;
    const guard = sessionCommittable(open);
    if (!guard.ok) {
      push({
        kind: "warn",
        title: "Cannot commit",
        message: guard.reason ?? "",
      });
      return;
    }
    const sum = sessionVarianceSummary(open);
    let applied = 0;
    for (const line of open.lines) {
      if (line.countedQty === null) continue;
      const v = lineVariance(line) ?? 0;
      catalog.update(line.productId, { current_qty: line.countedQty });
      if (v !== 0) {
        audit.log({
          action: "stock_count_commit",
          targetTable: "products",
          targetId: line.productId,
          summary: `${line.sku} · ${line.expectedQty} → ${line.countedQty} (${v > 0 ? "+" : ""}${v}) · ${line.reason ?? "n/a"}`,
          oldValue: { current_qty: line.expectedQty },
          newValue: {
            current_qty: line.countedQty,
            variance: v,
            reason: line.reason,
            note: line.reasonNote ?? null,
          },
        });
      }
      applied++;
    }
    counts.commit(open.id);
    audit.log({
      action: "stock_count_commit",
      targetTable: "stock_counts",
      targetId: open.id,
      summary: `Stock count committed · ${applied} line${applied === 1 ? "" : "s"} · net ${sum.netUnits >= 0 ? "+" : ""}${sum.netUnits}`,
      newValue: {
        appliedLines: applied,
        unitsLost: sum.unitsLost,
        unitsFound: sum.unitsFound,
        netUnits: sum.netUnits,
      },
    });
    push({
      kind: "success",
      title: "Stock count committed",
      message: `${applied} SKU${applied === 1 ? "" : "s"} adjusted. Net ${sum.netUnits >= 0 ? "+" : ""}${sum.netUnits} unit${Math.abs(sum.netUnits) === 1 ? "" : "s"}.`,
    });
  }

  function handleCancel() {
    if (!open) return;
    if (
      !confirm(
        "Discard this count? Any entered counts will be lost; product stock is unchanged.",
      )
    )
      return;
    counts.cancel(open.id);
    audit.log({
      action: "stock_count_cancel",
      targetTable: "stock_counts",
      targetId: open.id,
      summary: "Stock count cancelled (no adjustments applied)",
    });
    push({
      kind: "info",
      title: "Count cancelled",
      message: "No adjustments were applied.",
    });
  }

  if (!catalog.ready || !counts.ready) {
    return (
      <div className="panel-quiet mt-8 px-4 py-6 text-center">
        <p className="text-sm text-muted">Loading…</p>
      </div>
    );
  }

  return (
    <>
      {open ? (
        <OpenSessionCard
          session={open}
          onSetCount={(productId, qty) =>
            counts.setLineCount(open.id, productId, qty)
          }
          onSetReason={(productId, reason, note) =>
            counts.setLineReason(open.id, productId, reason, note)
          }
          onSetNotes={(notes) => counts.setNotes(open.id, notes)}
          onCommit={handleCommit}
          onCancel={handleCancel}
        />
      ) : (
        <section className="mt-8">
          <div className="panel-lift p-8 text-center">
            <p className="kicker">Idle</p>
            <p className="headline-upright mt-2 text-2xl text-accent-deep">
              No open count session
            </p>
            <p className="mx-auto mt-2 max-w-[52ch] text-sm text-text-soft">
              Start one when you finish a multi-day event or whenever warehouse
              stock looks off.
            </p>
            <button
              onClick={handleOpen}
              className="btn-accent btn-lg mt-5"
              type="button"
            >
              Open new count session
            </button>
          </div>
        </section>
      )}

      {history.length > 0 && (
        <section className="mt-10">
          <div className="flex items-end justify-between border-b border-line-soft pb-2">
            <p className="kicker">Recent counts</p>
            <span className="mono num text-xs text-faint">
              {history.length} session{history.length === 1 ? "" : "s"}
            </span>
          </div>
          <ul className="mt-3 grid gap-2">
            {history.map((s) => {
              const sum = sessionVarianceSummary(s);
              const netChip =
                sum.netUnits === 0
                  ? "chip chip-neutral"
                  : sum.netUnits > 0
                    ? "chip chip-ok"
                    : "chip chip-warn";
              return (
                <li key={s.id} className="panel-quiet px-4 py-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="mono num text-xs text-muted">
                        {formatDateTimeTH(s.openedAt)}
                      </span>
                      {s.status === "committed" && (
                        <span className="chip chip-ok">committed</span>
                      )}
                      {s.status === "cancelled" && (
                        <span className="chip chip-neutral">cancelled</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="mono num text-muted">
                        {sum.countedLines}/{sum.totalLines} counted
                      </span>
                      <span className={netChip}>
                        net {sum.netUnits >= 0 ? "+" : ""}
                        {sum.netUnits}
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </>
  );
}

function OpenSessionCard({
  session,
  onSetCount,
  onSetReason,
  onSetNotes,
  onCommit,
  onCancel,
}: {
  session: StockCountSession;
  onSetCount: (productId: string, qty: number | null) => void;
  onSetReason: (
    productId: string,
    reason: StockCountReason | undefined,
    note?: string,
  ) => void;
  onSetNotes: (notes: string) => void;
  onCommit: () => void;
  onCancel: () => void;
}) {
  const sum = sessionVarianceSummary(session);
  const guard = sessionCommittable(session);
  const remaining = sum.totalLines - sum.countedLines;
  const netUnits = sum.netUnits;
  const netLabel = `${netUnits >= 0 ? "+" : ""}${netUnits}`;
  const statusChip =
    remaining === 0 ? "chip chip-ok" : "chip chip-gold";

  return (
    <>
      <section className="mt-6">
        <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-line-soft pb-3">
          <div className="flex items-center gap-3">
            <p className="kicker">Session</p>
            <span className={statusChip}>
              {remaining === 0 ? "ready to submit" : "in progress"}
            </span>
          </div>
          <p className="mono num text-xs text-faint">
            opened {formatDateTimeTH(session.openedAt)}
          </p>
        </div>

        {/* KPI tiles */}
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="panel-quiet border-l-2 border-gold px-4 py-3">
            <p className="kicker">Remaining</p>
            <p className="mono num text-3xl text-accent-deep mt-1">
              {remaining}
            </p>
            <p className="mt-1 text-xs text-muted">SKUs left to count</p>
          </div>
          <div className="panel-quiet border-l-2 border-gold px-4 py-3">
            <p className="kicker">Counted</p>
            <p className="mono num text-3xl text-accent-deep mt-1">
              {sum.countedLines}
              <span className="text-lg text-faint"> / {sum.totalLines}</span>
            </p>
            <p className="mt-1 text-xs text-muted">SKUs entered</p>
          </div>
          <div className="panel-quiet border-l-2 border-gold px-4 py-3">
            <p className="kicker">Net variance</p>
            <p
              className={
                "mono num text-3xl mt-1 " +
                (netUnits === 0
                  ? "text-accent-deep"
                  : netUnits > 0
                    ? "text-[var(--color-ok-soft-fg)]"
                    : "text-[var(--color-warn-soft-fg)]")
              }
            >
              {netLabel}
            </p>
            <p className="mt-1 mono num text-xs text-muted">
              +{sum.unitsFound} found · −{sum.unitsLost} lost
            </p>
          </div>
        </div>

        {/* Count list */}
        <div className="panel-lift mt-5 p-4 sm:p-5">
          <div className="flex items-end justify-between border-b border-line-soft pb-2">
            <p className="kicker">Count list</p>
            <span className="mono num text-xs text-faint">
              {session.lines.length} SKU
              {session.lines.length === 1 ? "" : "s"}
            </span>
          </div>
          <ul className="mt-3 grid gap-2">
            {session.lines.map((line) => (
              <CountLineRow
                key={line.productId}
                line={line}
                onSetCount={(qty) => onSetCount(line.productId, qty)}
                onSetReason={(reason, note) =>
                  onSetReason(line.productId, reason, note)
                }
              />
            ))}
          </ul>

          <div className="mt-4">
            <label
              htmlFor="session-notes"
              className="field-label"
            >
              Session notes
            </label>
            <textarea
              id="session-notes"
              value={session.notes ?? ""}
              onChange={(e) => onSetNotes(e.currentTarget.value)}
              placeholder="Optional — e.g. 'After Pet Expo Bitec May 2026 load-in'"
              rows={2}
              className="field"
            />
          </div>

          {!guard.ok && (
            <p className="mt-3 text-xs text-[var(--color-warn-soft-fg)]">
              {guard.reason}
            </p>
          )}
        </div>
      </section>

      {/* Sticky action bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-panel-strong/95 px-4 py-3 backdrop-blur-sm sm:static sm:mt-6 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
        <div className="mx-auto flex max-w-5xl flex-col-reverse items-stretch gap-2 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="btn-ghost btn-md"
          >
            Save draft
          </button>
          <button
            type="button"
            onClick={onCommit}
            disabled={!guard.ok}
            className="btn-accent btn-xl w-full sm:w-auto"
          >
            Submit count
          </button>
        </div>
      </div>
    </>
  );
}

function CountLineRow({
  line,
  onSetCount,
  onSetReason,
}: {
  line: StockCountLine;
  onSetCount: (qty: number | null) => void;
  onSetReason: (
    reason: StockCountReason | undefined,
    note?: string,
  ) => void;
}) {
  const v = lineVariance(line);
  const committable = lineCommittable(line);
  const varianceChip =
    v === null
      ? null
      : v === 0
        ? { cls: "chip chip-ok", label: "match" }
        : Math.abs(v) <= 2
          ? {
              cls: "chip chip-warn",
              label: `${v > 0 ? "+" : ""}${v}`,
            }
          : {
              cls: "chip chip-danger",
              label: `${v > 0 ? "+" : ""}${v}`,
            };

  return (
    <li className="panel-quiet grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 px-3 py-3 sm:gap-4 sm:px-4">
      <div className="min-w-0">
        <p className="headline-upright text-base text-text leading-tight">
          {line.name}
        </p>
        <p className="mt-0.5 mono num text-xs text-faint">
          {line.sku} · expected{" "}
          <span className="text-muted">{line.expectedQty}</span>
        </p>
        {v !== null && v !== 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {STOCK_COUNT_REASONS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => onSetReason(r, line.reasonNote)}
                className={
                  line.reason === r
                    ? "chip chip-gold"
                    : "chip chip-neutral hover:text-accent-strong"
                }
              >
                {r}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col items-end gap-1">
        <input
          type="number"
          inputMode="numeric"
          min={0}
          step={1}
          value={line.countedQty ?? ""}
          onChange={(e) => {
            const val = e.currentTarget.value;
            if (val === "") return onSetCount(null);
            const n = Number(val);
            if (!Number.isFinite(n)) return;
            onSetCount(Math.max(0, Math.floor(n)));
          }}
          placeholder="—"
          aria-label={`Counted qty for ${line.sku}`}
          className="field mono num w-24 text-right text-lg font-bold"
        />
        {v !== null && v !== 0 && !committable && (
          <span className="mono text-[10px] font-bold uppercase tracking-wider text-[var(--color-warn-soft-fg)]">
            pick reason
          </span>
        )}
      </div>

      <div className="flex w-16 justify-end">
        {varianceChip && (
          <span className={varianceChip.cls + " mono num"}>
            {varianceChip.label}
          </span>
        )}
      </div>
    </li>
  );
}
