import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="theme-public">
      <main className="flex-1">
        <section className="mx-auto max-w-xl px-5 py-20">
          <div className="rise rise-1">
            <span className="kicker kicker-gold">Customer Registration</span>
            <h1 className="headline-upright letterpress mt-4 text-4xl text-accent-deep">
              Register with invite code
            </h1>
            <p className="mt-4 max-w-[58ch] text-text-soft">
              Got an invite email or QR receipt? Use the link inside to claim
              your profile and add your pet&rsquo;s info.
            </p>
          </div>

          <div className="rise rise-2 relative mt-10">
            <div className="panel-quiet p-6 sm:p-8">
              <p className="text-sm text-text-soft">
                You&rsquo;ll need a couple of things to finish registration:
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="chip chip-info">Invite link</span>
                <span className="chip chip-info">Pet info</span>
                <span className="chip chip-neutral">A minute or two</span>
              </div>
              <p className="mt-5 text-sm text-muted">
                (DD-33 to DD-38 will wire this page to the invite-redemption
                flow.)
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-4">
                <Link href="/" className="btn-ghost btn-md">
                  &larr; Back home
                </Link>
                <Link href="/apply" className="btn-link">
                  Apply as a seller instead
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
