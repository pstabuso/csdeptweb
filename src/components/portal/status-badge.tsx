import { ConcernStatus } from "@prisma/client";

import { cx } from "@/lib/cx";

const styles: Record<ConcernStatus, string> = {
  OPEN: "bg-amber-400/15 text-amber-200 ring-1 ring-inset ring-amber-300/30",
  ANSWERED:
    "bg-emerald-400/15 text-emerald-200 ring-1 ring-inset ring-emerald-300/30",
  CLOSED: "bg-slate-400/15 text-slate-200 ring-1 ring-inset ring-slate-300/20",
};

export function StatusBadge({ status }: { status: ConcernStatus }) {
  return (
    <span
      className={cx(
        "inline-flex rounded-full px-3 py-1 text-xs font-semibold tracking-wide",
        styles[status],
      )}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}
