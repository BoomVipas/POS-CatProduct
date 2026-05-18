import Link from "next/link";
import { getDict } from "@/lib/i18n/server";

export default async function ApplySuccessPage() {
  const { t } = await getDict();
  return (
    <main className="theme-public flex-1">
      <section className="mx-auto max-w-2xl px-6 py-24 text-center">
        <h1 className="rise rise-1 headline letterpress text-5xl text-accent-deep">
          <span className="underline-grow">{t.apply.successTitle}</span>
        </h1>
        <div className="rise rise-2 mt-10">
          <p className="mx-auto max-w-[52ch] text-base leading-relaxed text-text-soft">
            {t.apply.successBody}
          </p>
        </div>
        <div className="rise rise-3 mt-12 flex flex-wrap items-center justify-center gap-4">
          <Link href="/" className="btn-accent btn-lg">
            {t.common.home}
          </Link>
          <Link href="/apply/status" className="btn-link text-sm">
            {t.landing.ctaStatus}
          </Link>
        </div>
      </section>
    </main>
  );
}
