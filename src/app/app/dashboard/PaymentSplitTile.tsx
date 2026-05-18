import { formatTHB } from "@/lib/money/format";

type Split = {
  cash: number;
  promptpay: number;
  transfer: number;
  card: number;
  other: number;
};

const LABELS: Record<keyof Split, string> = {
  cash: "Cash",
  promptpay: "PromptPay",
  transfer: "Transfer",
  card: "Card",
  other: "Other",
};

const ORDER: Array<keyof Split> = ["cash", "promptpay", "transfer", "card", "other"];

export function PaymentSplitTile({ split }: { split: Split }) {
  const total = ORDER.reduce((s, k) => s + split[k], 0);
  return (
    <div className="panel-quiet border-l-2 border-line-strong px-5 py-4">
      <p className="kicker">Payment split</p>
      <div className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-5">
        {ORDER.map((k) => {
          const v = split[k];
          const pct = total > 0 ? Math.round((v / total) * 100) : 0;
          return (
            <div
              key={k}
              className="rounded-[var(--radius-md)] border border-line-soft bg-panel px-3 py-2"
            >
              <p className="kicker text-[0.62rem]">{LABELS[k]}</p>
              <p className="mono num mt-1 text-base font-semibold text-accent-deep">
                {formatTHB(v)}
              </p>
              <p className="mono num text-[11px] text-muted">{pct}%</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
