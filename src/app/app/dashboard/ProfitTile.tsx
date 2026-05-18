import { formatTHB } from "@/lib/money/format";

export function ProfitTile({
  revenueSatang,
  cogsSatang,
  profitSatang,
  marginPct,
  ordersWithCost,
  totalOrders,
}: {
  revenueSatang: number;
  cogsSatang: number;
  profitSatang: number;
  marginPct: number | null;
  ordersWithCost: number;
  totalOrders: number;
}) {
  const coverage = totalOrders > 0 ? Math.round((ordersWithCost / totalOrders) * 100) : 0;
  return (
    <div className="panel-quiet border-l-2 border-gold px-5 py-4">
      <div className="flex items-baseline justify-between gap-3">
        <p className="kicker">Profit today</p>
        {marginPct !== null && (
          <span className="chip chip-ok">
            <span className="num">{marginPct.toFixed(1)}%</span> margin
          </span>
        )}
      </div>
      {marginPct === null ? (
        <p className="mt-2 text-sm text-muted">
          Add a unit cost to your products to see margin and profit here.
        </p>
      ) : (
        <>
          <p className="mono num mt-2 text-3xl font-semibold text-accent-deep sm:text-4xl">
            {formatTHB(profitSatang)} THB
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3 border-t border-line-soft pt-3 text-xs">
            <div>
              <p className="kicker">Revenue</p>
              <p className="mono num mt-1 text-base font-semibold text-text">
                {formatTHB(revenueSatang)}
              </p>
            </div>
            <div>
              <p className="kicker">COGS</p>
              <p className="mono num mt-1 text-base font-semibold text-text">
                {formatTHB(cogsSatang)}
              </p>
            </div>
          </div>
          {coverage < 100 && totalOrders > 0 && (
            <p className="mt-3 text-[11px] text-muted">
              Margin computed from {ordersWithCost} of {totalOrders} order
              {totalOrders === 1 ? "" : "s"} ({coverage}% with cost).
            </p>
          )}
        </>
      )}
    </div>
  );
}
