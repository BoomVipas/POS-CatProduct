"use client";

import Link from "next/link";
import { Fragment, useState } from "react";
import { useDemoAudit } from "@/lib/demo/useDemoAudit";
import type { DemoAuditAction } from "@/lib/demo/audit";
import { formatDateTimeTH } from "@/lib/date";

// Map each audit action to a chip variant per the forensic-ledger spec:
// info=view, warn=edit/update, danger=delete/void/reset, ok=create/commit,
// gold=admin/settings, neutral=fallback transitions.
const ACTION_CHIP: Record<DemoAuditAction, string> = {
  settings_update: "chip-gold",
  catalog_create: "chip-ok",
  catalog_update: "chip-warn",
  catalog_delete: "chip-danger",
  catalog_set_active: "chip-info",
  order_create: "chip-ok",
  order_void: "chip-danger",
  send_later_status_change: "chip-warn",
  stock_count_open: "chip-info",
  stock_count_commit: "chip-ok",
  stock_count_cancel: "chip-neutral",
  pet_create: "chip-ok",
  pet_update: "chip-warn",
  pet_delete: "chip-danger",
  demo_reset: "chip-danger",
  demo_seed: "chip-gold",
};

const ACTIONS: Array<DemoAuditAction | "all"> = [
  "all",
  "order_create",
  "order_void",
  "catalog_create",
  "catalog_update",
  "catalog_delete",
  "settings_update",
  "send_later_status_change",
  "stock_count_commit",
  "demo_seed",
  "demo_reset",
];

function formatDiffValue(value: unknown): string {
  if (value === undefined) return "—";
  if (value === null) return "null";
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export function AuditLogList() {
  const { entries, ready } = useDemoAudit();
  const [filter, setFilter] = useState<DemoAuditAction | "all">("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  if (!ready) {
    return (
      <section className="panel-quiet mt-8 px-5 py-6 text-center">
        <p className="kicker">Loading ledger</p>
        <p className="mt-2 text-sm text-muted">Reading audit entries…</p>
      </section>
    );
  }

  if (entries.length === 0) {
    return (
      <section className="panel-quiet mt-8 px-8 py-12 text-center">
        <p className="kicker kicker-gold justify-center">Audit log</p>
        <p
          className="mt-4 text-3xl text-accent-deep"
          style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}
        >
          No audit entries yet
        </p>
        <p className="mx-auto mt-3 max-w-md text-sm text-text-soft">
          Settings changes, catalog edits, sales, and voids will be recorded
          here with actor, timestamp, and before/after diff.
        </p>
        <Link href="/app" className="btn-accent btn-md mt-6 inline-flex">
          App home
        </Link>
      </section>
    );
  }

  const visible =
    filter === "all" ? entries : entries.filter((e) => e.action === filter);

  return (
    <section className="mt-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <p className="kicker">Filter by action</p>
        <div className="flex flex-wrap justify-end gap-2">
          {ACTIONS.map((a) => {
            const count =
              a === "all"
                ? entries.length
                : entries.filter((e) => e.action === a).length;
            if (a !== "all" && count === 0) return null;
            const active = a === filter;
            return (
              <button
                key={a}
                type="button"
                onClick={() => setFilter(a)}
                className={
                  active
                    ? "chip chip-gold cursor-pointer"
                    : "chip chip-neutral cursor-pointer hover:border-line-strong"
                }
                aria-pressed={active}
              >
                <span>{a}</span>
                <span className="mono ml-1 opacity-70">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="panel-quiet mt-5 overflow-hidden">
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width: "13rem" }}>Timestamp</th>
              <th style={{ width: "9rem" }}>Action</th>
              <th>Target</th>
              <th>Summary</th>
              <th style={{ width: "3rem" }} aria-label="expand" />
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && (
              <tr>
                <td colSpan={5} className="text-sm text-muted">
                  No entries with action &ldquo;{filter}&rdquo;.
                </td>
              </tr>
            )}
            {visible.map((e) => {
              const hasDiff =
                e.oldValue !== undefined || e.newValue !== undefined;
              const isOpen = expanded === e.id;
              return (
                <Fragment key={e.id}>
                  <tr
                    onClick={() =>
                      hasDiff && setExpanded(isOpen ? null : e.id)
                    }
                    className={hasDiff ? "cursor-pointer" : undefined}
                  >
                    <td>
                      <span className="mono text-xs text-text-soft">
                        {formatDateTimeTH(e.createdAt)}
                      </span>
                    </td>
                    <td>
                      <span className={`chip ${ACTION_CHIP[e.action]}`}>
                        {e.action}
                      </span>
                    </td>
                    <td>
                      <span className="btn-link text-sm">
                        {e.targetTable}
                      </span>
                      {e.targetId && (
                        <div className="mono mt-1 text-[11px] text-muted">
                          {e.targetId}
                        </div>
                      )}
                    </td>
                    <td>
                      <span
                        className="block max-w-[42ch] truncate text-sm text-text"
                        title={e.summary}
                      >
                        {e.summary}
                      </span>
                    </td>
                    <td className="text-right">
                      {hasDiff ? (
                        <span
                          className="mono text-xs text-accent-strong"
                          aria-hidden
                        >
                          {isOpen ? "−" : "+"}
                        </span>
                      ) : null}
                    </td>
                  </tr>
                  {hasDiff && isOpen && (
                    <tr>
                      <td colSpan={5} style={{ padding: 0 }}>
                        <div className="panel-quiet m-3 p-4">
                          <p className="kicker">Before / after</p>
                          <div className="mt-3 grid gap-3 md:grid-cols-2">
                            <div>
                              <p className="mono text-[11px] uppercase tracking-wider text-muted">
                                old
                              </p>
                              <pre className="mono mt-1 max-h-64 overflow-auto rounded-[var(--radius-md)] border border-line-soft bg-soft px-3 py-2 text-[12px] leading-relaxed text-text">
                                {formatDiffValue(e.oldValue)}
                              </pre>
                            </div>
                            <div>
                              <p className="mono text-[11px] uppercase tracking-wider text-muted">
                                new
                              </p>
                              <pre className="mono mt-1 max-h-64 overflow-auto rounded-[var(--radius-md)] border border-line-soft bg-soft px-3 py-2 text-[12px] leading-relaxed text-text">
                                {formatDiffValue(e.newValue)}
                              </pre>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

