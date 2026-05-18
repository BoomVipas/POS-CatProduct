"use client";

import { useState } from "react";
import { Minus, Plus, X, StickyNote } from "lucide-react";
import { formatTHB } from "@/lib/money/format";
import { useCartDispatch } from "@/lib/pos/cart-store";
import type { CartLine as CartLineType, Product } from "@/lib/pos/types";
import { useT } from "@/lib/i18n/provider";

export function CartLine({
  line,
  product,
}: {
  line: CartLineType;
  product: Product;
}) {
  const dispatch = useCartDispatch();
  const { t } = useT();
  const lineTotal = product.price_satang * line.qty;
  const isLater = line.fulfillment === "send_later";
  const [showNoteInput, setShowNoteInput] = useState(Boolean(line.note));

  return (
    <li
      className={`panel-quiet grid grid-cols-[minmax(0,1fr)_auto] gap-3 p-3 ${
        isLater ? "bg-gold-soft/30" : ""
      }`}
    >
      <div className="min-w-0">
        <p className="mono text-[11px] text-muted">{product.sku}</p>
        <p className="headline-upright line-clamp-2 text-base text-text">
          {product.name}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() =>
              dispatch({
                type: "SET_FULFILLMENT",
                productId: product.id,
                fulfillment: isLater ? "take_now" : "send_later",
              })
            }
            className={
              isLater
                ? "chip chip-gold inline-flex items-center gap-1.5"
                : "chip chip-ok inline-flex items-center gap-1.5"
            }
          >
            {isLater ? t.pos.sendLater : t.pos.takeNow}
          </button>
          {!showNoteInput && !line.note && (
            <button
              type="button"
              onClick={() => setShowNoteInput(true)}
              className="chip chip-neutral inline-flex items-center gap-1 hover:text-accent-strong"
            >
              <StickyNote size={11} />
              {t.pos.addNote}
            </button>
          )}
        </div>
        {(showNoteInput || line.note) && (
          <input
            type="text"
            value={line.note ?? ""}
            onChange={(e) =>
              dispatch({
                type: "SET_LINE_NOTE",
                productId: product.id,
                note: e.currentTarget.value,
              })
            }
            placeholder={t.pos.notePlaceholder}
            maxLength={120}
            autoFocus={showNoteInput && !line.note}
            className="field mt-2 py-1 text-xs"
          />
        )}
      </div>
      <div className="flex flex-col items-end justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            aria-label="Decrease"
            onClick={() =>
              dispatch({
                type: "SET_QTY",
                productId: product.id,
                qty: Math.max(0, line.qty - 1),
              })
            }
            className="grid h-7 w-7 place-items-center rounded-full border border-line bg-panel text-accent-strong hover:bg-soft"
          >
            <Minus size={14} />
          </button>
          <span className="mono num min-w-[1.75rem] text-center text-base font-semibold">
            {line.qty}
          </span>
          <button
            type="button"
            aria-label="Increase"
            onClick={() =>
              dispatch({
                type: "SET_QTY",
                productId: product.id,
                qty: line.qty + 1,
              })
            }
            className="grid h-7 w-7 place-items-center rounded-full border border-line bg-panel text-accent-strong hover:bg-soft"
          >
            <Plus size={14} />
          </button>
        </div>
        <p className="mono num text-base font-semibold text-accent-strong">
          {formatTHB(lineTotal)}
        </p>
        <button
          type="button"
          aria-label="Remove from cart"
          onClick={() => dispatch({ type: "REMOVE", productId: product.id })}
          className="grid h-6 w-6 place-items-center rounded-full bg-soft text-muted hover:text-text"
        >
          <X size={12} />
        </button>
      </div>
    </li>
  );
}
