"use client";

import { useMemo, useState } from "react";
import { useDemoSales } from "@/lib/demo/useDemoSales";
import { useDemoCustomerTokens } from "@/lib/demo/useDemoCustomerTokens";
import { useCart, useCartDispatch } from "@/lib/pos/cart-store";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";
import {
  lookupReturningCustomer,
  matchToCustomerPatch,
} from "@/lib/demo/returning-customer";
import { formatTHB } from "@/lib/money/format";
import { formatDateTimeTH } from "@/lib/date";

/**
 * Wave 40c — Returning-customer lookup at the cart-panel top.
 */
export function ReturningCustomerLookup() {
  const cart = useCart();
  const dispatch = useCartDispatch();
  const { orders, ready: salesReady } = useDemoSales();
  const { portalCustomers, ready: tokensReady } = useDemoCustomerTokens();
  const [phone, setPhone] = useState(cart.customer.phone || "");
  const debouncedPhone = useDebouncedValue(phone, 300);

  const match = useMemo(() => {
    if (!salesReady || !tokensReady) return null;
    if (!debouncedPhone || debouncedPhone.trim().length < 6) return null;
    return lookupReturningCustomer(debouncedPhone, orders, portalCustomers);
  }, [debouncedPhone, orders, portalCustomers, salesReady, tokensReady]);

  function handleAttach() {
    if (!match) return;
    dispatch({ type: "SET_CUSTOMER", patch: matchToCustomerPatch(match) });
  }

  const showEmptyMatch =
    debouncedPhone.trim().length >= 6 && match === null && salesReady && tokensReady;

  return (
    <section className="panel-quiet grid gap-2 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <label
          htmlFor="returning-customer-phone"
          className="kicker"
        >
          Customer phone / เบอร์ลูกค้า
        </label>
        {phone && (
          <button
            type="button"
            onClick={() => setPhone("")}
            className="btn-link text-[11px]"
          >
            Clear
          </button>
        )}
      </div>
      <input
        id="returning-customer-phone"
        type="tel"
        inputMode="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="08xx-xxx-xxxx"
        className="field mono num"
      />

      {showEmptyMatch && (
        <p className="text-xs text-muted">
          New phone — not seen before. Complete the sale; the receipt QR will
          let them register after.
        </p>
      )}

      {match && (
        <div className="grid gap-2 rounded-[var(--radius-md)] border border-accent/25 bg-panel-strong p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="chip chip-warn">★ Returning customer</span>
            {match.portal && (
              <span className="chip chip-gold">Portal-registered</span>
            )}
          </div>
          <div className="text-sm">
            <p className="headline-upright text-base text-accent-deep">
              {match.name || "(no name on file)"}
            </p>
            {match.pastSales && (
              <p className="mono num mt-0.5 text-xs text-muted">
                {match.pastSales.orderCount} past order
                {match.pastSales.orderCount === 1 ? "" : "s"} ·{" "}
                {formatTHB(match.pastSales.totalSatang)} lifetime · last seen{" "}
                {formatDateTimeTH(match.pastSales.lastSeenAt)}
              </p>
            )}
            {match.pastSales && match.pastSales.pointsAvailable > 0 && (
              <p className="mt-0.5 text-xs font-semibold text-[var(--color-warn-soft-fg)]">
                ★ <span className="mono num">{match.pastSales.pointsAvailable}</span> loyalty points available
              </p>
            )}
            {match.lastProductNames.length > 0 && (
              <p className="mt-1 text-xs text-text-soft">
                Last bought:{" "}
                <span className="font-semibold">
                  {match.lastProductNames.join(", ")}
                </span>
              </p>
            )}
          </div>

          {match.portal && match.portal.pets.length > 0 && (
            <div className="rounded-[var(--radius-md)] border border-line bg-soft px-3 py-2">
              <p className="kicker">Pets / สัตว์เลี้ยง</p>
              <ul className="mt-1 grid gap-1 text-xs">
                {match.portal.pets.map((pet, i) => (
                  <li key={i}>
                    <span className="font-semibold text-accent-deep">
                      {pet.name}
                    </span>{" "}
                    <span className="text-muted">
                      ({pet.species}
                      {pet.breed ? `, ${pet.breed}` : ""})
                    </span>
                    {pet.allergies && (
                      <span className="ml-1 chip chip-danger">
                        ⚠ {pet.allergies}
                      </span>
                    )}
                    {pet.preferences && (
                      <span className="ml-1 text-[11px] text-text-soft">
                        likes: {pet.preferences}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            type="button"
            onClick={handleAttach}
            className="btn-ghost btn-sm self-start"
          >
            Attach this customer to sale →
          </button>
        </div>
      )}
    </section>
  );
}
