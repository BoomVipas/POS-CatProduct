import { createClient } from "@/lib/supabase/server";
import type { Database, InviteCodeStatus } from "@/lib/database.types";
import { formatDateTimeTH } from "@/lib/date";

type Row = Database["public"]["Tables"]["invite_codes"]["Row"];

const STATUSES: InviteCodeStatus[] = ["active", "used", "expired", "cancelled"];

const chipFor = (s: InviteCodeStatus): string =>
  s === "active"
    ? "chip chip-warn"
    : s === "used"
      ? "chip chip-ok"
      : s === "cancelled"
        ? "chip chip-danger"
        : "chip chip-info";

const MOCK: Row[] = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    application_id: "00000000-0000-0000-0000-000000000010",
    code: "CATBOOTH-WJ7Y-GZKD",
    email: "owner@meowhouse.example",
    brand_name: "Meow House",
    status: "active",
    expires_at: new Date(Date.now() + 7 * 86400000).toISOString(),
    used_at: null,
    used_by_user_id: null,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    created_by: null,
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    application_id: "00000000-0000-0000-0000-000000000011",
    code: "CATBOOTH-FN3X-PY8K",
    email: "hello@cattokyo.example",
    brand_name: "Cat Tokyo",
    status: "used",
    expires_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    used_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    used_by_user_id: null,
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    created_by: null,
  },
];

export default async function InviteCodesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const filter = STATUSES.includes(params.status as InviteCodeStatus)
    ? (params.status as InviteCodeStatus)
    : "active";

  let rows: Row[] = [];
  let isMock = false;
  let errorMsg: string | null = null;

  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      isMock = true;
      rows = MOCK.filter((r) => r.status === filter);
    } else {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("invite_codes")
        .select("*")
        .eq("status", filter)
        .order("created_at", { ascending: false });
      if (error) throw error;
      rows = data ?? [];
    }
  } catch (e) {
    errorMsg = e instanceof Error ? e.message : "Failed to load invite codes.";
  }

  return (
    <div className="mx-auto w-full max-w-[96rem]">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="kicker kicker-gold">Invite codes</p>
          <h1 className="headline-upright mt-2 text-2xl text-accent-deep">
            Invite codes
          </h1>
          {isMock && (
            <p className="mt-2 text-[0.7rem] font-bold uppercase tracking-[0.18em] text-[var(--color-warn-soft-fg)]">
              Demo mode — connect Supabase to load real codes
            </p>
          )}
        </div>
      </header>

      <nav className="mt-6 flex flex-wrap gap-2" aria-label="Filter by status">
        {STATUSES.map((s) => {
          const active = s === filter;
          return (
            <a
              key={s}
              href={`/admin/invite-codes?status=${s}`}
              className={
                active
                  ? "chip chip-gold"
                  : "chip chip-neutral hover:border-[var(--color-line-strong)]"
              }
            >
              {s}
            </a>
          );
        })}
      </nav>

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

      <section className="panel-quiet mt-6 overflow-hidden">
        {rows.length === 0 && !errorMsg ? (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <p className="kicker kicker-gold">Invite codes</p>
            <p
              className="font-display text-2xl italic text-accent-strong"
              style={{ fontFamily: "var(--font-display)" }}
            >
              No invite codes yet
            </p>
            <p className="max-w-[42ch] text-sm text-muted">
              Nothing under &ldquo;{filter}&rdquo;. Generate a batch to invite
              the next round of booth sellers.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Created</th>
                  <th>Expires</th>
                  <th>Redeemer</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const redeemer =
                    row.email ?? row.brand_name ?? null;
                  return (
                    <tr key={row.id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <span className="mono text-base font-bold tracking-tight text-accent-deep">
                            {row.code}
                          </span>
                        </div>
                        {row.brand_name && (
                          <p className="mt-1 text-xs text-muted">
                            {row.brand_name}
                          </p>
                        )}
                      </td>
                      <td className="mono text-sm text-text-soft">
                        {formatDateTimeTH(row.created_at)}
                      </td>
                      <td className="mono text-sm text-text-soft">
                        {formatDateTimeTH(row.expires_at)}
                      </td>
                      <td className="text-sm text-text-soft">
                        {row.used_at && redeemer ? (
                          <span>{redeemer}</span>
                        ) : (
                          <span className="text-faint">—</span>
                        )}
                        {row.used_at && (
                          <p className="mono mt-1 text-xs text-muted">
                            {formatDateTimeTH(row.used_at)}
                          </p>
                        )}
                      </td>
                      <td>
                        <span className={chipFor(row.status)}>
                          {row.status}
                        </span>
                      </td>
                      <td className="text-right">
                        <span className="text-xs text-faint">—</span>
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
