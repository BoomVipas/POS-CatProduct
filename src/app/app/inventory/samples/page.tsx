import { SampleBucketManager } from "./SampleBucketManager";

/**
 * Wave 39b — Sample bucket UI (demo mode).
 *
 * Lists products and lets the seller move units between event-sellable
 * stock and the sample bucket (units physically on display). Mirrors the
 * meowmeow Stock & Allocation Setup "Sample" column with explicit
 * Make / Return buttons.
 *
 * Demo mode uses localStorage. Real Supabase wiring (Wave 39 follow-up
 * after PR #4 merges) replaces the demo store with the
 * convert_event_to_sample / convert_sample_to_event RPCs.
 */
export default function InventorySamplesPage() {
  const today = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <main className="mx-auto max-w-[96rem] px-6 py-10">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-6 border-b border-line-soft pb-6">
        <div>
          <p className="kicker kicker-gold">Sample bucket</p>
          <h1 className="headline-upright mt-3 text-3xl text-accent-deep">
            Sample bucket
          </h1>
          <p className="mt-3 max-w-[62ch] text-sm text-text-soft">
            Units physically on display at the booth. Moving stock to sample
            reduces sellable event stock but never returns to warehouse — the
            sample sits on display through the event. Convert back when staff
            want to sell a sample as a normal product.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="kicker">As of</span>
          <span className="mono num text-sm text-text-soft">{today}</span>
          <a href="/app/setup/products" className="btn-link text-sm">
            Add product
          </a>
        </div>
      </header>
      <SampleBucketManager />
    </main>
  );
}
