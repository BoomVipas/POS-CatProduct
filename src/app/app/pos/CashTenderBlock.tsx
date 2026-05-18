"use client";

import { useCart, useCartDispatch } from "@/lib/pos/cart-store";
import { useT } from "@/lib/i18n/provider";
import { formatTHB } from "@/lib/money/format";

const PRESETS_BAHT = [100, 500, 1000, 2000];

/**
 * Quick-cash tender pad. Shows when paymentMethod === "cash" and total > 0.
 * Square-pattern: a few common denominations + Exact + custom input. Live
 * change-due display with a positive (green) or zero (neutral) tone.
 */
export function CashTenderBlock({ totalSatang }: { totalSatang: number }) {
  const cart = useCart();
  const dispatch = useCartDispatch();
  const { t } = useT();

  function setTendered(satang: number) {
    dispatch({ type: "SET_CASH_TENDERED", satang });
  }

  const tendered = cart.cashTenderedSatang;
  const change = Math.max(0, tendered - totalSatang);
  const short = tendered > 0 && tendered < totalSatang;

  return (
    <div className="panel-quiet p-4">
      <p className="kicker">{t.pos.amountTendered}</p>

      <div className="mt-3 flex flex-wrap gap-2">
        {PRESETS_BAHT.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setTendered(p * 100)}
            className={
              tendered === p * 100
                ? "btn-accent btn-sm mono num"
                : "btn-ghost btn-sm mono num"
            }
          >
            {p}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setTendered(totalSatang)}
          className={
            tendered === totalSatang && totalSatang > 0
              ? "btn-accent btn-sm"
              : "btn-ghost btn-sm"
          }
        >
          {t.pos.exact}
        </button>
        <input
          type="number"
          min={0}
          step={1}
          value={tendered === 0 ? "" : (tendered / 100).toString()}
          onChange={(e) => {
            const v = e.currentTarget.value;
            if (v === "") return setTendered(0);
            const n = Number(v);
            if (Number.isFinite(n))
              setTendered(Math.max(0, Math.round(n * 100)));
          }}
          placeholder="custom"
          className="field mono num w-24 py-1.5 text-right"
        />
      </div>

      {tendered > 0 && (
        <div
          className={`mt-3 flex items-baseline justify-between rounded-[var(--radius-md)] px-3 py-2 ${
            short
              ? "bg-[var(--color-warn-soft-bg)] text-[var(--color-warn-soft-fg)]"
              : change > 0
                ? "bg-[var(--color-ok-soft-bg)] text-[var(--color-ok-soft-fg)]"
                : "bg-soft text-muted"
          }`}
        >
          <span className="kicker">{t.pos.changeDue}</span>
          <span className="mono num text-xl font-semibold">
            {short
              ? `−${formatTHB(totalSatang - tendered)}`
              : formatTHB(change)}{" "}
            THB
          </span>
        </div>
      )}
    </div>
  );
}
