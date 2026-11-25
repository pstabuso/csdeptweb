import { ConcernStatus } from "@prisma/client";
import { MessageSquare } from "lucide-react";
import Link from "next/link";

import { StatusBadge } from "@/components/portal/status-badge";
import { cx } from "@/lib/cx";
import type { StudentConcernListItem } from "@/lib/dashboard-data";
import { formatRelative } from "@/lib/format";

export function StudentConcernList({ concerns }: { concerns: StudentConcernListItem[] }) {
  return (
    <ul className="card divide-y divide-line overflow-hidden">
      {concerns.map((concern) => {
        const hasNewReply = concern.status === ConcernStatus.ANSWERED;

        return (
          <li key={concern.id}>
            <Link
              href={`/student/concerns/${concern.id}`}
              className={cx(
                "flex items-center gap-4 px-4 py-3.5 hover:bg-raised sm:px-5",
                concern.status === ConcernStatus.CLOSED && "opacity-75",
              )}
            >
              <span
                aria-hidden
                className={cx(
                  "h-2 w-2 shrink-0 rounded-full",
                  hasNewReply ? "bg-violet-400" : "bg-transparent",
                )}
              />
              <div className="min-w-0 flex-1">
                <p className={cx("truncate text-ink", hasNewReply ? "font-semibold" : "font-medium")}>
                  {concern.subject}
                </p>
                <p className="mt-0.5 truncate text-sm text-ink-muted">
                  {concern.category} · updated {formatRelative(concern.updatedAt)}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <StatusBadge status={concern.status} audience="student" />
                <span className="inline-flex items-center gap-1 text-xs text-ink-faint">
                  <MessageSquare size={12} />
                  {concern._count.replies}
                </span>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
