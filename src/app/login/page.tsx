import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="theme-public flex-1">
      <section className="mx-auto max-w-md px-5 py-16 sm:py-24">
        {/* Eyebrow + headline */}
        <div className="rise rise-1 text-center">
          {/* TODO: i18n — no t.login.* keys exist yet (DD-39) */}
          <p className="kicker kicker-gold justify-center">Pilot sign-in</p>
          <h1 className="headline letterpress mt-5 text-4xl leading-[0.95] text-accent-deep sm:text-5xl">
            <span className="underline-grow">Welcome back</span>
          </h1>
          <p className="mx-auto mt-6 max-w-[40ch] text-base leading-relaxed text-text-soft">
            Sign in to your booth. Pilot operators only — invites are issued
            after your application is approved.
          </p>
        </div>

        {/* Auth panel */}
        <div className="rise rise-2 mt-10">
          <div className="panel-lift relative p-7 sm:p-9">
            <span className="panel-tag">Sign in</span>

            {/* Primary — Google OAuth */}
            <button
              type="button"
              className="btn-accent btn-lg w-full"
              disabled
              title="Wiring lands in DD-39"
            >
              Continue with Google
            </button>

            {/* Divider */}
            <div className="fleuron my-7">
              <span>or</span>
            </div>

            {/* Secondary — Email magic link */}
            <form className="space-y-4">
              <div>
                <label htmlFor="email" className="field-label">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="you@booth.example"
                  className="field"
                  disabled
                />
              </div>
              <button
                type="submit"
                className="btn-ghost btn-md w-full"
                disabled
                title="Wiring lands in DD-39"
              >
                Email me a magic link
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-muted">
              (DD-39 will wire this page to Supabase Auth.)
            </p>
          </div>
        </div>

        {/* Footer links */}
        <div className="rise rise-3 mt-10 flex flex-col items-center gap-3 text-sm text-text-soft">
          <p>
            New to the pilot?{" "}
            <Link href="/apply" className="btn-link">
              Apply to join
            </Link>
          </p>
          <Link href="/" className="text-muted hover:text-accent-strong">
            ← Back home
          </Link>
        </div>
      </section>
    </main>
  );
}
