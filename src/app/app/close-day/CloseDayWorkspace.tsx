"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useDemoSales } from "@/lib/demo/useDemoSales";
import { useDemoCloseDay } from "@/lib/demo/useDemoCloseDay";
import { useDemoAudit } from "@/lib/demo/useDemoAudit";
import { useT } from "@/lib/i18n/provider";
import { useToast } from "@/components/ui/Toast";
import { isoDateInTZ } from "@/lib/date";
import { formatTHB, bahtToSatang } from "@/lib/money/format";
import {
  computeExpectedCashFor,
  newCloseDayId,
  type DemoCloseDayRecord,
} from "@/lib/demo/close-day";
import { formatDateTimeTH } from "@/lib/date";

// THB denominations (largest to smallest). Values in baht — multiplied by counts
// then converted to satang once before feeding the existing `counted` state.
const DENOMS: ReadonlyArray<{ key: string; baht: number; kind: "note" | "coin" }> = [
  { key: "1000", baht: 1000, kind: "note" },
  { key: "500", baht: 500, kind: "note" },
  { key: "100", baht: 100, kind: "note" },
  { key: "50", baht: 50, kind: "note" },
  { key: "20", baht: 20, kind: "note" },
  { key: "10", baht: 10, kind: "coin" },
  { key: "5", baht: 5, kind: "coin" },
  { key: "2", baht: 2, kind: "coin" },
  { key: "1", baht: 1, kind: "coin" },
];

export function CloseDayWorkspace() {
  const { orders, ready: salesReady } = useDemoSales();
  const closeDay = useDemoCloseDay();
  const audit = useDemoAudit();
  const { push } = useToast();
  const { t } = useT();

  const today = isoDateInTZ(new Date());
  const expected = useMemo(
    () => computeExpectedCashFor(orders, today),
    [orders, today],
  );

  // Gross sales (all payment methods, today, non-void) — for KPI display only.
  const gross = useMemo(() => {
    let total = 0;
    for (const o of orders) {
      if ((o.status ?? "completed") === "voided") continue;
      if (isoDateInTZ(o.createdAt) !== today) continue;
      total += o.totalSatang;
    }
    return total;
  }, [orders, today]);

  const [counted, setCounted] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [counts, setCounts] = useState<Record<string, string>>({});

  if (!salesReady) {
    return (
      <p className="panel-quiet px-4 py-6 text-center text-sm text-muted">
        {t.common.loading}
      </p>
    );
  }

  const countedSatang =
    counted.trim() === "" ? 0 : bahtToSatang(Number(counted));
  const discrepancy = countedSatang - expected;
  const closedToday = closeDay.records.filter((r) => r.isoDate === today);
  const lastClose = closedToday[0];
  const hasCount = counted.trim() !== "";

  function applyDenomTotal(next: Record<string, string>) {
    let totalBaht = 0;
    for (const d of DENOMS) {
      const n = Number(next[d.key] ?? "");
      if (Number.isFinite(n) && n > 0) totalBaht += d.baht * Math.floor(n);
    }
    setCounted(totalBaht > 0 ? String(totalBaht) : "");
  }

  function setDenomCount(key: string, value: string) {
    const next = { ...counts, [key]: value };
    setCounts(next);
    applyDenomTotal(next);
  }

  function handleClose() {
    if (counted.trim() === "") {
      push({
        kind: "warn",
        title: "Counted amount required",
        message: "Type the amount you actually counted.",
      });
      return;
    }
    if (discrepancy !== 0 && reason.trim().length < 3) {
      push({
        kind: "warn",
        title: "Reason required",
        message: "Discrepancies need at least 3 characters of explanation.",
      });
      return;
    }
    const record: DemoCloseDayRecord = {
      id: newCloseDayId(),
      isoDate: today,
      expectedSatang: expected,
      countedSatang,
      discrepancySatang: discrepancy,
      reason: reason.trim(),
      closedAt: new Date().toISOString(),
    };
    closeDay.append(record);
    audit.log({
      action: "demo_seed",
      targetTable: "close_day",
      targetId: record.id,
      summary: `Closed ${today} · expected ${formatTHB(expected)} · counted ${formatTHB(countedSatang)} · discrepancy ${discrepancy >= 0 ? "+" : ""}${formatTHB(discrepancy)}`,
      newValue: record,
    });
    push({
      kind: discrepancy === 0 ? "success" : "warn",
      title:
        discrepancy === 0
          ? "Day closed — drawer matches"
          : `Day closed — ${discrepancy > 0 ? "surplus" : "short"} ${formatTHB(Math.abs(discrepancy))} THB`,
      message: `Recorded against ${today}.`,
    });
    setCounted("");
    setReason("");
    setCounts({});
  }

  function handlePrint() {
    if (typeof window !== "undefined") window.print();
  }

  function handleSaveDraft() {
    push({
      kind: "info",
      title: "Draft kept in this session",
      message: "Counts stay until you lock the day or reload.",
    });
  }

  // Status chip variant for today's close-out state.
  const statusVariant: "ok" | "warn" | "neutral" =
    closedToday.length > 0 ? "ok" : hasCount ? "warn" : "neutral";
  const statusLabel =
    closedToday.length > 0 ? "Closed" : hasCount ? "Closing" : "Open";

  return (
    <>
      {/* ───────── Page header ───────── */}
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-line-soft pb-6">
        <div>
          <p className="kicker kicker-gold">Close day</p>
          <h1 className="headline-upright mono num text-3xl text-accent-deep mt-2">
            {today}
          </h1>
          <p className="mt-2 max-w-[58ch] text-sm text-text-soft">
            Reconcile counted cash against today&rsquo;s recorded cash sales,
            then lock the day so totals stop moving.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span
            className={
              statusVariant === "ok"
                ? "chip chip-ok"
                : statusVariant === "warn"
                  ? "chip chip-warn"
                  : "chip chip-neutral"
            }
          >
            {statusLabel}
          </span>
          <p className="text-[11px] text-faint">
            Demo mode · DD-92 will persist to Supabase
          </p>
        </div>
      </header>

      {/* ───────── KPI strip ───────── */}
      <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiTile
          label="Gross sales"
          value={`${formatTHB(gross)} THB`}
        />
        <KpiTile
          label="Cash expected"
          value={`${formatTHB(expected)} THB`}
        />
        <KpiTile
          label="Cash counted"
          value={hasCount ? `${formatTHB(countedSatang)} THB` : "—"}
        />
        <KpiTile
          label="Variance"
          value={
            hasCount
              ? `${discrepancy > 0 ? "+" : discrepancy < 0 ? "−" : ""}${formatTHB(Math.abs(discrepancy))} THB`
              : "—"
          }
          chip={
            hasCount
              ? discrepancy === 0
                ? { variant: "ok", label: "Matches" }
                : Math.abs(discrepancy) >= 10000 // ≥ 100 THB
                  ? {
                      variant: "danger",
                      label: discrepancy > 0 ? "Surplus" : "Short",
                    }
                  : {
                      variant: "warn",
                      label: discrepancy > 0 ? "Surplus" : "Short",
                    }
              : undefined
          }
        />
      </section>

      {/* ───────── Cash count block ───────── */}
      <section className="panel-lift mt-6 p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-line-soft pb-4">
          <div>
            <p className="kicker">Cash count</p>
            <h2 className="headline-upright text-xl text-accent-deep mt-1">
              Drawer denominations
            </h2>
          </div>
          <p className="text-xs text-muted">
            Counts feed the total below; type a single amount on the right to
            override.
          </p>
        </div>

        <div className="mt-5 grid gap-2">
          {DENOMS.map((d) => {
            const raw = counts[d.key] ?? "";
            const n = Number(raw);
            const lineSatang =
              raw.trim() === "" || !Number.isFinite(n) || n <= 0
                ? 0
                : bahtToSatang(d.baht * Math.floor(n));
            return (
              <div
                key={d.key}
                className="grid grid-cols-[7rem_1fr_8rem] items-center gap-3 border-b border-line-soft/70 py-1.5 last:border-b-0"
              >
                <div className="flex items-baseline gap-2">
                  <span className="headline-upright mono num text-base text-accent-deep">
                    ฿{d.baht}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-faint">
                    {d.kind}
                  </span>
                </div>
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={1}
                  value={raw}
                  onChange={(e) => setDenomCount(d.key, e.currentTarget.value)}
                  placeholder="0"
                  className="field num py-2 text-center text-base"
                  aria-label={`Count of ${d.baht} THB ${d.kind}`}
                />
                <span className="num text-right text-sm text-text">
                  {lineSatang > 0 ? `${formatTHB(lineSatang)} THB` : "—"}
                </span>
              </div>
            );
          })}
        </div>

        {/* manual total override */}
        <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <label
              htmlFor="counted-total"
              className="field-label"
            >
              Counted total (THB)
            </label>
            <input
              id="counted-total"
              type="number"
              min={0}
              step={1}
              value={counted}
              onChange={(e) => {
                setCounted(e.currentTarget.value);
                // user is overriding — clear per-denom map so it doesn't fight
                setCounts({});
              }}
              placeholder={`${formatTHB(expected)} THB`}
              className="field num text-right text-2xl text-accent-deep"
            />
          </div>
          {hasCount && (
            <div
              className={
                discrepancy === 0
                  ? "chip chip-ok justify-self-end"
                  : "chip chip-warn justify-self-end"
              }
            >
              {discrepancy === 0
                ? "Drawer matches"
                : `${discrepancy > 0 ? "+" : "−"}${formatTHB(Math.abs(discrepancy))} THB`}
            </div>
          )}
        </div>

        {/* notes */}
        <div className="mt-5">
          <label htmlFor="close-reason" className="field-label">
            Notes {hasCount && discrepancy !== 0 ? "(required for variance)" : "(optional)"}
          </label>
          <textarea
            id="close-reason"
            value={reason}
            onChange={(e) => setReason(e.currentTarget.value)}
            placeholder="e.g. wrong change given to one customer; cash in apron pocket"
            rows={3}
            className="field text-sm"
          />
        </div>

        {lastClose && (
          <p className="mt-4 text-xs text-muted">
            Last close today: {formatDateTimeTH(lastClose.closedAt)} · counted{" "}
            <span className="num">{formatTHB(lastClose.countedSatang)}</span> ·
            discrepancy{" "}
            <span className="num">
              {lastClose.discrepancySatang >= 0 ? "+" : "−"}
              {formatTHB(Math.abs(lastClose.discrepancySatang))}
            </span>
          </p>
        )}
      </section>

      {/* ───────── History ───────── */}
      {closeDay.records.length > 0 && (
        <section className="panel-quiet mt-6 p-5">
          <div className="flex items-baseline justify-between border-b border-line-soft pb-3">
            <h2 className="headline-upright text-lg text-accent-deep">
              History
            </h2>
            <span className="kicker">Last 10</span>
          </div>
          <ul className="mt-3 grid gap-2">
            {closeDay.records.slice(0, 10).map((r) => (
              <li
                key={r.id}
                className="grid gap-1 rounded-[var(--radius-md)] border border-line-soft bg-panel/70 px-4 py-3 text-xs"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="mono num font-bold text-accent-deep">
                    {r.isoDate}
                  </span>
                  <span className="text-muted">
                    {formatDateTimeTH(r.closedAt)}
                  </span>
                </div>
                <div className="flex flex-wrap items-baseline justify-between gap-2 text-text">
                  <span>
                    expected{" "}
                    <span className="num font-bold">
                      {formatTHB(r.expectedSatang)}
                    </span>
                  </span>
                  <span>
                    counted{" "}
                    <span className="num font-bold">
                      {formatTHB(r.countedSatang)}
                    </span>
                  </span>
                  <span
                    className={
                      r.discrepancySatang === 0 ? "chip chip-ok" : "chip chip-warn"
                    }
                  >
                    {r.discrepancySatang >= 0 ? "+" : "−"}
                    <span className="num">
                      {formatTHB(Math.abs(r.discrepancySatang))}
                    </span>
                  </span>
                </div>
                {r.reason && (
                  <p className="text-muted italic">&ldquo;{r.reason}&rdquo;</p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-8">
        <Link
          href="/app"
          className="btn-link text-sm"
        >
          ← {t.chrome.appHome}
        </Link>
      </div>

      {/* ───────── Sticky action bar ───────── */}
      <div className="sticky bottom-0 -mx-6 mt-8 border-t border-line bg-panel-strong/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-panel-strong/80 no-print">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="btn-ghost btn-md"
            >
              Save draft
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="btn-link text-sm"
            >
              Print summary
            </button>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={!hasCount}
            className="btn-accent btn-xl w-full sm:w-auto"
          >
            Lock day
          </button>
        </div>
      </div>
    </>
  );
}

function KpiTile({
  label,
  value,
  chip,
}: {
  label: string;
  value: string;
  chip?: { variant: "ok" | "warn" | "danger"; label: string };
}) {
  return (
    <div className="panel-quiet relative border-l-2 border-l-gold p-4">
      <p className="kicker">{label}</p>
      <p className="mono num text-3xl text-accent-deep mt-2">{value}</p>
      {chip && (
        <span
          className={
            chip.variant === "ok"
              ? "chip chip-ok mt-3"
              : chip.variant === "danger"
                ? "chip chip-danger mt-3 text-sm"
                : "chip chip-warn mt-3"
          }
        >
          {chip.label}
        </span>
      )}
    </div>
  );
}
