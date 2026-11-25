import { Role } from "@prisma/client";

import { formatActionLabel, formatDateTime, formatRelative, formatRoleLabel } from "@/lib/format";

type ActivityEntry = {
  id: string;
  action: string;
  entityType: string;
  createdAt: Date;
  actor: { name: string; role: Role; email?: string } | null;
};

export function ActivityList({ entries }: { entries: ActivityEntry[] }) {
  if (!entries.length) {
    return <p className="muted">No activity recorded yet.</p>;
  }

  return (
    <ul className="divide-y divide-line">
      {entries.map((entry) => (
        <li key={entry.id} className="flex items-start justify-between gap-4 py-2.5">
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink">{formatActionLabel(entry.action)}</p>
            <p className="truncate text-xs text-ink-muted">
              {entry.actor
                ? `${entry.actor.name} · ${formatRoleLabel(entry.actor.role)}`
                : "System"}{" "}
              · {entry.entityType}
            </p>
          </div>
          <time
            className="shrink-0 text-xs text-ink-faint"
            dateTime={entry.createdAt.toISOString()}
            title={formatDateTime(entry.createdAt)}
          >
            {formatRelative(entry.createdAt)}
          </time>
        </li>
      ))}
    </ul>
  );
}
