import { Role } from "@prisma/client";
import { ArrowRight, PenLine, Save } from "lucide-react";
import Link from "next/link";

import { updateStudentNumber } from "@/app/actions/concerns";
import { SubmitButton } from "@/components/forms/submit-button";
import { AppShell } from "@/components/layout/app-shell";
import { UpcomingSchedule } from "@/components/portal/schedule-board";
import { StudentConcernList } from "@/components/portal/student-concern-list";
import { EmptyState, Notice, SectionHeader, StatTile } from "@/components/ui/primitives";
import { requireUser } from "@/lib/auth";
import { getStudentOverview, getUpcomingScheduleEntries } from "@/lib/dashboard-data";

type PageProps = {
  searchParams?: Promise<{ notice?: string }>;
};

function StudentNumberSetup() {
  return (
    <section className="card card-pad border-violet-400/30">
      <p className="eyebrow">One-time setup</p>
      <h2 className="section-title mt-0.5">Add your student number</h2>
      <p className="muted mt-1 max-w-xl">
        The department uses it to find your records. You can submit concerns once it&apos;s saved.
      </p>
      <form action={updateStudentNumber} className="mt-4 flex flex-col gap-2 sm:flex-row">
        <label className="sr-only" htmlFor="studentNumber">
          Student number
        </label>
        <input
          id="studentNumber"
          name="studentNumber"
          required
          minLength={5}
          className="input sm:max-w-xs"
          placeholder="2024-00001"
        />
        <SubmitButton pendingLabel="Saving…">
          <Save size={16} />
          Save
        </SubmitButton>
      </form>
    </section>
  );
}

export default async function StudentOverviewPage({ searchParams }: PageProps) {
  const user = await requireUser([Role.STUDENT]);
  const { notice } = (await searchParams) ?? {};
  const [{ counts, needsAttention, recent }, upcoming] = await Promise.all([
    getStudentOverview(user.id),
    getUpcomingScheduleEntries(4),
  ]);
  const hasStudentNumber = Boolean(user.studentNumber);
  const firstName = user.name.split(" ")[0];

  return (
    <AppShell
      user={user}
      title={`Hi, ${firstName}`}
      description={
        user.studentNumber
          ? `Student number ${user.studentNumber}`
          : "Finish setup to start submitting concerns."
      }
      actions={
        hasStudentNumber ? (
          <Link href="/student/concerns/new" className="btn-primary">
            <PenLine size={16} />
            New concern
          </Link>
        ) : null
      }
    >
      <div className="space-y-6">
        <Notice code={notice} />

        {!hasStudentNumber ? <StudentNumberSetup /> : null}

        <div className="grid gap-3 sm:grid-cols-3">
          <StatTile
            label="Staff replied"
            value={counts.ANSWERED}
            helper={counts.ANSWERED ? "Read and follow up or close" : "Nothing new"}
            href="/student/concerns"
            highlight={counts.ANSWERED > 0}
          />
          <StatTile
            label="Waiting for staff"
            value={counts.OPEN}
            helper="Staff will reply here"
            href="/student/concerns"
          />
          <StatTile
            label="Closed"
            value={counts.CLOSED}
            href="/student/concerns?view=closed"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="space-y-3">
            <SectionHeader
              title={needsAttention.length ? "Needs your attention" : "Recent concerns"}
              action={
                counts.ALL ? (
                  <Link href="/student/concerns" className="btn-ghost btn-sm">
                    View all
                    <ArrowRight size={14} />
                  </Link>
                ) : null
              }
            />
            {needsAttention.length ? (
              <StudentConcernList concerns={needsAttention} />
            ) : recent.length ? (
              <StudentConcernList concerns={recent} />
            ) : (
              <EmptyState
                title="No concerns yet"
                description="Have a question about COR, grades, readmission, or your thesis? Send it to the department."
                action={
                  hasStudentNumber ? (
                    <Link href="/student/concerns/new" className="btn-primary">
                      <PenLine size={16} />
                      Submit a concern
                    </Link>
                  ) : null
                }
              />
            )}
          </section>

          <section className="space-y-3">
            <SectionHeader
              title="Coming up"
              action={
                <Link href="/student/calendar" className="btn-ghost btn-sm">
                  Calendar
                  <ArrowRight size={14} />
                </Link>
              }
            />
            <div className="card card-pad">
              <UpcomingSchedule entries={upcoming} />
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
