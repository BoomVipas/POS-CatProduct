import Link from "next/link";
import { CustomersList } from "./CustomersList";

export default function CustomersPage() {
  return (
    <main className="mx-auto max-w-6xl px-5 py-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="kicker kicker-gold">Customers</p>
          <h1 className="headline-upright text-3xl text-accent-deep mt-2">
            Customer ledger
          </h1>
          <p className="mt-2 max-w-[62ch] text-sm text-text-soft">
            Auto-derived from past sales (phone-keyed). Lifecycle stage and
            lifetime spend update as new sales come in.
          </p>
        </div>
        <Link
          href="/app"
          className="kicker text-accent-strong hover:text-accent-deep"
        >
          ← Home
        </Link>
      </header>
      <CustomersList />
    </main>
  );
}
