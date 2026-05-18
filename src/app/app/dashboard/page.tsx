import Link from "next/link";
import { mockToday } from "./mock";
import { PaceStrip } from "./PaceStrip";
import { TodayMetricsTile } from "./TodayMetricsTile";
import { PaymentSplitTile } from "./PaymentSplitTile";
import { TopSellersTile } from "./TopSellersTile";
import { InventoryTile } from "./InventoryTile";
import { HourBars } from "./HourBars";

export default function DashboardPage() {
  const m = mockToday;
  return (
    <main className="mx-auto max-w-[96rem] px-5 py-8">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-line-soft pb-5">
        <div>
          <p className="kicker">Dashboard</p>
          <h1 className="headline-upright mt-1 text-3xl text-accent-deep">
            Today at the booth
          </h1>
          <p className="mt-1 text-sm text-muted">
            Wires to live data at DD-85..94. Numbers below are illustrative.
          </p>
        </div>
        <span className="chip chip-neutral">Demo · today</span>
      </header>

      <div className="mt-6 grid gap-4">
        <PaceStrip
          achievedSatang={m.goal.achievedSatang}
          targetSatang={m.goal.targetSatang}
        />

        <TodayMetricsTile
          totalSatang={m.totalSatang}
          bills={m.bills}
          avgBillSatang={m.avgBillSatang}
        />

        <PaymentSplitTile split={m.paymentSplit} />

        <div className="grid gap-4 lg:grid-cols-2">
          <TopSellersTile sellers={m.topSellers} />
          <InventoryTile rows={m.inventoryRemaining} />
        </div>

        <HourBars hourly={m.hourly} />
      </div>

      <Link
        href="/app"
        className="btn-link mt-8 inline-block text-sm"
      >
        ← App home
      </Link>
    </main>
  );
}
