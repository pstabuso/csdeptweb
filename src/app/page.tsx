import { ConcernStatus, Role, UserStatus } from "@prisma/client";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth";
import { formatDate, formatTimeRange } from "@/lib/format";
import { getDb } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function getMonthRange() {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
  });
  const parts = Object.fromEntries(
    formatter.formatToParts(new Date()).map((part) => [part.type, part.value]),
  );
  const year = Number(parts.year);
  const month = Number(parts.month);
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;

  return {
    start: new Date(`${year}-${String(month).padStart(2, "0")}-01T00:00:00+08:00`),
    end: new Date(
      `${nextYear}-${String(nextMonth).padStart(2, "0")}-01T00:00:00+08:00`,
    ),
  };
}

export default async function Home() {
  const session = await getSession();

  if (session) {
    redirect("/dashboard");
  }

  const db = getDb();
  const monthRange = getMonthRange();
  const [studentCount, openConcerns, answeredConcerns, scheduleEntries] =
    await Promise.all([
      db.user.count({
        where: {
          role: Role.STUDENT,
          status: UserStatus.ACTIVE,
        },
      }),
      db.concern.count({
        where: {
          status: ConcernStatus.OPEN,
        },
      }),
      db.concern.count({
        where: {
          status: ConcernStatus.ANSWERED,
        },
      }),
      db.scheduleEntry.findMany({
        where: {
          startsAt: {
            gte: monthRange.start,
            lt: monthRange.end,
          },
        },
        include: {
          createdBy: {
            select: {
              name: true,
              role: true,
            },
          },
        },
        orderBy: [{ startsAt: "asc" }, { endsAt: "asc" }],
        take: 4,
      }),
    ]);

  const statCards = [
    {
      label: "Students",
      value: studentCount,
      tone: "text-violet-100",
    },
    {
      label: "Open concerns",
      value: openConcerns,
      tone: "text-fuchsia-100",
    },
    {
      label: "Answered",
      value: answeredConcerns,
      tone: "text-sky-100",
    },
  ];

  return (
    <main className="dynamic-home min-h-screen overflow-hidden px-5 py-6 text-slate-950 lg:px-8">
      <div className="dynamic-orb dynamic-orb-a" />
      <div className="dynamic-orb dynamic-orb-b" />
      <div className="dynamic-orb dynamic-orb-c" />

      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl flex-col gap-6 rounded-[2.6rem] border border-white/15 bg-[#0f0a1d]/78 p-6 text-slate-50 shadow-[0_30px_120px_-60px_rgba(10,8,24,0.96)] backdrop-blur-2xl lg:p-8">
        <header className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="max-w-4xl space-y-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-violet-200/80">
              Computer Science Department
            </p>
            <h1 className="max-w-4xl text-5xl font-semibold tracking-tight text-white md:text-7xl">
              Dynamic support, clearer queue, live visibility.
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
              Student concerns, staff replies, and department availability now
              move in one live system.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:w-[340px]">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full bg-violet-400 px-6 py-3 text-sm font-semibold text-white transition hover:bg-violet-300"
            >
              Open portal
            </Link>
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
            >
              Student sign up
            </Link>
          </div>
        </header>

        <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              {statCards.map((card) => (
                <article
                  key={card.label}
                  className="dynamic-panel rounded-[1.8rem] p-5"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                    {card.label}
                  </p>
                  <p className={`mt-3 text-4xl font-semibold ${card.tone}`}>
                    {card.value}
                  </p>
                </article>
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <article className="dynamic-panel rounded-[1.8rem] p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-violet-200/80">
                  Students
                </p>
                <h2 className="mt-3 text-xl font-semibold text-white">Submit</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Choose a concern type, add details, then track replies.
                </p>
              </article>
              <article className="dynamic-panel rounded-[1.8rem] p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-fuchsia-200/80">
                  Staff
                </p>
                <h2 className="mt-3 text-xl font-semibold text-white">Respond</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Sort the queue, answer concerns, and publish schedule updates.
                </p>
              </article>
              <article className="dynamic-panel rounded-[1.8rem] p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-200/80">
                  Admin
                </p>
                <h2 className="mt-3 text-xl font-semibold text-white">Control</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Manage access, monitor activity, and review the whole flow.
                </p>
              </article>
            </div>
          </div>

          <aside className="dynamic-panel rounded-[2rem] p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-violet-200/80">
                  Live schedule
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  This month
                </h2>
              </div>
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200">
                PH time
              </span>
            </div>

            <div className="mt-5 space-y-3">
              {scheduleEntries.length ? (
                scheduleEntries.map((entry, index) => (
                  <article
                    key={entry.id}
                    className="dynamic-list-item rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-4"
                    style={{ animationDelay: `${index * 120}ms` }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-semibold text-white">
                          {entry.title}
                        </h3>
                        <p className="mt-1 text-sm text-slate-300">
                          {entry.location}
                        </p>
                      </div>
                      <span className="rounded-full border border-violet-300/20 bg-violet-400/10 px-2.5 py-1 text-[11px] font-semibold text-violet-100">
                        {entry.createdBy.role.toLowerCase()}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-slate-300">
                      {formatDate(entry.startsAt)} /{" "}
                      {formatTimeRange(entry.startsAt, entry.endsAt)}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Posted by {entry.createdBy.name}
                    </p>
                  </article>
                ))
              ) : (
                <div className="rounded-[1.4rem] border border-dashed border-white/15 bg-white/[0.03] px-4 py-6 text-sm text-slate-400">
                  No schedule entries posted yet.
                </div>
              )}
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
