"use client";

import Link from "next/link";
import { useDemoSales } from "@/lib/demo/useDemoSales";
import { useDemoSettings } from "@/lib/demo/useDemoSettings";
import { useT } from "@/lib/i18n/provider";
import { PromptPayDisplay } from "../../PromptPayDisplay";
import { RegistrationLinkBlock } from "./RegistrationLinkBlock";
import { formatTHB } from "@/lib/money/format";
import { formatDateTimeTH } from "@/lib/date";

export function SuccessClient({ orderId }: { orderId: string }) {
  const { orders, ready } = useDemoSales();
  const { settings } = useDemoSettings();
  const { t } = useT();
  const order = ready ? orders.find((o) => o.id === orderId) : undefined;

  if (!ready) {
    return (
      <main className="mx-auto max-w-2xl px-5 py-12">
        <div className="panel-quiet p-6 text-center text-sm text-muted">
          Loading…
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="mx-auto max-w-2xl px-5 py-12">
        <header className="no-print mb-6 text-center">
          <p className="kicker kicker-gold justify-center">Receipt</p>
          <h1 className="headline-upright mt-2 text-3xl text-accent-deep">
            Sale recorded
          </h1>
          <p className="mono num mt-2 inline-block rounded-full border border-line bg-soft px-3 py-1 text-xs text-text-soft">
            {orderId}
          </p>
        </header>
        <div className="panel-lift p-6 text-center">
          <p className="text-text/85">
            Demo order not found in this browser. (Could happen if you cleared
            demo data, or this is a real Supabase order ID — DD-67 will render
            real details.)
          </p>
          <div className="no-print mt-6 flex justify-center gap-3">
            <Link href="/app/pos" className="btn-accent btn-md">
              Next sale
            </Link>
            <Link href="/app/dashboard" className="btn-ghost btn-md">
              Dashboard
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const workspaceName = settings.brandDisplayName;
  const showSubtotal = order.subtotalSatang !== order.totalSatang;

  return (
    <main className="mx-auto max-w-2xl px-5 py-10">
      <header className="no-print mb-6 text-center">
        <p className="kicker kicker-gold justify-center">Receipt</p>
        <h1 className="headline-upright mt-2 text-3xl text-accent-deep">
          {workspaceName}
        </h1>
        <p className="mono num mt-3 inline-block rounded-full border border-line bg-soft px-3 py-1 text-xs text-text-soft">
          {order.orderNumber}
        </p>
      </header>

      <article className="panel-lift p-6">
        {/* Print-only header echo */}
        <div className="hidden text-center print:block">
          <p className="headline-upright text-xl text-text">{workspaceName}</p>
          <p className="mono num mt-1 text-xs text-text-soft">
            {order.orderNumber}
          </p>
        </div>

        {/* Order metadata */}
        <dl className="mono num grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-text-soft">
          <div className="flex justify-between gap-2">
            <dt className="text-muted">Date</dt>
            <dd>{formatDateTimeTH(order.createdAt)}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-muted">Order</dt>
            <dd>{order.orderNumber}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-muted">Type</dt>
            <dd className="uppercase">{order.orderType}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-muted">Payment</dt>
            <dd className="uppercase">{order.paymentMethod}</dd>
          </div>
        </dl>

        <div className="fleuron my-5"><span>※</span></div>

        {/* Line items */}
        <table className="tbl">
          <thead>
            <tr>
              <th className="w-10">Qty</th>
              <th>Item</th>
              <th className="text-right">Price</th>
              <th className="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((it, i) => (
              <tr key={i}>
                <td className="mono num align-top">{it.qty}</td>
                <td className="align-top">
                  <p className="font-semibold text-text">{it.productName}</p>
                  <p className="mono num text-[11px] text-muted">{it.sku}</p>
                  {it.fulfillmentType === "send_later" && (
                    <p className="text-[11px] text-muted">send later</p>
                  )}
                  {it.note && (
                    <p className="mt-0.5 text-[11px] italic text-text-soft">
                      &ldquo;{it.note}&rdquo;
                    </p>
                  )}
                </td>
                <td className="mono num text-right align-top text-text-soft">
                  {formatTHB(it.unitPriceSatang)}
                </td>
                <td className="mono num text-right align-top font-semibold text-text">
                  {formatTHB(it.lineTotalSatang)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="fleuron my-5"><span>※</span></div>

        {/* Totals */}
        <dl className="grid gap-1 text-sm">
          {showSubtotal && (
            <TotalsRow label="Subtotal" value={formatTHB(order.subtotalSatang)} />
          )}
          {order.shippingFeeSatang > 0 && (
            <TotalsRow
              label="Shipping"
              value={formatTHB(order.shippingFeeSatang)}
            />
          )}
          {order.discountSatang > 0 && (
            <TotalsRow
              label="Discount"
              value={`-${formatTHB(order.discountSatang)}`}
            />
          )}
          <div className="mt-2 flex items-baseline justify-between gap-2 border-t border-line pt-3">
            <span className="headline-upright text-xl text-accent-deep">
              {t.pos.total}
            </span>
            <span className="mono num headline-upright text-2xl text-accent-deep">
              {formatTHB(order.totalSatang)} THB
            </span>
          </div>

          {order.paymentMethod === "cash" &&
            order.cashTenderedSatang !== undefined &&
            order.cashTenderedSatang > 0 && (
              <div className="mt-3 grid gap-1 rounded-[var(--radius-md)] border border-line-soft bg-soft px-3 py-2 text-xs">
                <TotalsRow
                  label={t.pos.amountTendered}
                  value={`${formatTHB(order.cashTenderedSatang)} THB`}
                  small
                />
                <TotalsRow
                  label={t.pos.changeDue}
                  value={`${formatTHB(order.changeDueSatang ?? 0)} THB`}
                  small
                />
              </div>
            )}

          {order.payments && order.payments.length > 0 && (
            <ul className="mt-2 grid gap-1 rounded-[var(--radius-md)] border border-line-soft bg-soft px-3 py-2 text-xs">
              {order.payments.map((p, i) => (
                <li
                  key={i}
                  className="flex items-baseline justify-between gap-2"
                >
                  <span className="font-semibold uppercase tracking-wider text-muted">
                    {p.method}
                  </span>
                  <span className="mono num font-semibold text-text">
                    {formatTHB(p.amountSatang)} THB
                  </span>
                </li>
              ))}
            </ul>
          )}

          {order.pointsEarned !== undefined && order.pointsEarned > 0 && (
            <p className="mt-2 rounded-[var(--radius-md)] border border-line-soft bg-[var(--color-warn-soft-bg)] px-3 py-2 text-center text-xs font-semibold text-[var(--color-warn-soft-fg)]">
              {t.pos.loyaltyEarnsPoints(order.pointsEarned)}
            </p>
          )}
        </dl>

        {order.paymentMethod === "promptpay" && order.totalSatang > 0 && (
          <div className="mt-6">
            <PromptPayDisplay
              proxy={{ kind: "phone", value: settings.promptpayPhone }}
              amountSatang={order.totalSatang}
            />
            <p className="mt-2 text-center text-xs text-muted">
              {t.pos.receiptScanAgain}
            </p>
          </div>
        )}

        {/* Thank-you copy — visible on receipt and print */}
        <div className="fleuron my-5"><span>※</span></div>
        <p className="text-center text-xs text-text-soft">
          Thank you — see you at the next market.
        </p>
      </article>

      {/* RegistrationLinkBlock keeps its own .no-print marker */}
      <RegistrationLinkBlock orderId={order.id} />

      {/* On-screen action row */}
      <div className="no-print mt-6 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => window.print()}
          className="btn-accent btn-lg"
        >
          Print
        </button>
        <Link href="/app/pos" className="btn-ghost btn-md">
          New sale
        </Link>
        <Link href="/app/dashboard" className="btn-link text-sm">
          Dashboard
        </Link>
      </div>
    </main>
  );
}

function TotalsRow({
  label,
  value,
  small,
}: {
  label: string;
  value: string;
  small?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span
        className={
          small
            ? "font-semibold text-muted"
            : "font-semibold text-text-soft"
        }
      >
        {label}
      </span>
      <span className="mono num font-semibold text-text">{value}</span>
    </div>
  );
}
