"use client";

import Link from "next/link";
import { useState } from "react";
import { useDemoPreOrders } from "@/lib/demo/useDemoPreOrders";
import { useToast } from "@/components/ui/Toast";
import { useT } from "@/lib/i18n/provider";
import { formatDateTimeTH } from "@/lib/date";
import {
  countByStatus,
  filterByStatus,
  type PreOrderStatus,
} from "@/lib/demo/pre-orders";

const STATUSES: Array<PreOrderStatus | "all"> = [
  "all",
  "pending",
  "notified",
  "fulfilled",
  "cancelled",
];

const CHIP: Record<PreOrderStatus, string> = {
  pending: "chip chip-warn",
  notified: "chip chip-info",
  fulfilled: "chip chip-ok",
  cancelled: "chip chip-danger",
};

export function PreOrderList() {
  const { items, ready, setStatus } = useDemoPreOrders();
  const { t } = useT();
  const { push } = useToast();
  const [filter, setFilter] = useState<PreOrderStatus | "all">("pending");

  if (!ready) {
    return (
      <section className="panel-quiet mt-8 px-6 py-10 text-center text-sm text-muted">
        {t.common.loading}
      </section>
    );
  }

  const counts = countByStatus(items);
  const visible = filterByStatus(items, filter);

  function statusLabel(s: PreOrderStatus): string {
    if (s === "pending") return t.preOrders.statusPending;
    if (s === "notified") return t.preOrders.statusNotified;
    if (s === "fulfilled") return t.preOrders.statusFulfilled;
    return t.preOrders.statusCancelled;
  }

  if (items.length === 0) {
    return (
      <section className="panel-quiet mt-8 px-8 py-14 text-center">
        <p className="kicker kicker-gold justify-center">
          {t.preOrders.title}
        </p>
        <p className="headline mt-3 text-3xl text-accent-deep">
          No pre-orders right now
        </p>
        <p className="mx-auto mt-3 max-w-[52ch] text-sm text-text-soft">
          When a sold-out product gets tapped at the booth, you can capture
          the customer&rsquo;s info. They appear here for follow-up.
        </p>
        <div className="mt-5">
          <Link href="/app/pos" className="btn-link text-sm">
            Open POS →
          </Link>
        </div>
      </section>
    );
  }

  return (
    <>
      <div className="mt-6 flex flex-wrap items-center justify-end gap-2">
        {STATUSES.map((s) => {
          const active = s === filter;
          const label =
            s === "all"
              ? `${t.common.all} (${counts.all})`
              : `${statusLabel(s)} (${counts[s]})`;
          return (
            <button
              key={s}
              type="button"
              onClick={() => setFilter(s)}
              className={
                active
                  ? "chip chip-gold cursor-pointer"
                  : "chip chip-neutral cursor-pointer"
              }
            >
              {label}
            </button>
          );
        })}
      </div>

      <section className="panel-quiet mt-4 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead>
              <tr>
                <th>{t.preOrders.fName}</th>
                <th>Items</th>
                <th className="text-right">{t.preOrders.fQty}</th>
                <th>{t.preOrders.fNote}</th>
                <th>Captured</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((p) => (
                <tr key={p.id}>
                  <td>
                    <button
                      type="button"
                      className="btn-link text-left"
                      onClick={() => {
                        if (p.customerPhone) {
                          window.location.href = `tel:${p.customerPhone}`;
                        }
                      }}
                    >
                      {p.customerName}
                    </button>
                    <div className="mt-1 mono text-[11px] text-muted">
                      {p.customerPhone}
                      {p.customerEmail && ` · ${p.customerEmail}`}
                    </div>
                  </td>
                  <td>
                    <div className="font-semibold text-text">
                      {p.productName}
                    </div>
                    <div className="mono num text-[11px] text-muted">
                      {p.sku}
                    </div>
                  </td>
                  <td className="text-right mono num">×{p.qty}</td>
                  <td className="max-w-[28ch]">
                    {p.note ? (
                      <span className="text-xs italic text-text-soft">
                        “{p.note}”
                      </span>
                    ) : (
                      <span className="text-xs text-faint">—</span>
                    )}
                  </td>
                  <td className="mono text-[11px] text-muted">
                    {formatDateTimeTH(p.createdAt)}
                  </td>
                  <td>
                    <span className={CHIP[p.status]}>
                      {statusLabel(p.status)}
                    </span>
                  </td>
                  <td>
                    {p.status !== "fulfilled" && p.status !== "cancelled" ? (
                      <div className="flex flex-wrap justify-end gap-2">
                        {p.status === "pending" && (
                          <button
                            type="button"
                            className="btn-ghost btn-sm"
                            onClick={() => {
                              setStatus(p.id, "notified");
                              push({
                                kind: "success",
                                title: t.preOrders.statusNotified,
                                message: `${p.customerName}`,
                              });
                            }}
                          >
                            {t.preOrders.markNotified}
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn-ghost btn-sm"
                          onClick={() => {
                            setStatus(p.id, "fulfilled");
                            push({
                              kind: "success",
                              title: t.preOrders.statusFulfilled,
                              message: `${p.sku} → ${p.customerName}`,
                            });
                          }}
                        >
                          {t.preOrders.markFulfilled}
                        </button>
                        <button
                          type="button"
                          className="btn-ghost btn-sm"
                          onClick={() => {
                            if (
                              confirm(
                                `Cancel pre-order for ${p.customerName}?`,
                              )
                            ) {
                              setStatus(p.id, "cancelled");
                            }
                          }}
                        >
                          {t.preOrders.markCancelled}
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-faint">—</span>
                    )}
                  </td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-sm text-muted">
                    No pre-orders with status &ldquo;{filter}&rdquo;.
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
