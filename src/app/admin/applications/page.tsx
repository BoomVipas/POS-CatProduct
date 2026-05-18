import { createClient } from "@/lib/supabase/server";
import type {
  ApplicationStatus,
  Database,
} from "@/lib/database.types";
import { ApproveRejectButtons } from "./Actions";

type App = Database["public"]["Tables"]["applications"]["Row"];

const STATUSES: ApplicationStatus[] = [
  "pending",
  "approved",
  "rejected",
  "invited",
  "registered",
];

function statusChipClass(status: ApplicationStatus): string {
  switch (status) {
    case "pending":
      return "chip chip-warn";
    case "approved":
      return "chip chip-ok";
    case "rejected":
      return "chip chip-danger";
    case "invited":
      return "chip chip-info";
    case "registered":
    default:
      return "chip chip-neutral";
  }
}

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const filterStatus =
    (STATUSES as readonly string[]).includes(params.status ?? "")
      ? (params.status as ApplicationStatus)
      : "pending";

  let rows: App[] = [];
  let counts: Record<ApplicationStatus, number> = {
    pending: 0,
    approved: 0,
    rejected: 0,
    invited: 0,
    registered: 0,
  };
  let errorMsg: string | null = null;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("applications")
      .select("*")
      .eq("status", filterStatus)
      .order("created_at", { ascending: false });
    if (error) throw error;
    rows = data ?? [];

    const { data: countRows } = await supabase
      .from("applications")
      .select("status");
    if (countRows) {
      for (const r of countRows as { status: ApplicationStatus }[]) {
        if (r.status in counts) counts[r.status] += 1;
      }
    }
  } catch (e) {
    errorMsg =
      e instanceof Error
        ? e.message
        : "Failed to load applications.";
  }

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="kicker kicker-gold">Applications</p>
          <h1 className="headline-upright text-2xl mt-2 text-accent-deep">
            Pilot review queue
          </h1>
        </div>
        <nav
          className="flex flex-wrap items-center gap-2"
          aria-label="Filter by status"
        >
          {STATUSES.map((s) => {
            const active = s === filterStatus;
            const base = statusChipClass(s);
            return (
              <a
                key={s}
                href={`/admin/applications?status=${s}`}
                aria-current={active ? "page" : undefined}
                className={
                  active
                    ? `${base} ring-1 ring-[var(--color-accent-strong)] ring-offset-1 ring-offset-[var(--color-bg)]`
                    : `${base} opacity-70 hover:opacity-100`
                }
              >
                <span>{s}</span>
                <span className="mono ml-1 opacity-90">{counts[s]}</span>
              </a>
            );
          })}
        </nav>
      </header>

      {errorMsg && (
        <p
          className="mt-6 rounded-[var(--radius-md)] border px-4 py-3 text-sm"
          style={{
            borderColor: "var(--color-danger-soft-fg)",
            background: "var(--color-danger-soft-bg)",
            color: "var(--color-danger-soft-fg)",
          }}
        >
          {errorMsg}
        </p>
      )}

      {!errorMsg && rows.length === 0 && (
        <div className="panel-quiet mt-6 px-6 py-12 text-center">
          <p className="kicker">{filterStatus}</p>
          <p
            className="mt-2 text-2xl italic text-accent-strong"
            style={{ fontFamily: "var(--font-display)" }}
          >
            No applications
          </p>
          <p className="mt-2 text-sm text-muted">
            Nothing in the &ldquo;{filterStatus}&rdquo; queue right now. New
            submissions land here as they arrive.
          </p>
        </div>
      )}

      {!errorMsg && rows.length > 0 && (
        <section className="panel-quiet mt-6 overflow-hidden">
          <table className="tbl">
            <thead>
              <tr>
                <th>Submitted</th>
                <th>Brand</th>
                <th>Contact</th>
                <th>Phone</th>
                <th>Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="mono whitespace-nowrap text-text-soft">
                    {new Date(row.created_at).toLocaleString()}
                  </td>
                  <td>
                    <div
                      className="font-semibold text-accent-strong"
                      style={{ fontFamily: "var(--font-sans)" }}
                    >
                      {row.brand_name}
                    </div>
                    <div className="text-xs text-muted">
                      {row.owner_name}
                      {row.product_category
                        ? ` · ${row.product_category}`
                        : ""}
                    </div>
                    {row.message && (
                      <p className="mt-1 max-w-[42ch] text-xs text-text-soft/85">
                        {row.message}
                      </p>
                    )}
                  </td>
                  <td>
                    <a
                      className="btn-link text-sm"
                      href={`mailto:${row.email}`}
                    >
                      {row.email}
                    </a>
                  </td>
                  <td className="mono whitespace-nowrap text-sm">
                    {row.phone}
                  </td>
                  <td>
                    <span className={statusChipClass(filterStatus)}>
                      {filterStatus}
                    </span>
                  </td>
                  <td className="text-right">
                    {filterStatus === "pending" ? (
                      <ApproveRejectButtons applicationId={row.id} />
                    ) : (
                      <span className="text-xs text-faint">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
