"use client";

import { useToast } from "@/components/ui/Toast";
import { useDemoCatalog } from "@/lib/demo/useDemoCatalog";
import { useDemoSales } from "@/lib/demo/useDemoSales";
import { useDemoAudit } from "@/lib/demo/useDemoAudit";
import { useDemoCustomerNotes } from "@/lib/demo/useDemoCustomerNotes";
import { useDemoCloseDay } from "@/lib/demo/useDemoCloseDay";
import { useDemoPreOrders } from "@/lib/demo/useDemoPreOrders";
import { useDemoClaims } from "@/lib/demo/useDemoClaims";
import { useDemoStockCount } from "@/lib/demo/useDemoStockCount";
import { useDemoPets } from "@/lib/demo/useDemoPets";
import { writeDemoSettings, DEFAULT_DEMO_SETTINGS } from "@/lib/demo/settings";

export function DangerZone() {
  const { clear: clearCatalog, items } = useDemoCatalog();
  const { clear: clearSales, orders } = useDemoSales();
  const { clear: clearAudit, entries, log } = useDemoAudit();
  const { clear: clearCustomerNotes } = useDemoCustomerNotes();
  const { clear: clearCloseDay } = useDemoCloseDay();
  const { clear: clearPreOrders } = useDemoPreOrders();
  const { clear: clearClaims } = useDemoClaims();
  const { clear: clearStockCount } = useDemoStockCount();
  const { clear: clearPets } = useDemoPets();
  const { push } = useToast();

  function clearAll() {
    if (
      !confirm(
        "Reset all demo data? This wipes your demo catalog, recorded sales, customer notes, audit log, and settings from this browser. Cannot be undone.",
      )
    ) {
      return;
    }
    // Log the reset BEFORE clearing audit, then clear audit.
    log({
      action: "demo_reset",
      targetTable: "demo",
      targetId: null,
      summary: `Reset all: ${items.length} products, ${orders.length} sales, ${entries.length} audit entries`,
    });
    clearCatalog();
    clearSales();
    clearAudit();
    clearCustomerNotes();
    clearCloseDay();
    clearPreOrders();
    clearClaims();
    clearStockCount();
    clearPets();
    writeDemoSettings(DEFAULT_DEMO_SETTINGS);
    push({
      kind: "warn",
      title: "Demo data reset",
      message:
        "Catalog, sales, customer notes, audit log, and settings cleared. Refresh to see the changes everywhere.",
    });
  }

  return (
    <section className="panel-lift border-l-2 border-[var(--color-danger)] p-6">
      <p className="kicker text-[var(--color-danger-soft-fg)]">Danger zone</p>
      <h2 className="headline-upright mt-1 text-xl text-[var(--color-danger-soft-fg)]">
        Irreversible actions
      </h2>
      <p className="mt-2 max-w-[62ch] text-sm text-text-soft">
        These actions cannot be undone. Real Supabase data is unaffected (and
        not stored in this browser anyway).
      </p>

      <div className="mt-5 border-t border-line-soft">
        <div className="flex flex-wrap items-center justify-between gap-4 py-4">
          <div className="max-w-[42ch]">
            <p className="text-sm font-semibold text-text">
              Reset all demo data
            </p>
            <p className="mt-0.5 text-xs text-muted">
              Wipes{" "}
              <span className="mono num text-text-soft">{items.length}</span>{" "}
              product{items.length === 1 ? "" : "s"},{" "}
              <span className="mono num text-text-soft">{orders.length}</span>{" "}
              recorded sale{orders.length === 1 ? "" : "s"},{" "}
              <span className="mono num text-text-soft">{entries.length}</span>{" "}
              audit entr{entries.length === 1 ? "y" : "ies"}, and your settings
              from this browser.
            </p>
          </div>
          <button
            type="button"
            className="btn-ghost btn-sm text-[var(--color-danger-soft-fg)]"
            onClick={clearAll}
          >
            Reset all demo data
          </button>
        </div>
      </div>
    </section>
  );
}
