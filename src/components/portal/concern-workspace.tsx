import {
  Concern,
  ConcernReply,
  ConcernStatus,
  User,
} from "@prisma/client";

import { ReplyForm } from "@/components/portal/reply-form";
import { StatusBadge } from "@/components/portal/status-badge";
import { ConcernFilterState } from "@/lib/dashboard-data";
import { formatDateTime } from "@/lib/format";

type ConcernRecord = Concern & {
  student: Pick<User, "name" | "email" | "studentNumber">;
  replies: Array<
    ConcernReply & {
      author: Pick<User, "name" | "role">;
    }
  >;
};

type ConcernWorkspaceProps = {
  title: string;
  description: string;
  concerns: ConcernRecord[];
  filters: ConcernFilterState;
  categoryOptions: string[];
  currentPath: string;
  replyRedirectTo?: string;
  persistentParams?: Record<string, string>;
  canReply: boolean;
  emptyMessage: string;
};

const sortLabels: Record<ConcernFilterState["sort"], string> = {
  recent: "Recently updated",
  newest: "Newest first",
  oldest: "Oldest first",
  "open-first": "Open first",
};

export function ConcernWorkspace({
  title,
  description,
  concerns,
  filters,
  categoryOptions,
  currentPath,
  replyRedirectTo,
  persistentParams,
  canReply,
  emptyMessage,
}: ConcernWorkspaceProps) {
  const openCount = concerns.filter((concern) => concern.status === ConcernStatus.OPEN).length;
  const answeredCount = concerns.filter(
    (concern) => concern.status === ConcernStatus.ANSWERED,
  ).length;
  const closedCount = concerns.filter(
    (concern) => concern.status === ConcernStatus.CLOSED,
  ).length;

  return (
    <div className="space-y-4">
      <section className="rounded-[1.6rem] border border-white/10 bg-slate-950/60 p-4 shadow-[0_24px_90px_-50px_rgba(8,15,28,0.95)] backdrop-blur">
        <div className="flex flex-col gap-2 border-b border-white/10 pb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">
              Concerns
            </p>
            <h2 className="mt-1 text-xl font-semibold text-white">{title}</h2>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-300">
              {description}
            </p>
          </div>
        </div>

        <form
          action={currentPath}
          className="mt-4 grid gap-2 lg:grid-cols-[minmax(0,1.3fr)_150px_160px_150px_auto]"
        >
          {persistentParams
            ? Object.entries(persistentParams).map(([key, value]) => (
                <input key={key} type="hidden" name={key} value={value} />
              ))
            : null}
          <input
            name="query"
            defaultValue={filters.query}
            placeholder="Search"
            className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-violet-400"
          />
          <select
            name="status"
            defaultValue={filters.status}
            className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-violet-400"
          >
            <option value="ALL">All statuses</option>
            <option value="OPEN">Open</option>
            <option value="ANSWERED">Answered</option>
            <option value="CLOSED">Closed</option>
          </select>
          <select
            name="category"
            defaultValue={filters.category}
            className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-violet-400"
          >
            <option value="ALL">All categories</option>
            {categoryOptions.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <select
            name="sort"
            defaultValue={filters.sort}
            className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-violet-400"
          >
            {Object.entries(sortLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-xl bg-violet-400 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-300"
          >
            Apply
          </button>
        </form>

        <div className="mt-4 grid gap-2 md:grid-cols-3">
          <div className="rounded-[1.1rem] border border-violet-300/15 bg-violet-400/10 px-3 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-100">
              Open
            </p>
            <p className="mt-1 text-2xl font-semibold text-white">{openCount}</p>
          </div>
          <div className="rounded-[1.1rem] border border-fuchsia-300/15 bg-fuchsia-400/10 px-3 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-fuchsia-100">
              Answered
            </p>
            <p className="mt-1 text-2xl font-semibold text-white">
              {answeredCount}
            </p>
          </div>
          <div className="rounded-[1.1rem] border border-white/10 bg-white/5 px-3 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-200">
              Closed
            </p>
            <p className="mt-1 text-2xl font-semibold text-white">{closedCount}</p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        {concerns.length ? (
          concerns.map((concern) => (
            <article
              key={concern.id}
              className="space-y-3 rounded-[1.5rem] border border-white/10 bg-slate-950/65 p-4 shadow-[0_24px_90px_-50px_rgba(8,15,28,0.95)] backdrop-blur"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-3">
                    <StatusBadge status={concern.status} />
                    <span className="rounded-full bg-violet-400/10 px-2.5 py-1 text-[11px] font-semibold text-violet-100 ring-1 ring-inset ring-violet-300/20">
                      {concern.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    {concern.subject}
                  </h3>
                  <div className="text-sm leading-5 text-slate-400">
                    <p>{concern.student.name}</p>
                    <p>{concern.student.email}</p>
                    <p>
                      {concern.student.studentNumber || "No ID"} /{" "}
                      {formatDateTime(concern.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="rounded-[1rem] border border-white/10 bg-slate-900/70 px-3 py-2 text-xs text-slate-300">
                  <p className="uppercase tracking-[0.16em] text-slate-500">Updated</p>
                  <p className="mt-1 font-semibold text-white">
                    {formatDateTime(concern.updatedAt)}
                  </p>
                </div>
              </div>

              <div className="rounded-[1.2rem] border border-white/10 bg-slate-900/80 p-3 text-sm leading-6 text-slate-200">
                {concern.message}
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Thread
                </h4>
                {concern.replies.length ? (
                  <div className="space-y-2">
                    {concern.replies.map((reply) => (
                      <div
                        key={reply.id}
                        className="rounded-[1.1rem] border border-white/10 bg-slate-900/80 p-3"
                      >
                        <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                          <span>{reply.author.name}</span>
                          <span className="text-slate-700">/</span>
                          <span>{reply.author.role.replaceAll("_", " ")}</span>
                          <span className="text-slate-700">/</span>
                          <span>{formatDateTime(reply.createdAt)}</span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-slate-200">
                          {reply.message}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-[1.1rem] border border-dashed border-white/15 bg-slate-900/70 px-3 py-3 text-sm text-slate-400">
                    No replies yet.
                  </p>
                )}
              </div>

              {canReply ? (
                <ReplyForm
                  concernId={concern.id}
                  defaultStatus={concern.status}
                  redirectTo={replyRedirectTo ?? currentPath}
                />
              ) : null}
            </article>
          ))
        ) : (
          <div className="rounded-[1.5rem] border border-dashed border-white/15 bg-slate-950/50 p-5 text-center text-sm text-slate-400">
            {emptyMessage}
          </div>
        )}
      </section>
    </div>
  );
}
