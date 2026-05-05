import { Role } from "@prisma/client";

import { updateStudentNumber } from "@/app/actions/concerns";
import { SubmitButton } from "@/components/forms/submit-button";
import { AppShell } from "@/components/layout/app-shell";
import { ScheduleBoard } from "@/components/portal/schedule-board";
import { StudentConcernForm } from "@/components/portal/student-concern-form";
import { StatusBadge } from "@/components/portal/status-badge";
import { requireUser } from "@/lib/auth";
import {
  getScheduleEntries,
  getStudentDashboardData,
  normalizeScheduleMonth,
} from "@/lib/dashboard-data";
import { formatDateTime } from "@/lib/format";

type PageProps = {
  searchParams?: Promise<{
    scheduleMonth?: string;
  }>;
};

function shiftMonth(month: string, delta: number) {
  const [year, monthPart] = month.split("-").map(Number);
  const next = new Date(year, monthPart - 1 + delta, 1);

  return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}`;
}

export default async function StudentPage({ searchParams }: PageProps) {
  const user = await requireUser([Role.STUDENT]);
  const params = (await searchParams) ?? {};
  const scheduleMonth = normalizeScheduleMonth(params.scheduleMonth);
  const [concerns, scheduleEntries] = await Promise.all([
    getStudentDashboardData(user.id),
    getScheduleEntries(scheduleMonth),
  ]);
  const hasStudentNumber = Boolean(user.studentNumber);
  const previousMonthHref = `/student?scheduleMonth=${shiftMonth(scheduleMonth, -1)}`;
  const nextMonthHref = `/student?scheduleMonth=${shiftMonth(scheduleMonth, 1)}`;

  return (
    <AppShell
      user={user}
      title="Student concern desk"
      description="Keep your student record complete, submit concerns to the department, and track every reply from one organized workspace."
    >
      <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <div className="space-y-6">
          <section className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 shadow-[0_24px_90px_-50px_rgba(8,15,28,0.95)] backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
              Student record
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              {hasStudentNumber
                ? "Profile ready for submissions"
                : "Student number required"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              A student number is required before a concern can enter the
              department queue. This helps the staff verify identity and handle
              requests consistently.
            </p>

            <div className="mt-5 rounded-[1.6rem] border border-white/10 bg-slate-900/85 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Current student number
                  </p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {user.studentNumber || "Not yet provided"}
                  </p>
                </div>
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold tracking-wide ${
                    hasStudentNumber
                      ? "bg-emerald-400/15 text-emerald-200 ring-1 ring-inset ring-emerald-300/30"
                      : "bg-amber-400/15 text-amber-100 ring-1 ring-inset ring-amber-300/30"
                  }`}
                >
                  {hasStudentNumber ? "Ready" : "Action needed"}
                </span>
              </div>

              {!hasStudentNumber ? (
                <form action={updateStudentNumber} className="mt-5 space-y-4">
                  <div className="space-y-2">
                    <label
                      className="text-sm font-medium text-slate-200"
                      htmlFor="studentNumber"
                    >
                      Student number
                    </label>
                    <input
                      id="studentNumber"
                      name="studentNumber"
                      required
                      minLength={4}
                      className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
                      placeholder="Example: 2024-00001"
                    />
                  </div>

                  <SubmitButton pendingLabel="Saving student number...">
                    Save student number
                  </SubmitButton>
                </form>
              ) : (
                <p className="mt-4 text-sm leading-6 text-slate-400">
                  Your profile is complete. You can now submit a new concern
                  below and the department team will see it in their queue.
                </p>
              )}
            </div>
          </section>

          {hasStudentNumber ? (
            <StudentConcernForm redirectTo={`/student?scheduleMonth=${scheduleMonth}`} />
          ) : (
            <section className="rounded-[2rem] border border-dashed border-cyan-300/20 bg-cyan-400/10 p-6 text-sm leading-6 text-cyan-100">
              Concern submission stays locked until your student number is
              saved. Once this record is complete, the submission form will
              open automatically.
            </section>
          )}
        </div>

        <section className="space-y-5">
          <ScheduleBoard
            month={scheduleMonth}
            entries={scheduleEntries}
            canManage={false}
            previousMonthHref={previousMonthHref}
            nextMonthHref={nextMonthHref}
            redirectTo="/student"
            title="Department availability calendar"
            description="Check the coordinator and secretary schedules so you know when consultations, office hours, and department availability are posted."
          />

          {concerns.length ? (
            concerns.map((concern) => (
              <article
                key={concern.id}
                className="space-y-4 rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 shadow-[0_24px_90px_-50px_rgba(8,15,28,0.95)] backdrop-blur"
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
              No concerns submitted yet. Complete your student record and use
              the form to send your first concern.
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
