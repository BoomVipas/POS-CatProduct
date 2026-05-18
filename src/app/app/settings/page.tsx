import Link from "next/link";
import { SettingsForm } from "./Form";
import { DangerZone } from "./DangerZone";

export default function SettingsPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-line-soft pb-6">
        <div>
          <p className="kicker kicker-gold">Settings</p>
          <h1 className="headline-upright mt-2 text-3xl text-accent-deep">
            Workspace configuration
          </h1>
          <p className="mt-2 max-w-[62ch] text-sm text-text-soft">
            Workspace-level configuration that the POS reads at runtime.
          </p>
          <p className="mt-1 text-xs text-muted">
            Demo mode: changes save to your browser only. DD-100 will move these
            into the Supabase{" "}
            <code className="mono text-accent-strong">workspaces</code> row.
          </p>
        </div>
        <span className="chip chip-neutral">Owner only</span>
      </header>

      <div className="mt-8">
        <SettingsForm />
      </div>

      <div className="fleuron my-10">
        <span>※</span>
      </div>

      <DangerZone />

      <div className="mt-8 flex justify-between text-sm">
        <Link href="/app" className="btn-link">
          ← App home
        </Link>
      </div>
    </main>
  );
}
