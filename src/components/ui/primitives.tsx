import { CircleCheck, ChevronLeft, ChevronRight, CircleAlert } from "lucide-react";
import Link from "next/link";

import { cx } from "@/lib/cx";
import { getNotice } from "@/lib/notices";

export function Notice({ code }: { code?: string | null }) {
  const notice = getNotice(code);

  if (!notice) {
    return null;
  }

  const isError = notice.tone === "error";
  const Icon = isError ? CircleAlert : CircleCheck;

  return (
    <div
      role={isError ? "alert" : "status"}
      className={cx(
        "animate-enter flex items-start gap-3 rounded-lg border px-4 py-3 text-sm",
        isError
          ? "border-rose-400/30 bg-rose-500/10 text-rose-100"
          : "border-emerald-400/30 bg-emerald-500/10 text-emerald-100",
      )}
    >
      <Icon size={18} className="mt-px shrink-0" />
      <p>{notice.text}</p>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-line-strong px-6 py-10 text-center">
      <p className="font-medium text-ink">{title}</p>
      {description ? <p className="muted max-w-md">{description}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h2 className="section-title mt-0.5">{title}</h2>
        {description ? <p className="muted mt-1">{description}</p> : null}
      </div>
      {action ? <div className="flex shrink-0 flex-wrap gap-2">{action}</div> : null}
    </div>
  );
}

export function StatTile({
  label,
  value,
  helper,
  href,
  highlight,
}: {
  label: string;
  value: number | string;
  helper?: string;
  href?: string;
  highlight?: boolean;
}) {
  const body = (
    <>
      <p className="text-sm text-ink-muted">{label}</p>
      <p
        className={cx(
          "mt-1 text-3xl font-semibold tabular-nums",
          highlight ? "text-violet-200" : "text-ink",
        )}
      >
        {value}
      </p>
      {helper ? <p className="hint mt-1">{helper}</p> : null}
    </>
  );

  const className = cx(
    "card card-pad block",
    highlight && "border-violet-400/30 bg-violet-500/[0.07]",
    href && "hover:border-line-strong hover:bg-raised",
  );

  return href ? (
    <Link href={href} className={className}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}

export function Pagination({
  page,
  pageCount,
  total,
  hrefForPage,
}: {
  page: number;
  pageCount: number;
  total: number;
  hrefForPage: (page: number) => string;
}) {
  if (pageCount <= 1) {
    return null;
  }

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-between gap-3 pt-2 text-sm"
    >
      <p className="text-ink-muted">
        Page {page} of {pageCount} · {total} total
      </p>
      <div className="flex gap-2">
        {page > 1 ? (
          <Link href={hrefForPage(page - 1)} className="btn-secondary btn-sm">
            <ChevronLeft size={14} />
            Previous
          </Link>
        ) : null}
        {page < pageCount ? (
          <Link href={hrefForPage(page + 1)} className="btn-secondary btn-sm">
            Next
            <ChevronRight size={14} />
          </Link>
        ) : null}
      </div>
    </nav>
  );
}

export function LinkTabs({
  tabs,
  label,
}: {
  label: string;
  tabs: Array<{ label: string; href: string; active: boolean; count?: number }>;
}) {
  return (
    <nav
      aria-label={label}
      className="flex gap-1 overflow-x-auto rounded-lg border border-line bg-canvas/60 p-1"
    >
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          aria-current={tab.active ? "page" : undefined}
          className={cx(
            "inline-flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium",
            tab.active
              ? "bg-violet-500/20 text-violet-50"
              : "text-ink-muted hover:bg-white/[0.06] hover:text-ink",
          )}
        >
          {tab.label}
          {typeof tab.count === "number" ? (
            <span
              className={cx(
                "rounded-full px-1.5 text-xs tabular-nums",
                tab.active ? "bg-violet-400/30" : "bg-white/[0.08]",
              )}
            >
              {tab.count}
            </span>
          ) : null}
        </Link>
      ))}
    </nav>
  );
}
