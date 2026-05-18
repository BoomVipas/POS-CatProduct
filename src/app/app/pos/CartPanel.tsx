"use client";

import { useState } from "react";
import { formatTHB } from "@/lib/money/format";
import { useCart, useCartDispatch } from "@/lib/pos/cart-store";
import type { Product, PaymentMethod } from "@/lib/pos/types";
import { CartLine } from "./CartLine";
import { PaymentPicker } from "./PaymentPicker";
import { ReviewModal } from "./ReviewModal";
import { PromptPayDisplay } from "./PromptPayDisplay";
import { CustomerInfoBlock } from "./CustomerInfoBlock";
import { ReturningCustomerLookup } from "./ReturningCustomerLookup";
import { CashTenderBlock } from "./CashTenderBlock";
import { SplitPaymentBlock } from "./SplitPaymentBlock";
import { UpsellPrompt } from "./UpsellPrompt";
import { ImportClaimButton } from "./ImportClaimButton";
import { useDemoSettings } from "@/lib/demo/useDemoSettings";
import { useT } from "@/lib/i18n/provider";
import { validateSplits } from "@/lib/pos/splits";

const METHODS: PaymentMethod[] = [
  "cash",
  "promptpay",
  "transfer",
  "card",
  "other",
];

export function CartPanel({
  products,
  compact = false,
}: {
  products: Product[];
  compact?: boolean;
}) {
  const cart = useCart();
  const dispatch = useCartDispatch();
  const { settings } = useDemoSettings();
  const { t } = useT();
  const [reviewOpen, setReviewOpen] = useState(false);

  const productIndex = new Map(products.map((p) => [p.id, p]));

  const subtotal = cart.lines.reduce((sum, l) => {
    const p = productIndex.get(l.productId);
    return p ? sum + p.price_satang * l.qty : sum;
  }, 0);

  const shipping = cart.lines.reduce((sum, l) => {
    const p = productIndex.get(l.productId);
    return p && l.fulfillment === "send_later"
      ? sum + p.shipping_fee_satang * l.qty
      : sum;
  }, 0);

  const total = Math.max(0, subtotal + shipping - cart.discountSatang);

  const hasSendLater = cart.lines.some((l) => l.fulfillment === "send_later");
  const customerComplete =
    !!cart.customer.name.trim() &&
    !!cart.customer.phone.trim() &&
    !!cart.customer.address.trim();
  const sendLaterMissingCustomer = hasSendLater && !customerComplete;

  const usingSplits = cart.splits.length > 0;
  const splitsValidation = usingSplits
    ? validateSplits(cart.splits, total)
    : null;

  const paymentChosen = usingSplits
    ? splitsValidation?.ok === true
    : cart.paymentMethod !== null;

  const cta =
    cart.lines.length === 0
      ? t.pos.ctaAddProduct
      : !paymentChosen
        ? t.pos.ctaPickPayment
        : sendLaterMissingCustomer
          ? t.pos.ctaFillSendLater
          : t.pos.ctaReview;
  const ctaDisabled =
    cart.lines.length === 0 || !paymentChosen || sendLaterMissingCustomer;

  return (
    <div className={compact ? "p-4" : "panel-lift p-5"}>
      {!compact && (
        <header className="mb-3 flex items-baseline justify-between gap-2 border-b border-line pb-3">
          <div>
            <p className="kicker">Sale</p>
            <h2 className="headline-upright mt-0.5 text-2xl text-accent-deep">
              {t.pos.cart}
            </h2>
          </div>
          <div className="flex items-center gap-1.5">
            <ImportClaimButton />
            {cart.lines.length > 0 && (
              <button
                type="button"
                onClick={() => dispatch({ type: "CLEAR" })}
                className="btn-ghost btn-sm"
              >
                {t.pos.clear}
              </button>
            )}
          </div>
        </header>
      )}

      <div className="mb-3">
        <ReturningCustomerLookup />
      </div>

      {cart.lines.length === 0 ? (
        <p className="panel-quiet px-4 py-6 text-center text-sm text-muted">
          {t.pos.emptyCart}
        </p>
      ) : (
        <>
          <ul className="grid gap-2">
            {cart.lines.map((line) => {
              const p = productIndex.get(line.productId);
              if (!p) return null;
              return <CartLine key={line.productId} line={line} product={p} />;
            })}
          </ul>
          <div className="mt-3">
            <UpsellPrompt products={products} />
          </div>
        </>
      )}

      <div className="mt-4 grid gap-3">
        <DiscountInput
          satang={cart.discountSatang}
          onChange={(s) => dispatch({ type: "SET_DISCOUNT", satang: s })}
          label={t.pos.discount}
        />

        <div className="panel-quiet grid gap-2 p-4 text-sm">
          <Row label={t.pos.subtotal} value={formatTHB(subtotal)} muted />
          {shipping > 0 && (
            <Row
              label={t.pos.shippingSendLater}
              value={formatTHB(shipping)}
              muted
            />
          )}
          {cart.discountSatang > 0 && (
            <Row
              label={t.pos.discount}
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
        </div>

        {!usingSplits && (
          <>
            <div>
              <p className="kicker mb-2">Payment</p>
              <PaymentPicker
                methods={METHODS}
                selected={cart.paymentMethod}
                onSelect={(m) =>
                  dispatch({ type: "SET_PAYMENT_METHOD", method: m })
                }
              />
            </div>

            {cart.lines.length > 0 && total > 0 && (
              <button
                type="button"
                onClick={() =>
                  dispatch({
                    type: "ADD_SPLIT",
                    split: { method: "cash", amountSatang: total },
                  })
                }
                className="btn-link self-start text-xs"
              >
                {t.pos.splitPayment} →
              </button>
            )}

            {cart.paymentMethod === "promptpay" && total > 0 && (
              <PromptPayDisplay
                proxy={{ kind: "phone", value: settings.promptpayPhone }}
                amountSatang={total}
              />
            )}

            {cart.paymentMethod === "cash" && total > 0 && (
              <CashTenderBlock totalSatang={total} />
            )}
          </>
        )}

        {usingSplits && total > 0 && (
          <SplitPaymentBlock totalSatang={total} />
        )}

        <CustomerInfoBlock />

        <button
          type="button"
          disabled={ctaDisabled}
          onClick={() => setReviewOpen(true)}
          className="btn-accent btn-xl w-full"
        >
          {cta}
        </button>
      </div>

      {reviewOpen && (
        <ReviewModal
          products={products}
          subtotal={subtotal}
          shipping={shipping}
          total={total}
          onClose={() => setReviewOpen(false)}
        />
      )}
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

function DiscountInput({
  satang,
  onChange,
  label,
}: {
  satang: number;
  onChange: (s: number) => void;
  label: string;
}) {
  const presets = [0, 5000, 10000]; // 0, 50, 100 THB
  return (
    <div className="panel-quiet flex items-center gap-2 px-3 py-2">
      <span className="kicker">{label}</span>
      <input
        type="number"
        min={0}
        step={50}
        value={satang === 0 ? "" : (satang / 100).toString()}
        onChange={(e) => {
          const v = e.target.value;
          if (v === "") return onChange(0);
          const n = Number(v);
          if (Number.isFinite(n)) onChange(Math.max(0, Math.round(n * 100)));
        }}
        placeholder="0"
        className="field mono num w-20 py-1 text-right"
      />
      <div className="ml-auto flex gap-1">
        {presets.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            className={
              satang === p && p > 0
                ? "chip chip-gold mono"
                : "chip chip-neutral mono"
            }
          >
            {p === 0 ? "0" : `${p / 100}`}
          </button>
        ))}
      </div>
    </div>
  );
}
