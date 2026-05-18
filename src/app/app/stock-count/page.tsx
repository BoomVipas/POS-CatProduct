import Link from "next/link";
import { StockCountManager } from "./StockCountManager";

export default function StockCountPage() {
  const today = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <main className="mx-auto max-w-5xl px-5 py-8 pb-32 sm:pb-10">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-line-soft pb-5">
        <div className="min-w-0">
          <p className="kicker kicker-gold">Stock count</p>
          <h1 className="headline-upright text-3xl text-accent-deep mt-2">
            Daily reconciliation
          </h1>
          <p className="mt-2 max-w-[62ch] text-sm text-text-soft">
            Walk the shelves, enter actual quantities, and the system reconciles
            variance vs. expected. Commit at close of day to push counts into
            stock and log per-line audit.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="mono num text-xs text-muted">{today}</span>
          <Link
            href="/app"
            className="btn-link text-xs uppercase tracking-wider"
          >
            ← Home
          </Link>
        </div>
      </header>

      <StockCountManager />
    </main>
  );
}
