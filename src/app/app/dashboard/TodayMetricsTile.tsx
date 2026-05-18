import { formatTHB } from "@/lib/money/format";

export function TodayMetricsTile({
  totalSatang,
  bills,
  avgBillSatang,
}: {
  totalSatang: number;
  bills: number;
  avgBillSatang: number;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <Tile label="Total today" value={`${formatTHB(totalSatang)} THB`} />
      <Tile label="Bills" value={String(bills)} />
      <Tile label="Avg bill" value={`${formatTHB(avgBillSatang)} THB`} />
    </div>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="panel-quiet border-l-2 border-gold px-5 py-4">
      <p className="kicker">{label}</p>
      <p className="mono num mt-2 text-3xl font-semibold text-accent-deep sm:text-4xl">
        {value}
      </p>
    </div>
  );
}
