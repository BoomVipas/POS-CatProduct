"use client";

import { useEffect, useState } from "react";
import { useCart, useCartDispatch } from "@/lib/pos/cart-store";
import { useDemoCustomers } from "@/lib/demo/useDemoCustomers";
import { useDemoCustomerNotes } from "@/lib/demo/useDemoCustomerNotes";
import { SUGGESTED_TAGS, toggleTag } from "@/lib/demo/customer-notes";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";
import { useT } from "@/lib/i18n/provider";
import { formatDateTimeTH } from "@/lib/date";
import type { CustomerProfile } from "@/lib/demo/customers";
import {
  lifecycleLabel,
  lifecycleStageFor,
} from "@/lib/demo/customer-lifecycle";
import { PetCardsBlock } from "./PetCardsBlock";

/**
 * Renders only when cart contains send-later items. Captures shipping info
 * (name, phone, address). Optional email. Persists into the cart store so
 * ReviewModal can build the order with these fields.
 *
 * Looks up the entered phone against past demo orders. If the phone has been
 * seen before, shows a "Returning customer" badge with an autofill button.
 */
export function CustomerInfoBlock() {
  const cart = useCart();
  const dispatch = useCartDispatch();
  const { t } = useT();
  const customers = useDemoCustomers();
  const notes = useDemoCustomerNotes();
  const [match, setMatch] = useState<CustomerProfile | null>(null);
  const [customTagDraft, setCustomTagDraft] = useState("");

  const debouncedPhone = useDebouncedValue(cart.customer.phone, 350);

  useEffect(() => {
    if (!customers.ready || !debouncedPhone.trim()) {
      setMatch(null);
      return;
    }
    setMatch(customers.findByPhone(debouncedPhone));
  }, [debouncedPhone, customers]);

  const existingNote = match
    ? notes.get(cart.customer.phone) ?? { note: "", tags: [], updatedAt: "" }
    : null;

  const hasSendLater = cart.lines.some((l) => l.fulfillment === "send_later");
  if (!hasSendLater) return null;

  const missing =
    !cart.customer.name.trim() ||
    !cart.customer.phone.trim() ||
    !cart.customer.address.trim();

  function autofill() {
    if (!match) return;
    dispatch({
      type: "SET_CUSTOMER",
      patch: {
        name: match.name ?? cart.customer.name,
        email: match.email ?? cart.customer.email,
        address: match.address ?? cart.customer.address,
      },
    });
  }

  return (
    <div
      className={
        missing
          ? "panel-quiet p-4 border-[var(--color-warn-soft-fg)]/40 bg-[var(--color-warn-soft-bg)]/35"
          : "panel-quiet p-4"
      }
    >
      <p className="kicker">{t.pos.customerHeading}</p>
      <p className="mt-1 text-xs text-muted">{t.pos.customerHint}</p>

      <div className="mt-3 grid gap-2">
        <input
          type="text"
          value={cart.customer.name}
          onChange={(e) =>
            dispatch({ type: "SET_CUSTOMER", patch: { name: e.currentTarget.value } })
          }
          placeholder={t.pos.customerName}
          autoComplete="name"
          className="field"
        />
        <input
          type="tel"
          value={cart.customer.phone}
          onChange={(e) =>
            dispatch({ type: "SET_CUSTOMER", patch: { phone: e.currentTarget.value } })
          }
          placeholder={t.pos.customerPhone}
          autoComplete="tel"
          inputMode="tel"
          className="field mono num"
        />

        {match && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-[var(--radius-md)] border border-[var(--color-ok-soft-fg)]/30 bg-[var(--color-ok-soft-bg)] px-3 py-2 text-[var(--color-ok-soft-fg)]">
              <div className="text-xs">
                <p className="font-semibold">
                  ★ {t.pos.returningCustomer} ·{" "}
                  <span className="mono num">
                    {t.pos.ordersCount(match.orderCount)}
                  </span>
                  {" · "}
                  <span className="chip chip-neutral">
                    {lifecycleLabel(lifecycleStageFor(match))}
                  </span>
                  {match.pointsAvailable > 0 && (
                    <>
                      {" · "}
                      <span className="mono num">
                        {t.pos.loyaltyPointsAvailable(match.pointsAvailable)}
                      </span>
                    </>
                  )}
                </p>
                <p className="opacity-80">
                  {match.name ?? "—"} · {t.pos.lastSeen}{" "}
                  <span className="mono">
                    {formatDateTimeTH(match.lastSeenAt)}
                  </span>
                </p>
              </div>
              <button
                type="button"
                onClick={autofill}
                className="btn-ghost btn-sm"
              >
                {t.pos.autofillCustomer}
              </button>
            </div>

            <PetCardsBlock phone={cart.customer.phone} />

            {existingNote && notes.ready && (
              <div className="rounded-[var(--radius-md)] border border-line bg-panel p-3">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="kicker">{t.pos.customerNotesHeader}</p>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-1">
                  <span className="kicker">{t.pos.customerTags}:</span>
                  {[...new Set([...SUGGESTED_TAGS, ...existingNote.tags])].map(
                    (tag) => {
                      const active = existingNote.tags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() =>
                            notes.set(cart.customer.phone, {
                              tags: toggleTag(existingNote.tags, tag),
                            })
                          }
                          className={
                            active ? "chip chip-gold" : "chip chip-neutral"
                          }
                        >
                          {tag}
                        </button>
                      );
                    },
                  )}
                  <input
                    type="text"
                    value={customTagDraft}
                    onChange={(e) => setCustomTagDraft(e.currentTarget.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const tag = customTagDraft.trim().toLowerCase();
                        if (!tag) return;
                        notes.set(cart.customer.phone, {
                          tags: toggleTag(existingNote.tags, tag),
                        });
                        setCustomTagDraft("");
                      }
                    }}
                    placeholder={t.pos.addCustomTag}
                    className="field w-24 py-0.5 text-[10px]"
                  />
                </div>
                <textarea
                  value={existingNote.note}
                  onChange={(e) =>
                    notes.set(cart.customer.phone, {
                      note: e.currentTarget.value,
                    })
                  }
                  placeholder={t.pos.customerNotePlaceholder}
                  rows={2}
                  className="field mt-2 text-xs"
                />
              </div>
            )}
          </>
        )}

        <input
          type="email"
          value={cart.customer.email}
          onChange={(e) =>
            dispatch({ type: "SET_CUSTOMER", patch: { email: e.currentTarget.value } })
          }
          placeholder={t.pos.customerEmail}
          autoComplete="email"
          className="field"
        />
        <textarea
          value={cart.customer.address}
          onChange={(e) =>
            dispatch({
              type: "SET_CUSTOMER",
              patch: { address: e.currentTarget.value },
            })
          }
          placeholder={t.pos.customerAddress}
          rows={3}
          className="field"
        />
      </div>
      {missing && (
        <p className="mt-2 text-xs text-[var(--color-warn-soft-fg)]">
          {t.pos.customerMissing}
        </p>
      )}
    </div>
  );
}
