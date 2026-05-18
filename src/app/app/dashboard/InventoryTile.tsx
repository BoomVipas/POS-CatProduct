import { Pill } from "@/components/ui/Pill";

export function InventoryTile({
  rows,
}: {
  rows: Array<{ sku: string; name: string; current: number; starting: number }>;
}) {
  return (
    <div className="panel-quiet border-l-2 border-line-strong px-5 py-4">
      <p className="kicker">Inventory remaining</p>
      <table className="tbl mt-3">
        <thead>
          <tr>
            <th>Product</th>
            <th className="text-right">Stock</th>
            <th className="text-right">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const pct =
              r.starting > 0 ? Math.round((r.current / r.starting) * 100) : 0;
            const tone =
              r.current === 0 ? "danger" : r.current <= 5 ? "warn" : "ok";
            return (
              <tr key={r.sku}>
                <td>
                  <p className="font-semibold text-text">{r.name}</p>
                  <p className="mono num text-[11px] text-muted">{r.sku}</p>
                </td>
                <td className="mono num text-right font-semibold text-accent-deep">
                  {r.current} / {r.starting}
                </td>
                <td className="text-right">
                  <Pill tone={tone}>
                    {r.current === 0 ? "sold out" : `${pct}%`}
                  </Pill>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
