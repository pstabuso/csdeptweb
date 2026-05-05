import { Role } from "@prisma/client";

import { AppShell } from "@/components/layout/app-shell";
import { StudentConcernForm } from "@/components/portal/student-concern-form";
import { StatusBadge } from "@/components/portal/status-badge";
import { formatDateTime } from "@/lib/format";
import { requireUser } from "@/lib/auth";
import { getStudentDashboardData } from "@/lib/dashboard-data";

export default async function StudentPage() {
  const user = await requireUser([Role.STUDENT]);
  const concerns = await getStudentDashboardData(user.id);

  return (
    <AppShell
      user={user}
      title="Student concern desk"
      description="Create a concern, monitor replies from the department team, and keep track of every submission from one dashboard."
    >
      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <StudentConcernForm />

        <section className="space-y-5">
          {concerns.length ? (
            concerns.map((concern) => (
              <article
                key={concern.id}
                className="space-y-4 rounded-[2rem] border border-white/10 bg-slate-950/60 p-6 shadow-[0_24px_90px_-50px_rgba(8,15,28,0.95)] backdrop-blur"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <StatusBadge status={concern.status} />
                      <span className="rounded-full bg-cyan-400/15 px-3 py-1 text-xs font-semibold text-cyan-200 ring-1 ring-inset ring-cyan-300/30">
                        {concern.category}
                      </span>
                    </div>
                    <h2 className="mt-3 text-xl font-semibold text-white">
                      {concern.subject}
                    </h2>
                    <p className="mt-2 text-sm text-slate-400">
                      Submitted {formatDateTime(concern.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-4 text-sm leading-7 text-slate-200">
                  {concern.message}
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Replies
                  </h3>
                  {concern.replies.length ? (
                    <div className="space-y-3">
                      {concern.replies.map((reply) => (
                        <div
                          key={reply.id}
                          className="rounded-3xl border border-white/10 bg-slate-900/80 p-4"
                        >
                          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                            <span>{reply.author.name}</span>
                            <span className="text-slate-600">/</span>
                            <span>{reply.author.role.replaceAll("_", " ")}</span>
                            <span className="text-slate-600">/</span>
                            <span>{formatDateTime(reply.createdAt)}</span>
                          </div>
                          <p className="mt-3 text-sm leading-7 text-slate-200">
                            {reply.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="rounded-3xl border border-dashed border-white/15 bg-slate-900/70 px-4 py-5 text-sm text-slate-400">
                      The department has not replied yet. Your concern remains in
                      the queue.
                    </p>
                  )}
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-[2rem] border border-dashed border-white/15 bg-slate-950/50 p-8 text-center text-sm text-slate-400">
              No concerns submitted yet. Use the form to send your first concern.
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
