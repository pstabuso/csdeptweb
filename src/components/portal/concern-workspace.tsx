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
  description?: string;
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
  recent: "Recent",
  newest: "Newest",
  oldest: "Oldest",
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
  const activeConcerns = concerns.filter(
    (concern) => concern.status !== ConcernStatus.CLOSED,
  );
  const closedConcerns = concerns.filter(
    (concern) => concern.status === ConcernStatus.CLOSED,
  );
  const totalReplies = concerns.reduce(
    (count, concern) => count + concern.replies.length,
    0,
  );

  function renderConcernCard(concern: ConcernRecord) {
    return (
      <article
        key={concern.id}
        className="animate-enter rounded-[1.8rem] border border-slate-800 bg-slate-900/88 p-5 shadow-[0_20px_70px_-45px_rgba(0,0,0,0.95)] [animation-delay:120ms]"
      >
        <div className="grid gap-5 2xl:grid-cols-[minmax(0,1.15fr)_390px]">
          <div className="space-y-4">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={concern.status} />
                  <span className="rounded-full border border-violet-300/20 bg-violet-400/10 px-2.5 py-1 text-[11px] font-semibold text-violet-100">
                    {concern.category}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {concern.subject}
                  </h3>
                  <p className="mt-1 text-sm text-slate-400">
                    {concern.student.name} / {concern.student.email}
                  </p>
                  <p className="text-sm text-slate-500">
                    {concern.student.studentNumber || "No student number"} /{" "}
                    {formatDateTime(concern.createdAt)}
                  </p>
                </div>
              </div>

              <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.04] px-3 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Updated
                </p>
                <p className="mt-1 text-sm font-semibold text-white">
                  {formatDateTime(concern.updatedAt)}
                </p>
              </div>
            </div>

            <div className="rounded-[1.3rem] border border-white/10 bg-slate-900/82 p-4 text-sm leading-6 text-slate-200">
              {concern.message}
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-[1.3rem] border border-white/10 bg-slate-900/78 p-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-white">Thread</h4>
                <span className="rounded-full border border-white/10 bg-white/[0.05] px-2 py-1 text-[11px] font-semibold text-slate-300">
                  {concern.replies.length}
                </span>
              </div>

              {concern.replies.length ? (
                <div className="mt-3 space-y-2">
                  {concern.replies.map((reply) => (
                    <div
                      key={reply.id}
                      className="rounded-[1.1rem] border border-white/10 bg-slate-950/80 p-3"
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
                <p className="mt-3 rounded-[1.1rem] border border-dashed border-white/15 bg-slate-950/70 px-3 py-3 text-sm text-slate-400">
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
          </div>
        </div>
      </article>
    );
  }

  return (
    <div className="space-y-4">
      <section className="animate-enter rounded-[2rem] border border-slate-800 bg-slate-900/88 p-5 shadow-[0_20px_70px_-45px_rgba(0,0,0,0.95)] xl:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-violet-200/80">
              Concerns
            </p>
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-white">
                {title}
              </h2>
              {description ? (
                <p className="mt-1 text-sm text-slate-400">{description}</p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-4 xl:min-w-[620px]">
            <div className="rounded-[1.2rem] border border-sky-500/25 bg-sky-500/10 px-3 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-100">
                Open
              </p>
              <p className="mt-1 text-2xl font-semibold text-white">{openCount}</p>
            </div>
            <div className="rounded-[1.2rem] border border-fuchsia-500/25 bg-fuchsia-500/10 px-3 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-fuchsia-100">
                Answered
              </p>
              <p className="mt-1 text-2xl font-semibold text-white">
                {answeredCount}
              </p>
            </div>
            <div className="rounded-[1.2rem] border border-slate-800 bg-slate-950/70 px-3 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300">
                Closed
              </p>
              <p className="mt-1 text-2xl font-semibold text-white">
                {closedCount}
              </p>
            </div>
            <div className="rounded-[1.2rem] border border-slate-800 bg-slate-950/70 px-3 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300">
                Replies
              </p>
              <p className="mt-1 text-2xl font-semibold text-white">
                {totalReplies}
              </p>
            </div>
          </div>
        </div>

        <form
          action={currentPath}
          className="mt-5 grid gap-3 xl:grid-cols-[minmax(0,1.3fr)_160px_200px_150px_auto]"
        >
          {persistentParams
            ? Object.entries(persistentParams).map(([key, value]) => (
                <input key={key} type="hidden" name={key} value={value} />
              ))
            : null}
          <input
            name="query"
            defaultValue={filters.query}
            placeholder="Search subject, student, or student number"
            className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-violet-400"
          />
          <select
            name="status"
            defaultValue={filters.status}
            className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-violet-400"
          >
            <option value="ALL">All</option>
            <option value="OPEN">Open</option>
            <option value="ANSWERED">Answered</option>
            <option value="CLOSED">Closed</option>
          </select>
          <select
            name="category"
            defaultValue={filters.category}
            className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-violet-400"
          >
            <option value="ALL">All types</option>
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
      </section>

      <section className="space-y-5">
        {concerns.length ? (
          filters.status === "ALL" ? (
            <>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Active
                  </h3>
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] font-semibold text-slate-300">
                    {activeConcerns.length}
                  </span>
                </div>
                {activeConcerns.length ? (
                  activeConcerns.map(renderConcernCard)
                ) : (
                  <div className="rounded-[1.5rem] border border-dashed border-white/15 bg-slate-950/50 p-5 text-center text-sm text-slate-400">
                    No active concerns.
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Closed
                  </h3>
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] font-semibold text-slate-300">
                    {closedConcerns.length}
                  </span>
                </div>
                {closedConcerns.length ? (
                  closedConcerns.map(renderConcernCard)
                ) : (
                  <div className="rounded-[1.5rem] border border-dashed border-white/15 bg-slate-950/50 p-5 text-center text-sm text-slate-400">
                    No closed concerns.
                  </div>
                )}
              </div>
            </>
          ) : (
            concerns.map(renderConcernCard)
          )
        ) : (
          <div className="rounded-[1.5rem] border border-dashed border-white/15 bg-slate-950/50 p-5 text-center text-sm text-slate-400">
            {emptyMessage}
          </div>
        )}
      </section>
    </div>
  );
}
