import { formatTHB } from "@/lib/money/format";

export function TopSellersTile({
  sellers,
}: {
  sellers: Array<{ sku: string; name: string; qty: number; revenueSatang: number }>;
}) {
  const max = Math.max(1, ...sellers.map((s) => s.revenueSatang));
  return (
    <div className="panel-quiet border-l-2 border-line-strong px-5 py-4">
      <p className="kicker">Top sellers today</p>
      <table className="tbl mt-3">
        <thead>
          <tr>
            <th>Product</th>
            <th className="text-right">Qty</th>
            <th className="text-right">Revenue</th>
          </tr>
        </thead>
        <tbody>
          {sellers.map((s) => {
            const pct = (s.revenueSatang / max) * 100;
            return (
              <tr key={s.sku}>
                <td>
                  <p className="font-semibold text-text">{s.name}</p>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-soft">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-accent to-accent-deep"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </td>
                <td className="mono num text-right text-muted">×{s.qty}</td>
                <td className="mono num text-right font-semibold text-accent-deep">
                  {formatTHB(s.revenueSatang)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
