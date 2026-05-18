"use client";

import Link from "next/link";
import { useState } from "react";
import { useDemoSales } from "@/lib/demo/useDemoSales";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { formatTHB } from "@/lib/money/format";
import { formatDateTimeTH } from "@/lib/date";
import type { SendLaterStatus } from "@/lib/database.types";
import type { PillTone } from "@/components/ui/Pill";

const STATUSES: SendLaterStatus[] = [
  "pending",
  "packed",
  "shipped",
  "completed",
  "cancelled",
];

const NEXT: Partial<Record<SendLaterStatus, SendLaterStatus>> = {
  pending: "packed",
  packed: "shipped",
  shipped: "completed",
};

// Kept for backwards-compat with previous prop typing.
const TONE: Record<SendLaterStatus, PillTone> = {
  pending: "warn",
  packed: "neutral",
  shipped: "accent",
  completed: "ok",
  cancelled: "danger",
};
void TONE;

const CHIP: Record<SendLaterStatus, string> = {
  pending: "chip chip-warn",
  packed: "chip chip-info",
  shipped: "chip chip-ok",
  completed: "chip chip-ok",
  cancelled: "chip chip-danger",
};

export function SendLaterList() {
  const { orders, ready, update } = useDemoSales();
  const { push } = useToast();
  const [filter, setFilter] = useState<SendLaterStatus | "all">("pending");
  const [trackingDraft, setTrackingDraft] = useState<Record<string, string>>(
    {},
  );

  if (!ready) {
    return (
      <div className="panel-quiet px-5 py-8 text-center">
        <p className="kicker">Loading</p>
        <p className="mt-2 text-sm text-muted">Reading the ledger&hellip;</p>
      </div>
    );
  }

  const sendLaterOrders = orders.filter(
    (o) => o.orderType === "send_later" || o.orderType === "mixed",
  );

  const visible =
    filter === "all"
      ? sendLaterOrders
      : sendLaterOrders.filter(
          (o) => (o.sendLaterStatus ?? "pending") === filter,
        );

  function advance(orderId: string, currentStatus: SendLaterStatus) {
    const next = NEXT[currentStatus];
    if (!next) return;
    const patch: { sendLaterStatus: SendLaterStatus; trackingNumber?: string } =
      {
        sendLaterStatus: next,
      };
    if (next === "shipped") {
      const t = trackingDraft[orderId]?.trim();
      if (t) patch.trackingNumber = t;
    }
    update(orderId, patch);
    push({
      kind: "success",
      title: `Marked ${next}`,
      message: `Order updated.`,
    });
  }

  function cancel(orderId: string) {
    if (
      !confirm(
        "Cancel this fulfillment? This does NOT refund or restock in demo mode.",
      )
    )
      return;
    update(orderId, { sendLaterStatus: "cancelled" });
    push({
      kind: "info",
      title: "Cancelled",
      message: "Order marked cancelled.",
    });
  }

  if (sendLaterOrders.length === 0) {
    return (
      <div className="panel-quiet px-8 py-14 text-center">
        <p className="kicker kicker-gold justify-center">Send later</p>
        <p
          className="mt-4 font-display text-3xl italic text-accent-deep"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Nothing waiting to ship.
        </p>
        <p className="mx-auto mt-3 max-w-[48ch] text-sm text-muted">
          Toggle a cart line to &ldquo;Send later&rdquo; in the POS and complete
          a sale; it will appear here.
        </p>
        <p className="mt-6">
          <Link href="/app/pos" className="btn-link text-sm">
            Open POS
          </Link>
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="kicker">Filters</p>
        <div className="flex flex-wrap gap-2">
          <FilterChip
            active={filter === "all"}
            onClick={() => setFilter("all")}
            label={`all (${sendLaterOrders.length})`}
          />
          {STATUSES.map((s) => {
            const count = sendLaterOrders.filter(
              (o) => (o.sendLaterStatus ?? "pending") === s,
            ).length;
            return (
              <FilterChip
                key={s}
                active={filter === s}
                onClick={() => setFilter(s)}
                label={`${s} (${count})`}
              />
            );
          })}
        </div>
      </div>

      <div className="panel-quiet mt-5 overflow-x-auto">
        <table className="tbl">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Items</th>
              <th>Address</th>
              <th>Expected ship</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((o) => {
              const status = o.sendLaterStatus ?? "pending";
              const next = NEXT[status];
              const sendLaterItems = o.items.filter(
                (it) => it.fulfillmentType === "send_later",
              );
              const itemsTotal = sendLaterItems.reduce(
                (sum, it) => sum + it.lineTotalSatang,
                0,
              );
              return (
                <tr key={o.id}>
                  <td>
                    <p className="mono text-[11px] text-muted">
                      {o.orderNumber}
                    </p>
                    <button
                      type="button"
                      className="btn-link mt-0.5 text-left text-sm"
                    >
                      {o.customerName || "—"}
                    </button>
                    {o.customerPhone && (
                      <p className="mono mt-1 text-[11px] text-muted">
                        {o.customerPhone}
                      </p>
                    )}
                  </td>
                  <td className="font-sans">
                    <ul className="grid gap-1 text-sm text-text-soft">
                      {sendLaterItems.map((it, i) => (
                        <li
                          key={i}
                          className="flex items-baseline justify-between gap-3"
                        >
                          <span className="min-w-0">
                            <span className="mono text-[10px] text-faint">
                              {it.sku}
                            </span>{" "}
                            {it.productName}{" "}
                            <span className="mono text-[11px] text-muted">
                              &times;{it.qty}
                            </span>
                          </span>
                          <span className="mono text-[11px] text-accent-strong">
                            {formatTHB(it.lineTotalSatang)}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <p className="mono mt-2 text-[11px] text-muted">
                      Total{" "}
                      <span className="text-accent-strong">
                        {formatTHB(itemsTotal)}
                      </span>
                    </p>
                  </td>
                  <td className="font-sans max-w-[24ch] text-sm text-text-soft">
                    {o.shippingAddress ? (
                      <span className="whitespace-pre-wrap break-words">
                        {o.shippingAddress}
                      </span>
                    ) : (
                      <span className="text-faint">—</span>
                    )}
                    {o.trackingNumber && (
                      <p className="mono mt-2 text-[11px] text-muted">
                        Tracking{" "}
                        <span className="text-accent-strong">
                          {o.trackingNumber}
                        </span>
                      </p>
                    )}
                  </td>
                  <td className="mono text-[12px] text-text-soft">
                    {formatDateTimeTH(o.createdAt)}
                  </td>
                  <td>
                    <span className={CHIP[status]}>{status}</span>
                  </td>
                  <td>
                    {status === "completed" || status === "cancelled" ? (
                      <p className="text-right text-[11px] text-faint">—</p>
                    ) : (
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        {next === "shipped" && (
                          <input
                            type="text"
                            placeholder="tracking #"
                            value={trackingDraft[o.id] ?? ""}
                            onChange={(e) =>
                              setTrackingDraft((s) => ({
                                ...s,
                                [o.id]: e.currentTarget.value,
                              }))
                            }
                            className="field mono"
                            style={{ width: "11rem" }}
                          />
                        )}
                        {next && (
                          <Button
                            size="sm"
                            onClick={() => advance(o.id, status)}
                          >
                            Mark {next}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => cancel(o.id)}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
            {visible.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center">
                  <p className="kicker">Empty</p>
                  <p className="mt-2 text-sm text-muted">
                    No orders with status &ldquo;{filter}&rdquo;.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={active ? "chip chip-gold" : "chip chip-neutral"}
      style={{ cursor: "pointer" }}
    >
      {label}
    </button>
  );
}
