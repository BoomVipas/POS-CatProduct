"use client";

import { Trash2 } from "lucide-react";
import { useCart, useCartDispatch } from "@/lib/pos/cart-store";
import { useT } from "@/lib/i18n/provider";
import { formatTHB } from "@/lib/money/format";
import {
  splitsRemaining,
  splitsTotal,
  validateSplits,
} from "@/lib/pos/splits";
import type { PaymentMethod } from "@/lib/pos/types";

// User-selectable methods for splits (sample/mixed are derived, not picked).
type SplitMethod = "cash" | "promptpay" | "transfer" | "card" | "other";
const METHODS: SplitMethod[] = [
  "cash",
  "promptpay",
  "transfer",
  "card",
  "other",
];

export function SplitPaymentBlock({ totalSatang }: { totalSatang: number }) {
  const cart = useCart();
  const dispatch = useCartDispatch();
  const { t } = useT();

  const labels: Record<SplitMethod, string> = {
    cash: t.pos.methodCash,
    promptpay: t.pos.methodPromptPay,
    transfer: t.pos.methodTransfer,
    card: t.pos.methodCard,
    other: t.pos.methodOther,
  };

  const remaining = splitsRemaining(cart.splits, totalSatang);
  const total = splitsTotal(cart.splits);
  const validation = validateSplits(cart.splits, totalSatang);

  function addSplit() {
    // Default to remaining amount, method = first method not yet used (or cash).
    const used = new Set<string>(cart.splits.map((s) => s.method));
    const nextMethod: PaymentMethod =
      METHODS.find((m) => !used.has(m)) ?? "cash";
    dispatch({
      type: "ADD_SPLIT",
      split: {
        method: nextMethod,
        amountSatang: Math.max(0, remaining),
      },
    });
  }

  return (
    <div className="panel-quiet p-4">
      <div className="flex items-baseline justify-between gap-2">
        <p className="kicker">
          {t.pos.splitPayment} · {t.pos.splitsCount(cart.splits.length)}
        </p>
        <button
          type="button"
          onClick={() => dispatch({ type: "CLEAR_SPLITS" })}
          className="btn-link text-[11px]"
        >
          {t.pos.singlePayment} →
        </button>
      </div>

      <ul className="mt-3 grid gap-2">
        {cart.splits.map((s, i) => (
          <li
            key={i}
            className="grid gap-2 rounded-[var(--radius-md)] border border-line bg-panel p-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,140px)_auto] sm:items-center"
          >
            <div className="flex flex-wrap gap-1">
              {METHODS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() =>
                    dispatch({
                      type: "UPDATE_SPLIT",
                      index: i,
                      patch: { method: m as PaymentMethod },
                    })
                  }
                  className={
                    s.method === m
                      ? "btn-accent btn-sm"
                      : "btn-ghost btn-sm"
                  }
                >
                  {labels[m]}
                </button>
              ))}
            </div>
            <input
              type="number"
              min={0}
              step={1}
              value={s.amountSatang === 0 ? "" : (s.amountSatang / 100).toString()}
              onChange={(e) => {
                const v = e.currentTarget.value;
                const n = v === "" ? 0 : Number(v);
                dispatch({
                  type: "UPDATE_SPLIT",
                  index: i,
                  patch: {
                    amountSatang: Number.isFinite(n)
                      ? Math.max(0, Math.round(n * 100))
                      : 0,
                  },
                });
              }}
              placeholder="amount"
              className="field mono num w-full py-1.5 text-right"
            />
            <button
              type="button"
              onClick={() =>
                dispatch({ type: "REMOVE_SPLIT", index: i })
              }
              aria-label="Remove split"
              className="ml-auto grid h-7 w-7 place-items-center rounded-full bg-soft text-muted hover:text-text"
            >
              <Trash2 size={14} />
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={addSplit}
          className="btn-ghost btn-sm"
        >
          {t.pos.addSplit}
        </button>
        <div
          className={
            validation.ok
              ? "chip chip-ok mono"
              : validation.reason === "over"
                ? "chip chip-danger mono"
                : "chip chip-warn mono"
          }
        >
          {validation.ok ? (
            <>✓ {formatTHB(total)} / {formatTHB(totalSatang)}</>
          ) : validation.reason === "over" ? (
            <>{t.pos.splitOver} {formatTHB(validation.offBy)}</>
          ) : (
            <>{t.pos.splitRemaining}: {formatTHB(validation.offBy)}</>
          )}
        </div>
      </div>
    </div>
  );
}
