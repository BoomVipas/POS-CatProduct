import Link from "next/link";
import { AuditLogList } from "./AuditLogList";

export default function AuditLogPage() {
  return (
    <main className="mx-auto max-w-[96rem] px-6 py-10">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-line-soft pb-6">
        <div className="max-w-2xl">
          <p className="kicker kicker-gold">Audit log</p>
          <h1 className="headline-upright mt-3 text-3xl text-accent-deep">
            Forensic ledger
          </h1>
          <p className="mt-3 text-sm text-text-soft">
            Append-only record of demo-mode actions — settings updates, catalog
            edits, sales, voids, send-later transitions. Every entry carries
            actor, timestamp, and before/after state.
          </p>
          <p className="mt-2 text-xs text-muted">
            Demo mode: localStorage. DD-97 will swap this for the workspace-scoped
            Supabase <code className="mono">audit_logs</code> table.
          </p>
        </div>
        <Link href="/app" className="btn-link text-sm">
          App home
        </Link>
      </header>

      <AuditLogList />
    </main>
  );
}
