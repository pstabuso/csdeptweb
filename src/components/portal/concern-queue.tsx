import { ConcernStatus, Role } from "@prisma/client";
import { MessageSquare, Search } from "lucide-react";
import Link from "next/link";

import { StatusBadge } from "@/components/portal/status-badge";
import { EmptyState, LinkTabs, Pagination } from "@/components/ui/primitives";
import { CONCERN_SORT_LABELS, getCategoryOwner } from "@/lib/constants";
import { cx } from "@/lib/cx";
import {
  concernFiltersToParams,
  type ConcernFilterDefaults,
  type ConcernFilterState,
  type QueueConcern,
  type StatusCounts,
} from "@/lib/dashboard-data";
import { formatRelative, formatRoleLabel } from "@/lib/format";
import { buildHref } from "@/lib/href";

type ConcernQueueProps = {
  /** Path of the list page, e.g. "/coordinator" or "/admin/concerns". */
  listPath: string;
  /** Base for detail links, e.g. "/coordinator/concerns". */
  detailBasePath: string;
  filters: ConcernFilterState;
  defaults: ConcernFilterDefaults;
  queue: {
    items: QueueConcern[];
    total: number;
    page: number;
    pageCount: number;
    statusCounts: StatusCounts;
  };
  categoryOptions: string[];
  /** Label for the "mine" scope, e.g. "Coordinator categories". Null hides scope tabs. */
  mineLabel: string | null;
};

const statusTabs: Array<{ label: string; value: ConcernFilterState["status"] }> = [
  { label: "Needs reply", value: ConcernStatus.OPEN },
  { label: "Answered", value: ConcernStatus.ANSWERED },
  { label: "Closed", value: ConcernStatus.CLOSED },
  { label: "All", value: "ALL" },
];

function ActivityHint({ concern }: { concern: QueueConcern }) {
  const lastReply = concern.replies[0];

  if (concern.status !== ConcernStatus.OPEN) {
    return null;
  }

  if (!lastReply) {
    return <span className="chip-accent">New</span>;
  }

  if (lastReply.author.role === Role.STUDENT) {
    return <span className="chip-accent">Student followed up</span>;
  }

  return null;
}

export function ConcernQueue({
  listPath,
  detailBasePath,
  filters,
  defaults,
  queue,
  categoryOptions,
  mineLabel,
}: ConcernQueueProps) {
  const hrefWith = (overrides: Partial<ConcernFilterState>) =>
    buildHref(
      listPath,
      concernFiltersToParams(filters, defaults, { page: 1, ...overrides }),
    );
  const hasActiveFilters =
    filters.category !== "ALL" || Boolean(filters.query) || filters.sort !== (defaults.sort ?? "open-first");

  return (
    <div className="space-y-4">
      {mineLabel ? (
        <LinkTabs
          label="Queue scope"
          tabs={[
            { label: mineLabel, href: hrefWith({ scope: "mine" }), active: filters.scope === "mine" },
            { label: "All concerns", href: hrefWith({ scope: "all" }), active: filters.scope === "all" },
          ]}
        />
      ) : null}

      <div className="card card-pad space-y-4">
        <LinkTabs
          label="Filter by status"
          tabs={statusTabs.map((tab) => ({
            label: tab.label,
            href: hrefWith({ status: tab.value }),
            active: filters.status === tab.value,
            count: queue.statusCounts[tab.value],
          }))}
        />

        <form
          action={listPath}
          className="grid gap-2 md:grid-cols-[minmax(0,1fr)_180px_180px_auto]"
        >
          {filters.status !== (defaults.status ?? "ALL") ? (
            <input type="hidden" name="status" value={filters.status} />
          ) : null}
          {filters.scope !== (defaults.scope ?? "all") ? (
            <input type="hidden" name="scope" value={filters.scope} />
          ) : null}
          <label className="relative">
            <span className="sr-only">Search</span>
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint"
            />
            <input
              name="query"
              type="search"
              defaultValue={filters.query}
              placeholder="Search subject, student name, email or number"
              className="input pl-9"
            />
          </label>
          <label>
            <span className="sr-only">Concern type</span>
            <select name="category" defaultValue={filters.category} className="input">
              <option value="ALL">All types</option>
              {categoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">Sort</span>
            <select name="sort" defaultValue={filters.sort} className="input">
              {Object.entries(CONCERN_SORT_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary flex-1 md:flex-none">
              Apply
            </button>
            {hasActiveFilters ? (
              <Link
                href={hrefWith({ category: "ALL", query: "", sort: defaults.sort ?? "open-first" })}
                className="btn-ghost"
              >
                Clear
              </Link>
            ) : null}
          </div>
        </form>
      </div>

      {queue.items.length ? (
        <ul className="card divide-y divide-line overflow-hidden">
          {queue.items.map((concern) => (
            <li key={concern.id}>
              <Link
                href={`${detailBasePath}/${concern.id}`}
                className={cx(
                  "flex flex-col gap-2 px-4 py-3.5 hover:bg-raised sm:flex-row sm:items-center sm:gap-4 sm:px-5",
                  concern.status === ConcernStatus.CLOSED && "opacity-75",
                )}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={concern.status} />
                    <ActivityHint concern={concern} />
                  </div>
                  <p className="mt-1.5 truncate font-medium text-ink">{concern.subject}</p>
                  <p className="mt-0.5 truncate text-sm text-ink-muted">
                    {concern.student.name}
                    {concern.student.studentNumber ? ` · ${concern.student.studentNumber}` : ""}
                  </p>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2 text-sm text-ink-muted sm:flex-col sm:items-end sm:gap-1">
                  <span className="chip">{concern.category}</span>
                  {filters.scope === "all" && mineLabel ? (
                    <span className="hint">
                      {formatRoleLabel(getCategoryOwner(concern.category))}
                    </span>
                  ) : null}
                  <span className="inline-flex items-center gap-3 text-xs">
                    <span className="inline-flex items-center gap-1" title="Replies">
                      <MessageSquare size={13} />
                      {concern._count.replies}
                    </span>
                    <span title="Last updated">{formatRelative(concern.updatedAt)}</span>
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          title={
            filters.status === ConcernStatus.OPEN && !filters.query
              ? "Nothing needs a reply right now"
              : "No concerns match these filters"
          }
          description={
            filters.scope === "mine" && mineLabel
              ? "Try “All concerns” to see other categories."
              : undefined
          }
        />
      )}

      <Pagination
        page={queue.page}
        pageCount={queue.pageCount}
        total={queue.total}
        hrefForPage={(page) =>
          buildHref(listPath, concernFiltersToParams(filters, defaults, { page }))
        }
      />
    </div>
  );
}
