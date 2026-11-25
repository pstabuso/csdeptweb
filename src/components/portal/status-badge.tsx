import { ConcernStatus } from "@prisma/client";

import { cx } from "@/lib/cx";

type Audience = "staff" | "student";

/**
 * Status labels are worded for whoever is reading them:
 * a student sees "Waiting for staff", staff see "Needs reply".
 */
const labels: Record<Audience, Record<ConcernStatus, string>> = {
  staff: {
    OPEN: "Needs reply",
    ANSWERED: "Answered",
    CLOSED: "Closed",
  },
  student: {
    OPEN: "Waiting for staff",
    ANSWERED: "Staff replied",
    CLOSED: "Closed",
  },
};

const styles: Record<ConcernStatus, string> = {
  OPEN: "border-amber-400/30 bg-amber-400/10 text-amber-100",
  ANSWERED: "border-emerald-400/30 bg-emerald-400/10 text-emerald-100",
  CLOSED: "border-line-strong bg-white/[0.04] text-ink-muted",
};

const dots: Record<ConcernStatus, string> = {
  OPEN: "bg-amber-300",
  ANSWERED: "bg-emerald-300",
  CLOSED: "bg-ink-faint",
};

export function StatusBadge({
  status,
  audience = "staff",
}: {
  status: ConcernStatus;
  audience?: Audience;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        styles[status],
      )}
    >
      <span className={cx("h-1.5 w-1.5 rounded-full", dots[status])} />
      {labels[audience][status]}
    </span>
  );
}

export function getStatusLabel(status: ConcernStatus, audience: Audience = "staff") {
  return labels[audience][status];
}
