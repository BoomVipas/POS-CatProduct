import { createClient } from "@/lib/supabase/server";
import type { Database, WorkspaceStatus } from "@/lib/database.types";
import { formatDateTimeTH } from "@/lib/date";

type Row = Database["public"]["Tables"]["workspaces"]["Row"];

type ChipClass = "chip-ok" | "chip-warn" | "chip-danger" | "chip-info" | "chip-neutral";

const chipFor = (s: WorkspaceStatus, setupComplete: boolean): ChipClass => {
  if (s === "active") return setupComplete ? "chip-ok" : "chip-info";
  if (s === "suspended") return "chip-warn";
  return "chip-neutral";
};

const MOCK: Row[] = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    brand_name: "Meow House",
    slug: "meow-house",
    owner_user_id: "00000000-0000-0000-0000-aaaaaaaaaaaa",
    industry: "cat_product",
    status: "active",
    setup_complete: true,
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    brand_name: "Cat Tokyo",
    slug: "cat-tokyo",
    owner_user_id: "00000000-0000-0000-0000-bbbbbbbbbbbb",
    industry: "cat_product",
    status: "active",
    setup_complete: false,
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
];

export default async function WorkspacesPage() {
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
        .from("workspaces")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      rows = data ?? [];
    }
  } catch (e) {
    errorMsg = e instanceof Error ? e.message : "Failed to load workspaces.";
  }

  return (
    <div className="mx-auto w-full max-w-[96rem] px-4 py-8">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
        <div>
          <p className="kicker kicker-gold">Workspaces</p>
          <h1 className="headline-upright mt-2 text-2xl text-accent-deep">
            Pilot workspaces
          </h1>
          {isMock && (
            <p className="mt-2">
              <span className="chip chip-warn">Demo mode</span>
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip chip-ok">Active</span>
          <span className="chip chip-warn">Paused</span>
          <span className="chip chip-neutral">Off-boarded</span>
        </div>
      </header>

      {errorMsg && (
        <p className="mt-6 rounded-[var(--radius-md)] border border-[var(--color-danger-soft-fg)] bg-[var(--color-danger-soft-bg)] px-4 py-3 text-sm text-[var(--color-danger-soft-fg)]">
          {errorMsg}
        </p>
      )}

      <section className="panel-quiet mt-6 overflow-hidden">
        {rows.length === 0 && !errorMsg ? (
          <div className="px-6 py-16 text-center">
            <p className="kicker kicker-gold justify-center">Workspaces</p>
            <p className="mt-3 font-display italic text-2xl text-muted">
              No workspaces yet
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Workspace</th>
                  <th>Slug</th>
                  <th>Owner</th>
                  <th className="text-right">Members</th>
                  <th>Last activity</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const ownerShort = row.owner_user_id.slice(0, 8);
                  const statusChip = chipFor(row.status, row.setup_complete);
                  const statusLabel = !row.setup_complete && row.status === "active"
                    ? "new"
                    : row.status;
                  return (
                    <tr key={row.id}>
                      <td>
                        <a
                          href={`/admin/workspaces/${row.slug}`}
                          className="btn-link"
                        >
                          {row.brand_name}
                        </a>
                        <div className="mt-1 text-xs text-muted">
                          {row.industry}
                        </div>
                      </td>
                      <td>
                        <span className="mono text-sm text-text-soft">
                          /{row.slug}
                        </span>
                      </td>
                      <td>
                        <span className="inline-flex items-center gap-2">
                          <span className="text-sm text-text-soft">owner</span>
                          <span className="chip chip-neutral mono">
                            {ownerShort}
                          </span>
                        </span>
                      </td>
                      <td className="text-right">
                        <span className="mono num text-sm text-text-soft">
                          {"—"}
                        </span>
                      </td>
                      <td>
                        <span className="mono text-sm text-text-soft">
                          {formatDateTimeTH(row.created_at)}
                        </span>
                      </td>
                      <td>
                        <span className={`chip ${statusChip}`}>
                          {statusLabel}
                        </span>
                      </td>
                      <td>
                        <div className="flex justify-end gap-2">
                          <a
                            href={`/admin/workspaces/${row.slug}`}
                            className="btn-ghost btn-sm"
                          >
                            View
                          </a>
                          <button
                            type="button"
                            className="btn-ghost btn-sm"
                            disabled
                          >
                            {row.status === "suspended" ? "Resume" : "Pause"}
                          </button>
                        </div>
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
