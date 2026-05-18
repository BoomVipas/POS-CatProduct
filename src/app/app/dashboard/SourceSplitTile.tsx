import { formatTHB } from "@/lib/money/format";
import {
  orderSourceLabel,
  type OrderSource,
} from "@/lib/demo/sales";
import type { SourceSplitRow } from "@/lib/demo/source-split";

// All source bars use the brown/gold token gradient for visual cohesion.
// Channel identity is carried by the label, not by brand colors.
const TONE: Record<OrderSource, string> = {
  booth: "from-accent to-accent-deep",
  qr_menu: "from-accent to-accent-deep",
  line: "from-accent to-accent-deep",
  shopee: "from-accent to-accent-deep",
  lazada: "from-accent to-accent-deep",
  tiktok: "from-accent to-accent-deep",
  phone: "from-accent to-accent-deep",
  other: "from-accent to-accent-deep",
};

export function SourceSplitTile({
  rows,
  totalSatang,
}: {
  rows: SourceSplitRow[];
  totalSatang: number;
}) {
  if (rows.length === 0) return null;
  return (
    <div className="panel-quiet border-l-2 border-line-strong px-5 py-4">
      <p className="kicker">Revenue by source</p>
      <ul className="mt-3 grid gap-2">
        {rows.map((r) => {
          const pct =
            totalSatang > 0
              ? Math.round((r.revenueSatang / totalSatang) * 1000) / 10
              : 0;
          return (
            <li key={r.source}>
              <div className="flex items-baseline justify-between gap-2 text-sm">
                <span className="font-semibold text-text">
                  {orderSourceLabel(r.source)}
                </span>
                <span className="mono num text-muted">× {r.bills}</span>
                <span className="mono num shrink-0 font-semibold text-accent-deep">
                  {formatTHB(r.revenueSatang)}
                </span>
                <span className="mono num shrink-0 text-[11px] font-semibold text-muted">
                  {pct.toFixed(1)}%
                </span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-soft">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${TONE[r.source] ?? TONE.other}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
