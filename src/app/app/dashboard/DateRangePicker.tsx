"use client";

import type { RangePresetId } from "@/lib/demo/dashboard-range";

const PRESETS: Array<{ id: RangePresetId; label: string }> = [
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "last7", label: "Last 7 days" },
  { id: "last30", label: "Last 30 days" },
  { id: "this_month", label: "This month" },
];

export function DateRangePicker({
  value,
  onChange,
}: {
  value: RangePresetId;
  onChange: (id: RangePresetId) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Date range"
      className="inline-flex flex-wrap items-center gap-1 rounded-full border border-line bg-panel p-1"
    >
      {PRESETS.map((p) => {
        const active = value === p.id;
        return (
          <button
            key={p.id}
            type="button"
            role="tab"
            onClick={() => onChange(p.id)}
            aria-pressed={active}
            className={
              active
                ? "rounded-full bg-accent-strong px-3 py-1 text-xs font-semibold tracking-wide text-panel-strong"
                : "rounded-full px-3 py-1 text-xs font-semibold tracking-wide text-muted hover:text-accent-strong"
            }
          >
            {p.label}
          </button>
        );
      })}
    </div>
  );
}
