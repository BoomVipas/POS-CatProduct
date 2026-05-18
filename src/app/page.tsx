import Link from "next/link";
import { getDict } from "@/lib/i18n/server";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default async function HomePage() {
  const { t } = await getDict();

  const features = [
    { title: t.landing.feature1Title, body: t.landing.feature1Body },
    { title: t.landing.feature2Title, body: t.landing.feature2Body },
    { title: t.landing.feature3Title, body: t.landing.feature3Body },
    { title: t.landing.feature4Title, body: t.landing.feature4Body },
  ];

  return (
    <main className="theme-public flex-1">
      <div className="mx-auto flex w-full max-w-[72rem] items-center justify-end px-6 pt-6 sm:px-10">
        <LanguageSwitcher />
      </div>

      <section className="relative mx-auto w-full max-w-[72rem] px-6 pb-16 pt-10 sm:px-10 sm:pb-24 sm:pt-16">
        <span className="panel-tag rise rise-1" style={{ position: "absolute", top: "0.25rem", left: "1.75rem" }}>
          {t.common.demoMode}
        </span>

        <div className="grid gap-14 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <p className="kicker kicker-gold rise rise-1">{t.landing.kicker}</p>

            <h1 className="headline letterpress mt-6 text-5xl text-accent-deep sm:text-6xl lg:text-7xl">
              <span className="rise rise-2 block">{t.landing.title1}</span>
              <span className="rise rise-3 block">
                <span className="underline-grow">{t.landing.title2}</span>
              </span>
            </h1>

            <p className="rise rise-4 mt-10 max-w-[34rem] text-lg leading-relaxed text-text-soft">
              {t.landing.body}
            </p>

            <div className="rise rise-5 mt-10 flex flex-wrap items-center gap-4">
              <Link href="/apply" className="btn-accent btn-lg">
                {t.landing.ctaApply}
              </Link>
              <Link href="/apply/status" className="btn-ghost btn-lg">
                {t.landing.ctaStatus}
              </Link>
            </div>
          </div>

          <aside className="rise rise-5 lg:col-span-5 lg:pt-6">
            <ol className="space-y-7 border-l border-line-strong pl-7">
              {features.map((f, i) => (
                <li key={i} className="relative">
                  <span
                    aria-hidden
                    className="absolute -left-[2.05rem] top-1 h-px w-5 bg-gold"
                  />
                  <p className="mono num text-xs tracking-[0.18em] text-accent-strong">
                    {String(i + 1).padStart(2, "0")}.
                  </p>
                  <p className="mt-2 font-display text-xl italic text-accent-deep">
                    {f.title}
                  </p>
                  <p className="mt-2 max-w-[28rem] text-sm leading-relaxed text-text-soft">
                    {f.body}
                  </p>
                </li>
              ))}
            </ol>
          </aside>
        </div>

        <div className="rise rise-6 mt-20">
          <div className="fleuron"><span>※</span></div>
        </div>
      </section>

      <footer className="mx-auto w-full max-w-[72rem] px-6 pb-12 sm:px-10">
        <p className="kicker">
          <span>©</span>
          <span className="mono num">{new Date().getFullYear()}</span>
          <span>·</span>
          <span>{t.landing.footer}</span>
        </p>
      </footer>
    </main>
  );
}
