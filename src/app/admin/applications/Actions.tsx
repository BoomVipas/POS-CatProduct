"use client";

import { useState, useTransition } from "react";
import { useToast } from "@/components/ui/Toast";

export function ApproveRejectButtons({
  applicationId,
}: {
  applicationId: string;
}) {
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState<"approved" | "rejected" | null>(null);
  const { push } = useToast();

  function approve() {
    startTransition(async () => {
      // DD-26 will call the real server action.
      await fakeDelay();
      setDone("approved");
      push({
        kind: "success",
        title: "Approved (mock)",
        message: `Application ${applicationId.slice(0, 8)}… → invite code generated.`,
      });
    });
  }

  function reject() {
    if (
      typeof window !== "undefined" &&
      !window.confirm("Reject this application? This cannot be undone.")
    ) {
      return;
    }
    startTransition(async () => {
      await fakeDelay();
      setDone("rejected");
      push({
        kind: "info",
        title: "Rejected (mock)",
        message: `Application ${applicationId.slice(0, 8)}… → status set to rejected.`,
      });
    });
  }

  if (done) {
    return (
      <span
        className={
          done === "approved" ? "chip chip-ok" : "chip chip-danger"
        }
      >
        {done}
      </span>
    );
  }

  return (
    <div className="inline-flex items-center justify-end gap-2">
      <button
        type="button"
        className="btn-accent btn-sm"
        onClick={approve}
        disabled={pending}
        aria-busy={pending}
      >
        {pending ? "…" : "Approve"}
      </button>
      <button
        type="button"
        className="btn-ghost btn-sm"
        onClick={reject}
        disabled={pending}
        aria-busy={pending}
      >
        Reject
      </button>
    </div>
  );
}

function fakeDelay(ms: number = 300): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
