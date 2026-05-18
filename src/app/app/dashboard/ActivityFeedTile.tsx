"use client";

import { useDemoSales } from "@/lib/demo/useDemoSales";
import { useDemoCatalog } from "@/lib/demo/useDemoCatalog";
import { useT } from "@/lib/i18n/provider";
import { deriveActivityFeed } from "@/lib/demo/activityFeed";
import { formatTHB } from "@/lib/money/format";
import { formatDateTimeTH } from "@/lib/date";
import { Pill, type PillTone } from "@/components/ui/Pill";

const TONE: Record<string, PillTone> = {
  sale: "ok",
  void: "danger",
  refund: "warn",
  low_stock: "warn",
  sold_out: "danger",
};

export function ActivityFeedTile() {
  const { orders } = useDemoSales();
  const { items } = useDemoCatalog();
  const { t } = useT();

  const entries = deriveActivityFeed(orders, items, { entryLimit: 10 });

  return (
    <div className="panel-quiet border-l-2 border-line-strong px-5 py-4">
      <div className="flex items-baseline justify-between">
        <p className="kicker">{t.pos.activityFeedHeader}</p>
        <span className="grid h-2 w-2 place-items-center rounded-full bg-[var(--color-ok-soft-fg)]/80">
          <span className="h-2 w-2 animate-ping rounded-full bg-[var(--color-ok-soft-fg)]/60" />
        </span>
      </div>
      {entries.length === 0 ? (
        <p className="mt-3 text-sm text-muted">
          No activity yet today. Make a sale at /app/pos.
        </p>
      ) : (
        <table className="tbl mt-3">
          <thead>
            <tr>
              <th>Kind</th>
              <th>Detail</th>
              <th className="text-right">Amount</th>
              <th className="text-right">Time</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e, i) => (
              <tr key={i}>
                <td>
                  <Pill tone={TONE[e.kind] ?? "neutral"}>
                    {e.kind.replace("_", " ")}
                  </Pill>
                </td>
                <td>
                  <p className="font-semibold text-text">{e.title}</p>
                  {e.body && (
                    <p className="text-xs text-muted">{e.body}</p>
                  )}
                </td>
                <td className="mono num text-right font-semibold text-accent-deep">
                  {e.amountSatang !== undefined
                    ? formatTHB(e.amountSatang)
                    : ""}
                </td>
                <td className="mono num text-right text-[11px] text-muted">
                  {formatDateTimeTH(e.at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
