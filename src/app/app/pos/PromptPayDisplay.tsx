"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { generatePromptPayPayload, type PromptPayProxy } from "@/lib/promptpay";
import { formatTHB } from "@/lib/money/format";

export function PromptPayDisplay({
  proxy,
  amountSatang,
}: {
  proxy: PromptPayProxy;
  amountSatang?: number;
}) {
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const payload = generatePromptPayPayload({ proxy, amountSatang });
        const dataString = await QRCode.toString(payload, {
          type: "svg",
          margin: 0,
          width: 220,
          color: { dark: "#2b231d", light: "#fffaf3" },
          errorCorrectionLevel: "L",
        });
        if (!cancelled) setSvg(dataString);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Could not render QR");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [proxy, amountSatang]);

  if (error) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-danger-soft-fg)] bg-[var(--color-danger-soft-bg)] px-4 py-3 text-sm text-[var(--color-danger-soft-fg)]">
        {error}
      </div>
    );
  }

  return (
    <div className="panel-quiet relative p-4 text-center border-gold-soft bg-gold-soft/25">
      <p className="kicker">PromptPay</p>
      {amountSatang !== undefined && amountSatang > 0 && (
        <p className="mono num mt-1 text-2xl font-semibold text-accent-deep">
          {formatTHB(amountSatang)} THB
        </p>
      )}
      <div className="mt-3 grid place-items-center">
        {svg ? (
          <div
            className="grid place-items-center rounded-[var(--radius-md)] bg-panel-strong p-3"
            dangerouslySetInnerHTML={{ __html: svg }}
            aria-label={`PromptPay QR code${amountSatang ? ` for ${formatTHB(amountSatang)} THB` : ""}`}
            role="img"
          />
        ) : (
          <div className="grid h-[220px] w-[220px] place-items-center rounded-[var(--radius-md)] bg-soft text-xs text-muted">
            Generating…
          </div>
        )}
      </div>
      <p className="mt-3 text-xs text-muted">
        Scan with any Thai banking app to pay.
      </p>
    </div>
  );
}
