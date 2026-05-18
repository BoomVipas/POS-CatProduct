"use client";

import { useMemo, useState } from "react";
import { useDemoSales } from "@/lib/demo/useDemoSales";
import { useDemoCustomers } from "@/lib/demo/useDemoCustomers";
import { useDemoCustomerNotes } from "@/lib/demo/useDemoCustomerNotes";
import { useDemoPets } from "@/lib/demo/useDemoPets";
import { petSummary, speciesEmoji } from "@/lib/demo/pets";
import {
  daysBetween,
  firstSeenAt,
  lifecycleLabel,
  lifecycleStageFor,
  netRevenueForCustomer,
  topProductForCustomer,
  type LifecycleStage,
} from "@/lib/demo/customer-lifecycle";
import { phoneKey } from "@/lib/demo/customers";
import { formatTHB } from "@/lib/money/format";
import { formatDateTH } from "@/lib/date";

const STAGE_CHIP: Record<LifecycleStage, string> = {
  new: "chip chip-info",
  returning: "chip chip-gold",
  vip: "chip chip-gold",
  dormant: "chip chip-neutral",
};

const ALL_STAGES: Array<LifecycleStage | "all"> = [
  "all",
  "new",
  "returning",
  "vip",
  "dormant",
];

export function CustomersList() {
  const customers = useDemoCustomers();
  const { orders, ready } = useDemoSales();
  const notes = useDemoCustomerNotes();
  const pets = useDemoPets();
  const [filter, setFilter] = useState<LifecycleStage | "all">("all");
  const [query, setQuery] = useState("");

  const all = useMemo(
    () => (customers.ready ? customers.all() : []),
    [customers],
  );

  const enriched = useMemo(
    () =>
      all.map((p) => ({
        profile: p,
        stage: lifecycleStageFor(p),
        net: netRevenueForCustomer(p, orders),
        top: topProductForCustomer(p, orders),
        firstAt: firstSeenAt(p, orders),
        days: daysBetween(p.lastSeenAt),
      })),
    [all, orders],
  );

  const q = query.trim().toLowerCase();
  const filtered = enriched.filter((e) => {
    if (filter !== "all" && e.stage !== filter) return false;
    if (!q) return true;
    const name = (e.profile.name ?? "").toLowerCase();
    const phone = (e.profile.phone ?? "").toLowerCase();
    return name.includes(q) || phone.includes(q);
  });

  const counts = enriched.reduce<Record<LifecycleStage, number>>(
    (acc, e) => {
      acc[e.stage] = (acc[e.stage] ?? 0) + 1;
      return acc;
    },
    { new: 0, returning: 0, vip: 0, dormant: 0 },
  );

  if (!customers.ready || !ready) {
    return (
      <div className="panel-quiet mt-8 px-4 py-6 text-center">
        <p className="kicker">Loading</p>
      </div>
    );
  }

  if (all.length === 0) {
    return (
      <div className="panel-quiet mt-10 px-6 py-12 text-center">
        <p className="kicker kicker-gold justify-center">No customers yet</p>
        <p className="headline text-2xl text-accent-deep mt-3">
          Ring up the first sale.
        </p>
        <p className="mx-auto mt-3 max-w-[44ch] text-sm text-text-soft">
          Customers appear here when a sale captures a phone number. Try
          adding a phone in the POS, or convert a QR self-order claim.
        </p>
        <p className="mt-5">
          <a href="/app/pos" className="btn-link">
            Open the POS →
          </a>
        </p>
      </div>
    );
  }

  return (
    <>
      <section className="mt-6 flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {ALL_STAGES.map((s) => {
            const active = filter === s;
            const label =
              s === "all"
                ? `All ${enriched.length}`
                : `${lifecycleLabel(s)} ${counts[s] ?? 0}`;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setFilter(s)}
                aria-pressed={active}
                className={
                  active
                    ? "btn-accent btn-sm"
                    : "btn-ghost btn-sm"
                }
              >
                {label}
              </button>
            );
          })}
        </div>
        <div className="relative">
          <span
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint"
          >
            ⌕
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name or phone"
            className="field pl-8 w-72"
            aria-label="Search customers"
          />
        </div>
      </section>

      <section className="panel-quiet mt-5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Phone</th>
                <th>Pets</th>
                <th className="text-right">Net lifetime</th>
                <th>Last order</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(({ profile, stage, net, top, firstAt, days }) => {
                const k = phoneKey(profile.phone);
                const note = k ? notes.get(profile.phone) : null;
                const petList = pets.forPhone(profile.phone);
                const lastLabel =
                  days === 0
                    ? "today"
                    : `${days} day${days === 1 ? "" : "s"} ago`;
                return (
                  <tr key={k ?? profile.phone}>
                    <td>
                      <div className="flex flex-col gap-0.5">
                        <a href="#" className="btn-link self-start">
                          {profile.name ?? "—"}
                        </a>
                        <span className="text-xs text-muted">
                          <span className="num">{profile.orderCount}</span>{" "}
                          order{profile.orderCount === 1 ? "" : "s"}
                          {firstAt && (
                            <>
                              {" · since "}
                              <span className="mono">
                                {formatDateTH(firstAt)}
                              </span>
                            </>
                          )}
                        </span>
                        {top && (
                          <span className="text-xs text-muted">
                            Top SKU:{" "}
                            <strong className="font-semibold text-text-soft">
                              {top.name}
                            </strong>{" "}
                            <span className="mono num">×{top.qty}</span>
                          </span>
                        )}
                        {note?.tags && note.tags.length > 0 && (
                          <span className="mt-1 flex flex-wrap gap-1">
                            {note.tags.slice(0, 2).map((t) => (
                              <span key={t} className="chip chip-neutral">
                                {t}
                              </span>
                            ))}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="mono text-text-soft">
                      {profile.phone}
                    </td>
                    <td>
                      {petList.length === 0 ? (
                        <span className="mono num text-muted">0</span>
                      ) : (
                        <div className="flex flex-col gap-0.5">
                          <span className="mono num text-text-soft">
                            {petList.length}
                          </span>
                          <span className="text-xs text-muted">
                            {petList.slice(0, 2).map((pp, i) => (
                              <span key={pp.id}>
                                {i > 0 && " · "}
                                {speciesEmoji(pp.species)}{" "}
                                <strong className="font-semibold text-text-soft">
                                  {petSummary(pp)}
                                </strong>
                              </span>
                            ))}
                            {petList.length > 2 && (
                              <span> +{petList.length - 2}</span>
                            )}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="text-right">
                      <span className="mono num font-semibold text-accent-strong">
                        {formatTHB(net)}
                      </span>
                      <span className="ml-1 text-[11px] text-muted">THB</span>
                      {profile.pointsAvailable > 0 && (
                        <div className="text-[11px] font-bold text-[color:var(--color-warn-soft-fg)]">
                          ★ <span className="num">{profile.pointsAvailable}</span> pts
                        </div>
                      )}
                    </td>
                    <td className="mono text-text-soft">{lastLabel}</td>
                    <td>
                      <span className={STAGE_CHIP[stage]}>
                        {lifecycleLabel(stage)}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <div className="py-8 text-center text-sm text-muted">
                      No customers match this view.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
