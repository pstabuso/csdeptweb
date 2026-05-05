import {
  Concern,
  ConcernReply,
  ConcernStatus,
  Role,
  User,
} from "@prisma/client";

import { ReplyForm } from "@/components/portal/reply-form";
import { StatusBadge } from "@/components/portal/status-badge";
import { formatDateTime } from "@/lib/format";

type StaffConcern = Concern & {
  student: Pick<User, "name" | "email">;
  replies: Array<
    ConcernReply & {
      author: Pick<User, "name" | "role">;
    }
  >;
};

type StaffDashboardProps = {
  role: "COORDINATOR" | "SECRETARY";
  concerns: StaffConcern[];
};

export function StaffDashboard({ role, concerns }: StaffDashboardProps) {
  const label = role === Role.COORDINATOR ? "Coordinator" : "Secretary";
  const openCount = concerns.filter((concern) => concern.status === ConcernStatus.OPEN).length;

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <section className="space-y-5">
        {concerns.map((concern) => (
          <article
            key={concern.id}
            className="space-y-4 rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-[0_20px_80px_-44px_rgba(15,23,42,0.45)]"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <StatusBadge status={concern.status} />
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {concern.category}
                  </span>
                </div>
                <h2 className="text-xl font-semibold text-slate-950">
                  {concern.subject}
                </h2>
                <div className="text-sm leading-6 text-slate-500">
                  <p>{concern.student.name}</p>
                  <p>{concern.student.email}</p>
                  <p>Submitted {formatDateTime(concern.createdAt)}</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-slate-50 p-4 text-sm leading-7 text-slate-700">
              {concern.message}
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                Conversation
              </h3>
              {concern.replies.length ? (
                <div className="space-y-3">
                  {concern.replies.map((reply) => (
                    <div
                      key={reply.id}
                      className="rounded-3xl border border-slate-200 bg-white p-4"
                    >
                      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        <span>{reply.author.name}</span>
                        <span className="text-slate-300">/</span>
                        <span>{reply.author.role.replaceAll("_", " ")}</span>
                        <span className="text-slate-300">/</span>
                        <span>{formatDateTime(reply.createdAt)}</span>
                      </div>
                      <p className="mt-3 text-sm leading-7 text-slate-700">
                        {reply.message}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="rounded-3xl border border-dashed border-slate-300 bg-white px-4 py-5 text-sm text-slate-500">
                  No staff response yet.
                </p>
              )}
            </div>

            <ReplyForm concernId={concern.id} defaultStatus={concern.status} />
          </article>
        ))}

        {concerns.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white/80 p-8 text-center text-sm text-slate-500">
            No student concerns yet.
          </div>
        ) : null}
      </section>

      <aside className="space-y-5">
        <div className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_20px_80px_-44px_rgba(15,23,42,0.4)]">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            {label} queue
          </p>
          <p className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
            {openCount}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            concerns are still open and waiting for a response or resolution.
          </p>
        </div>
        <div className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_20px_80px_-44px_rgba(15,23,42,0.4)]">
          <h3 className="text-lg font-semibold text-slate-950">Workflow notes</h3>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
            <li>Review new concerns and clarify missing details as early as possible.</li>
            <li>Set the status to Answered after a complete response is sent.</li>
            <li>Move resolved items to Closed so the admin dashboard reflects true backlog.</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
