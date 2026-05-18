import Link from "next/link";
import { getDict } from "@/lib/i18n/server";
import { PreOrderList } from "./PreOrderList";

export default async function PreOrdersPage() {
  const { t } = await getDict();
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-line-soft pb-5">
        <div>
          <p className="kicker kicker-gold">{t.preOrders.title}</p>
          <h1 className="headline-upright mt-2 text-3xl text-accent-deep">
            {t.preOrders.title}
          </h1>
          <p className="mt-2 max-w-[62ch] text-sm text-text-soft">
            {t.preOrders.body}
          </p>
          <p className="mt-1 text-xs text-muted">{t.preOrders.demoNote}</p>
        </div>
      </header>

      <PreOrderList />

      <div className="mt-8">
        <Link href="/app" className="btn-link text-sm">
          ← {t.chrome.appHome}
        </Link>
      </div>
    </main>
  );
}
