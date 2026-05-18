import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/database.types";
import { formatDateTimeTH } from "@/lib/date";

type Row = Database["public"]["Tables"]["audit_logs"]["Row"];

const MOCK: Row[] = [
  {
    id: "a-1",
    workspace_id: null,
    user_id: null,
    action: "approve_application",
    target_table: "applications",
    target_id: "00000000-0000-0000-0000-000000000010",
    old_value: null,
    new_value: { brand_name: "Meow House" },
    created_at: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
  },
  {
    id: "a-2",
    workspace_id: "11111111-1111-1111-1111-111111111111",
    user_id: "00000000-0000-0000-0000-aaaaaaaaaaaa",
    action: "create_order",
    target_table: "orders",
    target_id: "00000000-0000-0000-0000-c000000c000c",
    old_value: null,
    new_value: { order_number: "event_017", total_satang: 89000 },
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: "a-3",
    workspace_id: "11111111-1111-1111-1111-111111111111",
    user_id: "00000000-0000-0000-0000-aaaaaaaaaaaa",
    action: "void_order",
    target_table: "orders",
    target_id: "00000000-0000-0000-0000-c000000c0001",
    old_value: { order_number: "event_011" },
    new_value: { reason: "wrong total" },
    created_at: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
  },
];

// Classify action into a chip tone. Pure presentation; no new copy.
function actionTone(action: string): "ok" | "warn" | "danger" | "info" {
  const a = action.toLowerCase();
  if (a.includes("delete") || a.includes("void") || a.includes("reject") || a.includes("revoke")) return "danger";
  if (a.includes("update") || a.includes("edit") || a.includes("correct") || a.includes("suspend")) return "warn";
  if (a.includes("approve") || a.includes("create") || a.includes("grant") || a.includes("issue")) return "ok";
  return "info";
}

function shortId(id: string | null | undefined, n = 8) {
  if (!id) return "—";
  return id.length > n ? id.slice(0, n) : id;
}

function brief(value: unknown): string {
  if (!value || typeof value !== "object") return "";
  try {
    const entries = Object.entries(value as Record<string, unknown>).slice(0, 2);
    return entries
      .map(([k, v]) => `${k}: ${typeof v === "string" ? v : JSON.stringify(v)}`)
      .join(" · ");
  } catch {
    return "";
  }
}

export default async function AuditLogPage() {
  let rows: Row[] = [];
  let isMock = false;
  let errorMsg: string | null = null;

  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      isMock = true;
      rows = MOCK;
    } else {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      rows = data ?? [];
    }
  } catch (e) {
    errorMsg = e instanceof Error ? e.message : "Failed to load audit log.";
  }

  return (
    <div className="mx-auto w-full max-w-[96rem] px-6 py-8">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-line-soft pb-5">
        <div>
          <p className="kicker kicker-gold">Platform audit</p>
          <h1 className="headline-upright mt-2 text-2xl text-accent-deep">Audit log</h1>
          {isMock && (
            <span className="chip chip-warn mt-3 inline-flex">Demo mode</span>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <span className="chip chip-neutral">All workspaces</span>
          <span className="chip chip-neutral">All actions</span>
          <span className="chip chip-neutral">Last 100</span>
        </div>
      </header>

      {errorMsg && (
        <p
          role="alert"
          className="mt-6 rounded-[var(--radius-md)] border border-[var(--color-danger-soft-fg)] bg-[var(--color-danger-soft-bg)] px-4 py-3 text-sm text-[var(--color-danger-soft-fg)]"
        >
          {errorMsg}
        </p>
      )}

      <section className="panel-quiet mt-6 overflow-hidden">
        {!errorMsg && rows.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
            <span className="kicker">Platform audit</span>
            <p
              className="text-xl text-muted"
              style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}
            >
              No platform actions logged
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead>
                <tr>
                  <th className="w-[14rem]">Timestamp</th>
                  <th className="w-[12rem]">Actor</th>
                  <th className="w-[10rem]">Workspace</th>
                  <th className="w-[10rem]">Action</th>
                  <th className="w-[12rem]">Target</th>
                  <th>Brief</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const tone = actionTone(r.action);
                  const chipClass =
                    tone === "ok"
                      ? "chip chip-ok"
                      : tone === "warn"
                      ? "chip chip-warn"
                      : tone === "danger"
                      ? "chip chip-danger"
                      : "chip chip-info";
                  const summary = brief(r.new_value) || brief(r.old_value);
                  return (
                    <tr key={r.id}>
                      <td>
                        <span className="mono num text-xs text-text-soft">
                          {formatDateTimeTH(r.created_at)}
                        </span>
                      </td>
                      <td>
                        {r.user_id ? (
                          <span className="inline-flex items-center gap-2">
                            <span className="text-sm text-text-soft" style={{ fontFamily: "var(--font-sans)" }}>
                              user
                            </span>
                            <span className="mono chip chip-neutral !px-2 !py-[2px] !text-[10px]">
                              {shortId(r.user_id)}
                            </span>
                          </span>
                        ) : (
                          <span className="text-xs text-faint">system</span>
                        )}
                      </td>
                      <td>
                        {r.workspace_id ? (
                          <a
                            href={`/admin/workspaces/${r.workspace_id}`}
                            className="btn-link mono text-xs"
                          >
                            {shortId(r.workspace_id)}
                          </a>
                        ) : (
                          <span className="text-xs text-faint">—</span>
                        )}
                      </td>
                      <td>
                        <span className={chipClass}>{r.action}</span>
                      </td>
                      <td>
                        <div className="flex flex-col gap-1">
                          <span className="text-xs text-text-soft">{r.target_table}</span>
                          {r.target_id && (
                            <span className="mono text-[11px] text-muted">
                              {shortId(r.target_id, 12)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        {summary ? (
                          <span className="mono num text-[11px] text-text-soft">{summary}</span>
                        ) : (
                          <span className="text-xs text-faint">—</span>
                        )}
                        {r.workspace_id && (
                          <div className="mt-1">
                            <a
                              href={`/app/audit-log?focus=${r.id}`}
                              className="btn-link text-[11px]"
                            >
                              view detail
                            </a>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
