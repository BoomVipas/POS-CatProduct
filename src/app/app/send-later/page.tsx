import Link from "next/link";
import { SendLaterList } from "./SendLaterList";

export default function SendLaterPage() {
  return (
    <main className="mx-auto max-w-[96rem] px-6 py-10">
      <header className="flex flex-wrap items-end justify-between gap-6 border-b border-line pb-6">
        <div>
          <p className="kicker kicker-gold">Send later</p>
          <h1 className="headline-upright mt-3 text-3xl text-accent-deep">
            Send-later ledger
          </h1>
          <p className="mt-3 max-w-[62ch] text-sm text-text-soft">
            Pending fulfillments and shipping status. Flow:{" "}
            <span className="mono text-accent-strong">
              pending &rarr; packed &rarr; shipped &rarr; completed
            </span>
            .
          </p>
          <p className="mt-1 text-[11px] text-faint">
            Demo mode reads from localStorage; DD-75..84 will move this to
            Supabase <span className="mono">send_later_orders</span>.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/app" className="btn-link text-sm">
            App home
          </Link>
          <Link href="/app/pos" className="btn-accent btn-md">
            New send-later
          </Link>
        </div>
      </header>

      <section className="mt-8">
        <SendLaterList />
      </section>
    </main>
  );
}
