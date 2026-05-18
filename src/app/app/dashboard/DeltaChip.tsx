// Tiny chip showing period-over-period delta. Pattern from Shopify
// comparison reports / Power BI KPI cards.

export function DeltaChip({
  pct,
  label = "vs prev",
  invert = false,
}: {
  pct: number | null;
  label?: string;
  /** When invert is true, a negative delta is "good" (e.g. fewer voids,
   *  fewer refunds). Default false: positive = good (more revenue). */
  invert?: boolean;
}) {
  if (pct === null) {
    return (
      <span className="chip chip-neutral">
        — {label}
      </span>
    );
  }
  const goodSide = invert ? pct < 0 : pct > 0;
  const isFlat = pct === 0;
  const cls = isFlat
    ? "chip chip-neutral"
    : goodSide
      ? "chip chip-ok"
      : "chip chip-danger";
  const arrow = isFlat ? "·" : pct > 0 ? "▲" : "▼";
  return (
    <span className={cls}>
      <span>{arrow}</span>
      <span className="num">{Math.abs(pct).toFixed(1)}%</span>
      <span className="font-semibold opacity-80">{label}</span>
    </span>
  );
}
