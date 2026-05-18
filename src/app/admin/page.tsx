import Link from "next/link";

export default function AdminHomePage() {
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-3 border-b border-line pb-5">
        <div>
          <p className="kicker">Admin</p>
          <h1 className="headline-upright mt-1 text-2xl text-accent-deep">
            Pilot operations
          </h1>
        </div>
        <p className="mono text-xs text-muted tabular">{today}</p>
      </header>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        <Tile
          href="/admin/applications"
          kicker="Intake"
          title="Applications"
          body="Pending pilot applications."
        />
        <Tile
          href="/admin/invite-codes"
          kicker="Access"
          title="Invite codes"
          body="Issued, used, expired."
        />
        <Tile
          href="/admin/workspaces"
          kicker="Tenants"
          title="Workspaces"
          body="Active pilot brands."
        />
        <Tile
          href="/admin/audit-log"
          kicker="Trail"
          title="Audit log"
          body="Approvals, voids, corrections."
        />
        <Tile
          href="/admin/pilot-status"
          kicker="Health"
          title="Pilot status"
          body="Cohort progress and milestones."
        />
      </ul>
    </div>
  );
}

function Tile({
  href,
  kicker,
  title,
  body,
}: {
  href: string;
  kicker: string;
  title: string;
  body: string;
}) {
  return (
    <li>
      <Link
        href={href}
        className="panel-quiet group flex h-full flex-col justify-between gap-4 px-5 py-4 transition-colors hover:border-line-strong"
      >
        <div>
          <p className="kicker">{kicker}</p>
          <p className="headline-upright mt-1 text-lg text-accent-deep">
            {title}
          </p>
          <p className="mt-1 text-sm text-muted">{body}</p>
        </div>
        <span className="btn-link self-start text-sm">Open &rarr;</span>
      </Link>
    </li>
  );
}
