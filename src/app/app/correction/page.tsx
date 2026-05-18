import Link from "next/link";
import { CorrectionList } from "./CorrectionList";

export default function CorrectionPage() {
  return (
    <main className="mx-auto max-w-6xl px-5 py-10">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-line-soft pb-6">
        <div>
          <p className="kicker kicker-gold">Corrections</p>
          <h1 className="headline-upright mt-2 text-3xl text-accent-deep">
            Void &amp; refund ledger
          </h1>
          <p className="mt-2 max-w-[62ch] text-sm text-text-soft">
            Void recorded sales and restore inventory. Voided orders are
            excluded from dashboard totals. Every action is audit-logged.
          </p>
          <p className="mt-1 text-xs text-muted">
            Demo mode: writes to localStorage. DD-96 will swap in the real{" "}
            <code className="mono text-accent-strong">void_order</code> RPC.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/app/audit-log" className="btn-link text-sm">
            View audit log
          </Link>
        </div>
      </header>

      <CorrectionList />

      <div className="mt-8 flex justify-between text-sm">
        <Link href="/app" className="btn-link">
          ← App home
        </Link>
        <Link href="/app/pos" className="btn-link">
          Open POS →
        </Link>
      </div>
    </main>
  );
}
