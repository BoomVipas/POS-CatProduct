import { Pill, type PillTone } from "@/components/ui/Pill";
import { formatDateTimeTH } from "@/lib/date";
import { formatTHB } from "@/lib/money/format";

type WorkspaceHealth = {
  brand: string;
  slug: string;
  setupComplete: boolean;
  lastSaleAt: string | null;
  lastSaleSatang: number;
  todayBills: number;
  lowStockCount: number;
  pendingSendLater: number;
};

const MOCK: WorkspaceHealth[] = [
  {
    brand: "Meow House",
    slug: "meow-house",
    setupComplete: true,
    lastSaleAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    lastSaleSatang: 89000,
    todayBills: 17,
    lowStockCount: 2,
    pendingSendLater: 3,
  },
  {
    brand: "Cat Tokyo",
    slug: "cat-tokyo",
    setupComplete: false,
    lastSaleAt: null,
    lastSaleSatang: 0,
    todayBills: 0,
    lowStockCount: 0,
    pendingSendLater: 0,
  },
];

function tone(h: WorkspaceHealth): PillTone {
  if (!h.setupComplete) return "warn";
  if (h.lastSaleAt && Date.now() - new Date(h.lastSaleAt).getTime() > 86400000)
    return "warn";
  return "ok";
}

export default function PilotStatusPage() {
  const rows = MOCK; // DD-100 will compute live.

  const totalWorkspaces = rows.length;
  const activeWorkspaces = rows.filter(
    (h) => h.setupComplete && h.lastSaleAt,
  ).length;
  const setupPending = rows.filter((h) => !h.setupComplete).length;
  const totalBillsToday = rows.reduce((s, h) => s + h.todayBills, 0);
  const totalSalesTodaySatang = rows.reduce(
    (s, h) => s + h.lastSaleSatang,
    0,
  );
  const pendingSendLater = rows.reduce(
    (s, h) => s + h.pendingSendLater,
    0,
  );
  const conv = (n: number, d: number) =>
    d === 0 ? "0%" : `${Math.round((n / d) * 100)}%`;

  return (
    <div className="mx-auto max-w-[96rem] px-6 py-8">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
        <div>
          <p className="kicker kicker-gold">Pilot status</p>
          <h1 className="headline-upright text-2xl mt-2 text-accent-deep">
            Pilot status
          </h1>
          <p className="mt-1 max-w-[62ch] text-sm text-muted">
            Per-workspace health overview. Demo data; live computation arrives at DD-100.
          </p>
        </div>
        <span className="chip chip-gold">In progress</span>
      </header>

      <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          label="Workspaces"
          value={String(totalWorkspaces)}
          sub={`${activeWorkspaces} active`}
        />
        <Kpi
          label="Sales today"
          value={formatTHB(totalSalesTodaySatang)}
          sub="Across pilot"
        />
        <Kpi
          label="Bills today"
          value={String(totalBillsToday)}
          sub="All workspaces"
        />
        <Kpi
          label="Setup pending"
          value={String(setupPending)}
          sub={`${pendingSendLater} send-later`}
        />
      </section>

      <section className="relative mt-6 panel-quiet px-5 py-5">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <p className="kicker">Funnel</p>
            <h2 className="headline-upright text-xl mt-1 text-accent-deep">
              Workspace breakdown
            </h2>
          </div>
          <p className="text-xs text-muted">
            stage · count · conversion
          </p>
        </div>

        <table className="tbl">
          <thead>
            <tr>
              <th>Workspace</th>
              <th>Status</th>
              <th className="text-right">Bills today</th>
              <th className="text-right">Last sale</th>
              <th className="text-right">Low stock</th>
              <th className="text-right">Send-later</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((h) => (
              <tr key={h.slug}>
                <td>
                  <div className="font-display text-base text-accent-strong">
                    {h.brand}
                  </div>
                  <div className="mono text-xs text-muted">/{h.slug}</div>
                </td>
                <td>
                  <Pill tone={tone(h)}>
                    {!h.setupComplete
                      ? "setup pending"
                      : h.lastSaleAt
                        ? "active"
                        : "no sales yet"}
                  </Pill>
                </td>
                <td className="mono num text-right text-accent-deep">
                  {h.todayBills}
                </td>
                <td className="mono num text-right text-text-soft">
                  {h.lastSaleAt
                    ? `${formatTHB(h.lastSaleSatang)} · ${formatDateTimeTH(h.lastSaleAt)}`
                    : "—"}
                </td>
                <td className="mono num text-right text-text-soft">
                  {h.lowStockCount}
                </td>
                <td className="mono num text-right text-text-soft">
                  {h.pendingSendLater}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mt-6 panel-quiet px-5 py-5">
        <div className="mb-4">
          <p className="kicker">Application funnel</p>
          <h2 className="headline-upright text-xl mt-1 text-accent-deep">
            Stage progression
          </h2>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th>Stage</th>
              <th className="text-right">Count</th>
              <th className="text-right">Conversion</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="text-text-soft">Invited</td>
              <td className="mono num text-right text-accent-deep">
                {totalWorkspaces}
              </td>
              <td className="mono num text-right text-muted">100%</td>
            </tr>
            <tr>
              <td className="text-text-soft">Setup complete</td>
              <td className="mono num text-right text-accent-deep">
                {totalWorkspaces - setupPending}
              </td>
              <td className="mono num text-right text-muted">
                {conv(totalWorkspaces - setupPending, totalWorkspaces)}
              </td>
            </tr>
            <tr>
              <td className="text-text-soft">Active (selling)</td>
              <td className="mono num text-right text-accent-deep">
                {activeWorkspaces}
              </td>
              <td className="mono num text-right text-muted">
                {conv(activeWorkspaces, totalWorkspaces)}
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  );
}

function Kpi({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="panel-quiet border-l-2 border-gold px-4 py-3">
      <p className="kicker">{label}</p>
      <p className="mono num text-3xl mt-2 text-accent-deep">{value}</p>
      {sub ? <p className="mt-1 text-xs text-muted">{sub}</p> : null}
    </div>
  );
}
