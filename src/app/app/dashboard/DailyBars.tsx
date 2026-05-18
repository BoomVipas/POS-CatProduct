import { formatTHB } from "@/lib/money/format";

export function DailyBars({
  series,
}: {
  series: Array<{ date: string; totalSatang: number; bills: number }>;
}) {
  const max = Math.max(1, ...series.map((s) => s.totalSatang));
  return (
    <div className="panel-quiet border-l-2 border-line-strong px-5 py-4">
      <p className="kicker">Daily revenue</p>
      <ul className="mt-3 grid gap-1.5">
        {series.map((s) => {
          const pct = (s.totalSatang / max) * 100;
          const dayShort = s.date.slice(5); // MM-DD
          return (
            <li
              key={s.date}
              className="grid grid-cols-[44px_1fr_auto] items-center gap-2 text-sm"
            >
              <span className="mono num text-[11px] font-semibold text-muted">
                {dayShort}
              </span>
              <div className="h-3 overflow-hidden rounded-full bg-soft">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-accent to-accent-deep"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="mono num shrink-0 text-xs font-semibold text-accent-deep">
                {formatTHB(s.totalSatang)}
                {s.bills > 0 && (
                  <span className="ml-1 text-[10px] font-semibold text-muted">
                    × {s.bills}
                  </span>
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
