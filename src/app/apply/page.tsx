import { getDict } from "@/lib/i18n/server";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ApplyForm } from "./Form";

export default async function ApplyPage() {
  const { t } = await getDict();
  return (
    <main className="theme-public flex-1">
      <div className="mx-auto flex max-w-6xl items-center justify-end px-6 pt-5">
        <LanguageSwitcher />
      </div>

      <section className="mx-auto max-w-6xl px-6 py-10 sm:py-16">
        <div className="grid gap-12 md:grid-cols-[1fr_1.2fr] md:gap-16 md:items-start">
          {/* Left — editorial "why" */}
          <div className="rise rise-1">
            <p className="kicker kicker-gold mb-5">{t.apply.kicker}</p>
            <h1 className="headline letterpress text-5xl leading-[0.95] tracking-tight text-accent-deep sm:text-6xl">
              <span className="underline-grow">{t.apply.title}</span>
            </h1>
            <p className="mt-6 max-w-[42ch] text-base leading-relaxed text-text-soft">
              {t.apply.body}
            </p>
            <div className="fleuron mt-10 max-w-[42ch]">
              <span>※</span>
            </div>
            <p className="mt-6 max-w-[42ch] text-sm leading-relaxed text-muted">
              {t.apply.waitNote}
            </p>
          </div>

          {/* Right — form panel */}
          <div className="rise rise-2 relative">
            <div className="panel-lift relative p-7 sm:p-10">
              <span className="panel-tag">Pilot</span>
              <ApplyForm />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
