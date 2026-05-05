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
                className="space-y-4 rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-[0_20px_80px_-44px_rgba(15,23,42,0.42)]"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <StatusBadge status={concern.status} />
                      <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-900">
                        {concern.category}
                      </span>
                    </div>
                    <h2 className="mt-3 text-xl font-semibold text-slate-950">
                      {concern.subject}
                    </h2>
                    <p className="mt-2 text-sm text-slate-500">
                      Submitted {formatDateTime(concern.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="rounded-3xl bg-slate-50 p-4 text-sm leading-7 text-slate-700">
                  {concern.message}
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Replies
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
                      The department has not replied yet. Your concern remains in
                      the queue.
                    </p>
                  )}
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white/80 p-8 text-center text-sm text-slate-500">
              No concerns submitted yet. Use the form to send your first concern.
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}

