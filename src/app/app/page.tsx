import Link from "next/link";
import { getDict } from "@/lib/i18n/server";

export default async function AppHomePage() {
  const { t } = await getDict();
  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="mx-auto max-w-6xl px-5 py-10 sm:py-12">
      <header className="flex flex-col gap-2 border-b border-line pb-6">
        <span className="kicker">{t.chrome.appHome}</span>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="headline-upright text-3xl text-accent-strong sm:text-4xl">
            {t.appHome.title}
          </h1>
          <p className="text-muted mono text-sm tabular">{today}</p>
        </div>
        <p className="text-muted max-w-[62ch] text-sm">
          {t.appHome.subtitle}
        </p>
      </header>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <Tile
          href="/app/pos"
          title={t.chrome.pos}
          body={t.appHome.tilePosBody}
        />
        <Tile
          href="/app/setup/products"
          title={t.chrome.products}
          body={t.appHome.tileProductsBody}
        />
        <Tile
          href="/app/dashboard"
          title={t.chrome.dashboard}
          body={t.appHome.tileDashboardBody}
        />
        <Tile
          href="/app/send-later"
          title={t.chrome.sendLater}
          body={t.appHome.tileSendLaterBody}
        />
        <Tile
          href="/app/correction"
          title={t.chrome.corrections}
          body={t.appHome.tileCorrectionsBody}
        />
        <Tile
          href="/app/audit-log"
          title={t.chrome.auditLog}
          body={t.appHome.tileAuditLogBody}
        />
        <Tile
          href="/app/close-day"
          title="Close day"
          body="Reconcile counted cash against today's sales."
        />
        <Tile
          href="/app/stock-count"
          title="Stock count"
          body="Walk the warehouse, count, fix drift after each event."
        />
        <Tile
          href="/app/inventory/samples"
          title="Sample bucket"
          body="Move stock between event-sellable and on-display sample. Sell a sample, return one to event."
        />
        <Tile
          href="/app/customers"
          title="Customers"
          body="Lifecycle, lifetime spend, top SKU per phone."
        />
        <Tile
          href="/app/pre-orders"
          title={t.preOrders.title}
          body={t.preOrders.body}
        />
        <Tile
          href="/app/settings"
          title={t.chrome.settings}
          body={t.appHome.tileSettingsBody}
        />
      </ul>
    </main>
  );
}

function Tile({
  href,
  title,
  body,
}: {
  href: string;
  title: string;
  body: string;
}) {
  return (
    <li>
      <Link
        href={href}
        className="panel-quiet group block h-full border-l-2 border-gold px-5 py-4 transition-transform duration-150 ease-out hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)]"
      >
        <p className="headline-upright text-xl text-accent-strong">{title}</p>
        <p className="text-text-soft mt-1 text-sm leading-relaxed">{body}</p>
        <span className="btn-link mt-3 inline-block text-sm">
          Open →
        </span>
      </Link>
    </li>
  );
}
