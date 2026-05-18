"use client";

import { useState } from "react";
import { useDemoClaims } from "@/lib/demo/useDemoClaims";
import { useCart, useCartDispatch } from "@/lib/pos/cart-store";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useT } from "@/lib/i18n/provider";

export function ImportClaimButton() {
  const claims = useDemoClaims();
  const cart = useCart();
  const dispatch = useCartDispatch();
  const { push } = useToast();
  const { t } = useT();

  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const openClaims = claims.claims.filter((c) => c.status === "open");

  function submit() {
    setError(null);
    if (code.trim().length < 4) {
      setError(t.qrMenu.codeFormat);
      return;
    }
    const claim = claims.redeem(code);
    if (!claim) {
      setError(t.qrMenu.codeNotFound);
      return;
    }
    if (cart.lines.length > 0) {
      const proceed = confirm(t.qrMenu.replaceCart);
      if (!proceed) return;
      dispatch({ type: "CLEAR" });
    }
    for (const line of claim.lines) {
      dispatch({
        type: "ADD",
        productId: line.productId,
        qty: line.qty,
        fulfillment: line.fulfillment,
      });
    }
    // Tag this order's acquisition channel as the QR self-order menu.
    dispatch({ type: "SET_SOURCE", source: "qr_menu" });
    if (claim.customerName) {
      dispatch({
        type: "SET_CUSTOMER",
        patch: { name: claim.customerName },
      });
    }
    push({
      kind: "success",
      title: t.qrMenu.imported(claim.customerName),
      message: t.qrMenu.importedBody(claim.lines.length),
    });
    setOpen(false);
    setCode("");
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn-ghost btn-sm"
      >
        {t.qrMenu.importHeader}
        {openClaims.length > 0 && (
          <span className="mono num ml-1.5 inline-grid h-4 min-w-4 place-items-center rounded-full bg-[var(--color-warn-soft-bg)] px-1 text-[10px] font-semibold text-[var(--color-warn-soft-fg)]">
            {openClaims.length}
          </span>
        )}
      </button>
      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          setError(null);
          setCode("");
        }}
        title={t.qrMenu.importHeader}
        size="sm"
      >
        <p className="text-sm text-text-soft">{t.qrMenu.importBody}</p>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.currentTarget.value.toUpperCase())}
          placeholder="ABCD"
          autoFocus
          maxLength={6}
          className="field mono num mt-3 w-full py-3 text-center text-3xl font-semibold tracking-[0.4em] uppercase text-accent-deep"
        />
        {error && (
          <p className="mt-2 text-xs text-[var(--color-danger-soft-fg)]">
            {error}
          </p>
        )}

        {openClaims.length > 0 && (
          <details className="mt-4">
            <summary className="cursor-pointer text-xs font-semibold text-muted">
              {t.qrMenu.openClaims(openClaims.length)}
            </summary>
            <ul className="mt-2 grid gap-1 text-xs">
              {openClaims.slice(0, 6).map((c) => (
                <li
                  key={c.id}
                  className="flex items-baseline justify-between gap-2 rounded-[var(--radius-sm)] border border-line bg-panel px-2 py-1"
                >
                  <span className="mono num font-semibold tracking-wider text-accent-deep">
                    {c.code}
                  </span>
                  <span className="text-muted">{c.customerName}</span>
                  <span className="mono num text-muted">
                    {c.lines.length} item{c.lines.length === 1 ? "" : "s"}
                  </span>
                </li>
              ))}
            </ul>
          </details>
        )}

        <div className="mt-4 flex justify-end gap-2">
          <Button
            variant="ghost"
            onClick={() => {
              setOpen(false);
              setError(null);
              setCode("");
            }}
          >
            {t.common.cancel}
          </Button>
          <Button onClick={submit}>{t.qrMenu.importCta}</Button>
        </div>
      </Modal>
    </>
  );
}
