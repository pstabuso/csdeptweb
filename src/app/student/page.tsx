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

function ConcernList({
  title,
  concerns,
}: {
  title: string;
  concerns: Awaited<ReturnType<typeof getStudentDashboardData>>;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
          {title}
        </h2>
        <span className="text-xs text-slate-500">{concerns.length}</span>
      </div>

      {concerns.length ? (
        concerns.map((concern) => (
          <article
            key={concern.id}
            className="space-y-3 rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-4 shadow-[0_24px_90px_-50px_rgba(8,15,28,0.95)] backdrop-blur"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <StatusBadge status={concern.status} />
                  <span className="rounded-full bg-violet-400/10 px-2.5 py-1 text-[11px] font-semibold text-violet-100 ring-1 ring-inset ring-violet-300/20">
                    {concern.category}
                  </span>
                </div>
                <h3 className="mt-2 text-lg font-semibold text-white">
                  {concern.subject}
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  {formatDateTime(concern.createdAt)}
                </p>
              </div>
            </div>

            <div className="rounded-[1.2rem] border border-white/10 bg-slate-900/80 p-3 text-sm leading-6 text-slate-200">
              {concern.message}
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Replies
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
          </article>
        ))
      ) : (
        <div className="rounded-[1.5rem] border border-dashed border-white/15 bg-slate-950/50 p-5 text-center text-sm text-slate-400">
          None
        </div>
      )}
    </div>
  );
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
  const activeConcerns = concerns.filter((concern) => concern.status !== "CLOSED");
  const closedConcerns = concerns.filter((concern) => concern.status === "CLOSED");
  const previousMonthHref = `/student?scheduleMonth=${shiftMonth(scheduleMonth, -1)}`;
  const nextMonthHref = `/student?scheduleMonth=${shiftMonth(scheduleMonth, 1)}`;

  return (
    <AppShell user={user} title="Student concern desk">
      <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
        <div className="space-y-4">
          <section className="rounded-[1.6rem] border border-white/10 bg-slate-950/70 p-4 shadow-[0_24px_90px_-50px_rgba(8,15,28,0.95)] backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">
              Record
            </p>
            <h2 className="mt-1 text-xl font-semibold text-white">
              {hasStudentNumber ? "Ready" : "Student number required"}
            </h2>

            <div className="mt-4 rounded-[1.2rem] border border-white/10 bg-slate-900/85 p-3">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Student number
                  </p>
                  <p className="mt-1 text-base font-semibold text-white">
                    {user.studentNumber || "Not set"}
                  </p>
                </div>
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide ${
                    hasStudentNumber
                      ? "bg-violet-400/15 text-violet-100 ring-1 ring-inset ring-violet-300/30"
                      : "bg-fuchsia-400/15 text-fuchsia-100 ring-1 ring-inset ring-fuchsia-300/30"
                  }`}
                >
                  {hasStudentNumber ? "Ready" : "Needed"}
                </span>
              </div>

              {!hasStudentNumber ? (
                <form action={updateStudentNumber} className="mt-4 space-y-3">
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
                      className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-violet-400"
                      placeholder="2024-00001"
                    />
                  </div>

                  <SubmitButton pendingLabel="Saving student number...">
                    Save student number
                  </SubmitButton>
                </form>
              ) : null}
            </div>
          </section>

          {hasStudentNumber ? (
            <StudentConcernForm redirectTo={`/student?scheduleMonth=${scheduleMonth}`} />
          ) : (
            <section className="rounded-[1.6rem] border border-dashed border-violet-300/20 bg-violet-400/10 p-4 text-sm leading-6 text-violet-100">
              Submit unlocks after saving your student number.
            </section>
          )}
        </div>

        <section className="space-y-4">
          <ScheduleBoard
            month={scheduleMonth}
            entries={scheduleEntries}
            canManage={false}
            previousMonthHref={previousMonthHref}
            nextMonthHref={nextMonthHref}
            redirectTo="/student"
            title="Department calendar"
          />

          {concerns.length ? (
            <>
              <ConcernList title="Active" concerns={activeConcerns} />
              <ConcernList title="Closed" concerns={closedConcerns} />
            </>
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-white/15 bg-slate-950/50 p-5 text-center text-sm text-slate-400">
              No concerns yet.
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
