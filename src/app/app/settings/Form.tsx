"use client";

import { useEffect, useState } from "react";
import { useDemoSettings } from "@/lib/demo/useDemoSettings";
import { useDemoAudit } from "@/lib/demo/useDemoAudit";
import { isValidPhoneTH, normalizePhoneTH } from "@/lib/phone";
import { useToast } from "@/components/ui/Toast";

export function SettingsForm() {
  const { settings, save, ready } = useDemoSettings();
  const audit = useDemoAudit();
  const [brand, setBrand] = useState(settings.brandDisplayName);
  const [phone, setPhone] = useState(settings.promptpayPhone);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const { push } = useToast();

  // SSR returns DEFAULT_DEMO_SETTINGS (no window). Once the localStorage values
  // are read post-hydration, sync them into the form once.
  useEffect(() => {
    if (!ready) return;
    setBrand(settings.brandDisplayName);
    setPhone(settings.promptpayPhone);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const dirty =
    brand !== settings.brandDisplayName || phone !== settings.promptpayPhone;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPhoneError(null);
    if (!isValidPhoneTH(phone)) {
      setPhoneError("Doesn't look like a valid Thai phone");
      return;
    }
    const normalized = normalizePhoneTH(phone, "local");
    const next = {
      ...settings,
      brandDisplayName: brand.trim() || "Demo Brand",
      promptpayPhone: normalized,
    };
    save(next);
    setPhone(normalized);
    audit.log({
      action: "settings_update",
      targetTable: "workspaces",
      targetId: null,
      summary: `Brand → ${next.brandDisplayName}, phone → ${next.promptpayPhone}`,
      oldValue: settings,
      newValue: next,
    });
    push({
      kind: "success",
      title: "Saved",
      message: "Settings updated. POS will use these on the next sale.",
    });
  }

  function onReset() {
    setBrand(settings.brandDisplayName);
    setPhone(settings.promptpayPhone);
    setPhoneError(null);
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6">
      <div className="flex items-center justify-end">
        {dirty ? (
          <span className="chip chip-warn">Unsaved changes</span>
        ) : (
          <span className="chip chip-ok">Saved</span>
        )}
      </div>

      <section className="panel-quiet p-6">
        <p className="kicker">Brand</p>
        <h2 className="headline-upright mt-1 text-xl text-accent-deep">
          Storefront identity
        </h2>
        <p className="mt-1 max-w-[62ch] text-sm text-text-soft">
          Shown in the top bar across every operator screen and on receipts.
        </p>

        <div className="mt-5 grid gap-1.5">
          <label htmlFor="brand-name" className="field-label">
            Brand display name
          </label>
          <input
            id="brand-name"
            type="text"
            className="field"
            value={brand}
            onChange={(e) => setBrand(e.currentTarget.value)}
            autoComplete="organization"
            maxLength={120}
          />
          <span className="text-xs text-muted">Shown in the top bar.</span>
        </div>
      </section>

      <section className="panel-quiet p-6">
        <p className="kicker">Payment</p>
        <h2 className="headline-upright mt-1 text-xl text-accent-deep">
          PromptPay
        </h2>
        <p className="mt-1 max-w-[62ch] text-sm text-text-soft">
          The QR code generated at checkout uses this PromptPay-registered
          phone number.
        </p>

        <div className="mt-5 grid gap-1.5">
          <label htmlFor="promptpay-phone" className="field-label">
            PromptPay phone
          </label>
          <input
            id="promptpay-phone"
            type="text"
            className="field mono"
            value={phone}
            onChange={(e) => setPhone(e.currentTarget.value)}
            placeholder="08x-xxx-xxxx"
            autoComplete="tel"
            inputMode="tel"
            maxLength={20}
            aria-invalid={phoneError ? true : undefined}
            aria-describedby="promptpay-msg"
          />
          <span
            id="promptpay-msg"
            className={
              phoneError
                ? "text-xs text-[var(--color-danger-soft-fg)]"
                : "text-xs text-muted"
            }
          >
            {phoneError ?? "The QR generated at checkout uses this number."}
          </span>
        </div>
      </section>

      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          className="btn-ghost btn-sm"
          onClick={onReset}
          disabled={!dirty}
        >
          Reset
        </button>
        <button type="submit" className="btn-accent btn-md">
          Save changes
        </button>
      </div>
    </form>
  );
}
