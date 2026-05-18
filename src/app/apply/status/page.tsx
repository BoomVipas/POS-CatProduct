import Link from "next/link";
import { getDict } from "@/lib/i18n/server";

export default async function ApplyStatusPage() {
  const { t } = await getDict();
  return (
    <div className="theme-public">
      <main className="flex-1">
        <section className="mx-auto max-w-xl px-5 py-20">
          <div className="rise rise-1">
            <span className="kicker kicker-gold">{t.landing.ctaStatus}</span>
          </div>

          <h1 className="rise rise-2 headline letterpress mt-5 text-4xl text-accent-deep sm:text-5xl">
            <span className="underline-grow">{t.apply.statusTitle}</span>
          </h1>

          <p className="rise rise-3 mt-6 max-w-[52ch] text-text-soft">
            {t.apply.statusBody}
          </p>

          <form className="rise rise-4 panel relative mt-10 px-7 py-8">
            <label htmlFor="apply-status-email" className="field-label">
              {t.apply.fieldEmail}
            </label>
            <input
              id="apply-status-email"
              name="email"
              type="email"
              autoComplete="email"
              className="field mono"
            />
            <button
              type="submit"
              disabled
              className="btn-accent btn-lg mt-6 w-full"
            >
              {t.landing.ctaStatus}
            </button>
          </form>

          <div className="fleuron rise rise-5 mt-10">
            <span>※</span>
          </div>

          <div className="rise rise-6 mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm">
            <Link href="/" className="btn-link">
              ← {t.common.home}
            </Link>
            <Link href="/apply" className="btn-link">
              {t.landing.ctaApply}
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
