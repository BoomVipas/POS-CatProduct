"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart, useCartDispatch } from "@/lib/pos/cart-store";
import { formatTHB } from "@/lib/money/format";
import type { Product } from "@/lib/pos/types";
import { useDemoSales } from "@/lib/demo/useDemoSales";
import { useDemoCatalog } from "@/lib/demo/useDemoCatalog";
import { useDemoAudit } from "@/lib/demo/useDemoAudit";
import { useDemoSettings } from "@/lib/demo/useDemoSettings";
import { pointsForSale } from "@/lib/demo/loyalty";
import {
  newDemoOrderId,
  nextOrderNumber,
  type DemoOrder,
  type DemoOrderItem,
} from "@/lib/demo/sales";
import type { OrderType, PaymentMethod } from "@/lib/database.types";
import { useT } from "@/lib/i18n/provider";
import { useToast } from "@/components/ui/Toast";

export function ReviewModal({
  products,
  subtotal,
  shipping,
  total,
  onClose,
}: {
  products: Product[];
  subtotal: number;
  shipping: number;
  total: number;
  onClose: () => void;
}) {
  const router = useRouter();
  const cart = useCart();
  const dispatch = useCartDispatch();
  const sales = useDemoSales();
  const catalog = useDemoCatalog();
  const audit = useDemoAudit();
  const { settings } = useDemoSettings();
  const { t } = useT();
  const { push } = useToast();

  const [confirmed, setConfirmed] = useState(false);
  const productIndex = new Map(products.map((p) => [p.id, p]));
  const hasSendLater = cart.lines.some((l) => l.fulfillment === "send_later");
  const hasTakeNow = cart.lines.some((l) => l.fulfillment === "take_now");
  const pointsToEarn = pointsForSale(total, settings.loyaltyPointsPer100Baht);

  function deriveOrderType(): OrderType {
    if (hasSendLater && hasTakeNow) return "mixed";
    if (hasSendLater) return "send_later";
    return "take_now";
  }

  function buildOrder(): DemoOrder {
    const items: DemoOrderItem[] = cart.lines
      .map((l) => {
        const p = productIndex.get(l.productId);
        if (!p) return null;
        return {
          productId: p.id,
          sku: p.sku,
          productName: p.name,
          qty: l.qty,
          unitPriceSatang: p.price_satang,
          lineTotalSatang: p.price_satang * l.qty,
          fulfillmentType: l.fulfillment,
          ...(l.note ? { note: l.note } : {}),
          ...(p.cost_satang && p.cost_satang > 0
            ? { unitCostSatang: p.cost_satang }
            : {}),
        } satisfies DemoOrderItem;
      })
      .filter((x): x is DemoOrderItem => x !== null);

    const orderType = deriveOrderType();
    const isSendLater = orderType === "send_later" || orderType === "mixed";
    const usingSplits = cart.splits.length > 0;
    const effectiveMethod: PaymentMethod = usingSplits
      ? "mixed"
      : (cart.paymentMethod ?? "cash");
    const isCash = effectiveMethod === "cash";
    const tendered = cart.cashTenderedSatang;
    const change = isCash && tendered > total ? tendered - total : 0;

    return {
      id: newDemoOrderId(),
      orderNumber: nextOrderNumber(),
      customerName: cart.customer.name || null,
      customerPhone: cart.customer.phone || null,
      customerEmail: cart.customer.email || null,
      orderType,
      paymentMethod: effectiveMethod,
      subtotalSatang: subtotal,
      discountSatang: cart.discountSatang,
      shippingFeeSatang: shipping,
      totalSatang: total,
      note: null,
      createdAt: new Date().toISOString(),
      items,
      ...(isCash && tendered > 0
        ? { cashTenderedSatang: tendered, changeDueSatang: change }
        : {}),
      ...(usingSplits
        ? {
            payments: cart.splits.map((sp) => ({
              method: sp.method,
              amountSatang: sp.amountSatang,
            })),
          }
        : {}),
      ...(pointsToEarn > 0 ? { pointsEarned: pointsToEarn } : {}),
      source: cart.source,
      ...(isSendLater
        ? {
            sendLaterStatus: "pending" as const,
            trackingNumber: null,
            shippingAddress: cart.customer.address || null,
          }
        : {}),
    };
  }

  function handleConfirm() {
    setConfirmed(true);
    const order = buildOrder();
    sales.append(order);

    // Decrement demo catalog stock for each line. Real Supabase RPC will do
    // this atomically server-side (DD-66).
    const itemsByProduct = new Map<string, number>();
    for (const it of order.items) {
      itemsByProduct.set(
        it.productId,
        (itemsByProduct.get(it.productId) ?? 0) + it.qty,
      );
    }
    for (const [productId, qty] of itemsByProduct) {
      const p = productIndex.get(productId);
      if (!p) continue;
      // Only decrement demo-catalog products (not the bundled mockProducts).
      if (catalog.items.some((c) => c.id === productId)) {
        catalog.update(productId, {
          current_qty: Math.max(0, p.current_qty - qty),
        });
      }
    }

    audit.log({
      action: "order_create",
      targetTable: "orders",
      targetId: order.id,
      summary: `${order.orderNumber} · ${formatTHB(order.totalSatang)} THB · ${order.paymentMethod}`,
      newValue: {
        orderNumber: order.orderNumber,
        totalSatang: order.totalSatang,
        paymentMethod: order.paymentMethod,
        items: order.items.length,
      },
    });

    push({
      kind: "success",
      title: "Sale recorded",
      message: `${order.orderNumber} · ${formatTHB(order.totalSatang)} THB`,
    });

    setTimeout(() => {
      dispatch({ type: "CLEAR" });
      onClose();
      router.push(`/app/pos/success/${order.id}`);
    }, 600);
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-text/40 px-3 py-6 backdrop-blur-sm">
      <div className="panel-lift relative w-full max-w-lg p-6">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-soft text-sm font-semibold text-muted hover:text-text"
        >
          ✕
        </button>

        <p className="kicker">Confirm</p>
        <h2 className="headline-upright mt-1 text-3xl text-accent-deep">
          {t.pos.reviewSale}
        </h2>

        <ul className="mt-4 grid gap-2">
          {cart.lines.map((line) => {
            const p = productIndex.get(line.productId);
            if (!p) return null;
            return (
              <li
                key={line.productId}
                className="flex items-baseline justify-between gap-3 border-b border-line/60 pb-2 text-sm"
              >
                <div className="min-w-0">
                  <p className="mono text-[10px] text-muted">{p.sku}</p>
                  <p className="headline-upright text-base text-text">
                    {p.name}
                  </p>
                  <p className="mono num text-xs text-muted">
                    {line.qty} × {formatTHB(p.price_satang)}
                    {line.fulfillment === "send_later" && " · send later"}
                  </p>
                  {line.note && (
                    <p className="mt-0.5 text-[11px] italic text-accent-strong">
                      “{line.note}”
                    </p>
                  )}
                </div>
                <p className="mono num shrink-0 text-sm font-semibold text-accent-strong">
                  {formatTHB(p.price_satang * line.qty)}
                </p>
              </li>
            );
          })}
        </ul>

        <div className="mt-4 grid gap-1 text-sm">
          <Row label="Subtotal" value={formatTHB(subtotal)} muted />
          {shipping > 0 && (
            <Row label="Shipping" value={formatTHB(shipping)} muted />
          )}
          {cart.discountSatang > 0 && (
            <Row
              label="Discount"
              value={`-${formatTHB(cart.discountSatang)}`}
              muted
            />
          )}
          <div className="mt-1 flex items-baseline justify-between border-t border-line pt-2">
            <span className="headline-upright text-xl text-accent-deep">
              {t.pos.total}
            </span>
            <span className="mono num text-3xl font-semibold text-accent-deep">
              {formatTHB(total)}
            </span>
          </div>
          <p className="mt-2 text-xs text-muted">
            Payment method:{" "}
            <strong className="text-accent-strong">
              {cart.splits.length > 0
                ? `mixed · ${cart.splits.length} method${cart.splits.length === 1 ? "" : "s"}`
                : (cart.paymentMethod ?? "—")}
            </strong>
          </p>
          {cart.splits.length > 0 && (
            <ul className="mt-1 grid gap-0.5 rounded-[var(--radius-md)] bg-soft px-3 py-2 text-xs">
              {cart.splits.map((s, i) => (
                <li
                  key={i}
                  className="flex items-baseline justify-between gap-2"
                >
                  <span className="font-semibold text-muted">{s.method}</span>
                  <span className="mono num font-semibold">
                    {formatTHB(s.amountSatang)}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {cart.splits.length === 0 &&
            cart.paymentMethod === "cash" &&
            cart.cashTenderedSatang > 0 && (
              <div className="mt-1 grid gap-0.5 rounded-[var(--radius-md)] bg-[var(--color-ok-soft-bg)] px-3 py-2 text-xs text-[var(--color-ok-soft-fg)]">
                <Row
                  label="Tendered"
                  value={formatTHB(cart.cashTenderedSatang)}
                  muted
                />
                <Row
                  label="Change due"
                  value={formatTHB(
                    Math.max(0, cart.cashTenderedSatang - total),
                  )}
                  muted
                />
              </div>
            )}
          {pointsToEarn > 0 && (
            <p className="mt-1 rounded-[var(--radius-md)] bg-[var(--color-warn-soft-bg)] px-3 py-2 text-xs font-semibold text-[var(--color-warn-soft-fg)]">
              ★ {t.pos.loyaltyEarnsPoints(pointsToEarn)}
              {cart.customer.phone.trim() === "" &&
                " — add a customer phone to bank them"}
            </p>
          )}
          {hasSendLater && (
            <p className="rounded-[var(--radius-md)] border border-gold-soft bg-gold-soft/30 px-3 py-2 text-xs text-accent-strong">
              Send-later: customer info will be required at confirm (DD-76).
            </p>
          )}
        </div>

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={confirmed}
            className="btn-ghost btn-md"
          >
            {t.common.cancel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={confirmed}
            className="btn-accent btn-xl w-full sm:w-auto"
          >
            {confirmed ? "Saved" : "Confirm sale"}
          </button>
        </div>

        <p className="mt-3 text-center text-xs text-muted">
          Demo mode: persists to localStorage. DD-65 swaps in the real{" "}
          <code className="mono">create_order</code> RPC.
        </p>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span
        className={
          muted
            ? "text-xs font-semibold uppercase tracking-wider text-muted"
            : "text-xs font-semibold uppercase tracking-wider text-text-soft"
        }
      >
        {label}
      </span>
      <span className="mono num font-semibold text-text">{value}</span>
    </div>
  );
}
