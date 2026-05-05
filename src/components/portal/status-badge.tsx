import { ConcernStatus } from "@prisma/client";

import { cx } from "@/lib/cx";

const styles: Record<ConcernStatus, string> = {
  OPEN: "bg-amber-100 text-amber-900",
  ANSWERED: "bg-emerald-100 text-emerald-900",
  CLOSED: "bg-slate-200 text-slate-700",
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

