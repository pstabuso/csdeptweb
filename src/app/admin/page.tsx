import { Role, UserStatus } from "@prisma/client";
import { Save } from "lucide-react";

import { updateUserAccess } from "@/app/actions/admin";
import { SubmitButton } from "@/components/forms/submit-button";
import { AppShell } from "@/components/layout/app-shell";
import { ConcernWorkspace } from "@/components/portal/concern-workspace";
import { ScheduleBoard } from "@/components/portal/schedule-board";
import { requireUser } from "@/lib/auth";
import {
  getAdminDashboardData,
  getConcernCategoryOptions,
  getScheduleEntries,
  normalizeConcernFilters,
  normalizeScheduleMonth,
} from "@/lib/dashboard-data";
import { formatActionLabel, formatDateTime, formatRoleLabel } from "@/lib/format";

const roleLabels = {
  STUDENT: "Students",
  COORDINATOR: "Coordinators",
  SECRETARY: "Secretaries",
  ADMIN: "Admins",
};

const roleBadgeStyles: Record<Role, string> = {
  STUDENT:
    "bg-violet-400/15 text-violet-100 ring-1 ring-inset ring-violet-300/20",
  COORDINATOR:
    "bg-fuchsia-400/15 text-fuchsia-100 ring-1 ring-inset ring-fuchsia-300/30",
  SECRETARY:
    "bg-purple-400/15 text-purple-100 ring-1 ring-inset ring-purple-300/30",
  ADMIN:
    "bg-violet-300/15 text-violet-50 ring-1 ring-inset ring-violet-200/30",
};

const accessBadgeStyles: Record<UserStatus, string> = {
  ACTIVE:
    "bg-violet-400/15 text-violet-100 ring-1 ring-inset ring-violet-300/20",
  DISABLED:
    "bg-fuchsia-400/15 text-fuchsia-100 ring-1 ring-inset ring-fuchsia-300/20",
};

type PageProps = {
  searchParams?: Promise<{
    status?: string;
    category?: string;
    sort?: string;
    query?: string;
    scheduleMonth?: string;
  }>;
};

function shiftMonth(month: string, delta: number) {
  const [year, monthPart] = month.split("-").map(Number);
  const next = new Date(year, monthPart - 1 + delta, 1);

  return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}`;
}

function buildHref(
  path: string,
  params: Record<string, string | undefined>,
) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      searchParams.set(key, value);
    }
  });

  const query = searchParams.toString();
  return query ? `${path}?${query}` : path;
}

export default async function AdminPage({ searchParams }: PageProps) {
  const user = await requireUser([Role.ADMIN]);
  const params = (await searchParams) ?? {};
  const filters = normalizeConcernFilters({
    ...params,
    sort: params.sort ?? "open-first",
  });
  const scheduleMonth = normalizeScheduleMonth(params.scheduleMonth);
  const [{ stats, roleCounts, concerns, auditLogs, users }, categoryOptions, scheduleEntries] =
    await Promise.all([
      getAdminDashboardData(filters),
      getConcernCategoryOptions(),
      getScheduleEntries(scheduleMonth),
    ]);

  const adminConcernHref = buildHref("/admin", {
    status: filters.status !== "ALL" ? filters.status : undefined,
    category: filters.category !== "ALL" ? filters.category : undefined,
    sort: filters.sort !== "open-first" ? filters.sort : undefined,
    query: filters.query || undefined,
    scheduleMonth,
  });
  const previousMonthHref = buildHref("/admin", {
    status: filters.status !== "ALL" ? filters.status : undefined,
    category: filters.category !== "ALL" ? filters.category : undefined,
    sort: filters.sort !== "open-first" ? filters.sort : undefined,
    query: filters.query || undefined,
    scheduleMonth: shiftMonth(scheduleMonth, -1),
  });
  const nextMonthHref = buildHref("/admin", {
    status: filters.status !== "ALL" ? filters.status : undefined,
    category: filters.category !== "ALL" ? filters.category : undefined,
    sort: filters.sort !== "open-first" ? filters.sort : undefined,
    query: filters.query || undefined,
    scheduleMonth: shiftMonth(scheduleMonth, 1),
  });

  const statCards = [
    {
      label: "Accounts",
      value: stats.totalUsers,
      helper: `${stats.activeUsers} active / ${stats.disabledUsers} disabled`,
    },
    {
      label: "Open queue",
      value: stats.openConcerns,
      helper: `${stats.totalConcerns} total concerns in the system`,
    },
    {
      label: "Resolved flow",
      value: stats.answeredConcerns + stats.closedConcerns,
      helper: `${stats.answeredConcerns} answered / ${stats.closedConcerns} closed`,
    },
    {
      label: "Replies sent",
      value: stats.repliesCount,
      helper: "All timestamps are shown in Philippine time",
    },
  ];

  return (
    <AppShell
      user={user}
      title="Admin control"
      description="Accounts, queue, and audit flow."
      currentPath="/admin"
    >
      <div className="space-y-5">
        <section id="overview" className="grid scroll-mt-5 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card) => (
            <article
              key={card.label}
              className="rounded-lg border border-slate-800 bg-slate-900/88 p-4 shadow-[0_20px_70px_-45px_rgba(0,0,0,0.95)]"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                {card.label}
              </p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-white">
                {card.value}
              </p>
              <p className="mt-1 text-sm leading-5 text-slate-300">{card.helper}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_340px]">
          <section id="users" className="scroll-mt-5 rounded-lg border border-slate-800 bg-slate-900/88 p-4 shadow-[0_20px_70px_-45px_rgba(0,0,0,0.95)]">
            <div className="flex flex-col gap-3 border-b border-white/10 pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">
                  Users
                </p>
                <h2 className="mt-1 text-xl font-semibold text-white">Edit users</h2>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {users.map((account) => {
                const action = updateUserAccess.bind(null, account.id);
                const isCurrentSession = account.id === user.id;

                return (
                  <article
                    key={account.id}
                    className="rounded-lg border border-slate-800 bg-slate-950/70 p-4"
                  >
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                      <div className="max-w-xl space-y-2">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="text-base font-semibold text-white">
                            {account.name}
                          </span>
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold tracking-wide ${roleBadgeStyles[account.role]}`}
                          >
                            {formatRoleLabel(account.role)}
                          </span>
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold tracking-wide ${accessBadgeStyles[account.status]}`}
                          >
                            {formatRoleLabel(account.status)}
                          </span>
                          {isCurrentSession ? (
                            <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-slate-100 ring-1 ring-inset ring-white/10">
                              Current session
                            </span>
                          ) : null}
                        </div>

                        <div className="space-y-1 text-sm leading-5 text-slate-400">
                          <p>{account.email}</p>
                          <p>
                            Student number: {account.studentNumber || "Not set"}
                          </p>
                          <p>
                            Joined {formatDateTime(account.createdAt)} /{" "}
                            {account._count.concerns} concerns /{" "}
                            {account._count.replies} replies
                          </p>
                          <p>
                            Last login:{" "}
                            {account.lastLoginAt
                              ? formatDateTime(account.lastLoginAt)
                              : "No recorded login"}
                          </p>
                          {account.lockedUntil ? (
                            <p>Locked until {formatDateTime(account.lockedUntil)}</p>
                          ) : account.failedLoginAttempts ? (
                            <p>
                              Failed sign-ins: {account.failedLoginAttempts}
                            </p>
                          ) : null}
                        </div>
                      </div>

                      <form
                        action={action}
                        className="grid w-full gap-2 rounded-lg border border-slate-800 bg-slate-900 p-3 md:grid-cols-2"
                      >
                        {isCurrentSession ? (
                          <>
                            <input type="hidden" name="role" value={account.role} />
                            <input type="hidden" name="status" value={account.status} />
                          </>
                        ) : null}
                        <div className="space-y-2">
                          <label
                            className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400"
                            htmlFor={`name-${account.id}`}
                          >
                            Full name
                          </label>
                          <input
                            id={`name-${account.id}`}
                            name="name"
                            defaultValue={account.name}
                            required
                            className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-violet-400"
                          />
                        </div>

                        <div className="space-y-2">
                          <label
                            className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400"
                            htmlFor={`email-${account.id}`}
                          >
                            Email
                          </label>
                          <input
                            id={`email-${account.id}`}
                            name="email"
                            type="email"
                            defaultValue={account.email}
                            required
                            className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-violet-400"
                          />
                        </div>

                        <div className="space-y-2">
                          <label
                            className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400"
                            htmlFor={`student-number-${account.id}`}
                          >
                            Student number
                          </label>
                          <input
                            id={`student-number-${account.id}`}
                            name="studentNumber"
                            defaultValue={account.studentNumber ?? ""}
                            className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-violet-400"
                            placeholder="Student ID"
                          />
                        </div>

                        <div className="space-y-2">
                          <label
                            className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400"
                            htmlFor={`role-${account.id}`}
                          >
                            Role
                          </label>
                          <select
                            id={`role-${account.id}`}
                            name="role"
                            defaultValue={account.role}
                            disabled={isCurrentSession}
                            className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-violet-400"
                          >
                            <option value="STUDENT">Student</option>
                            <option value="COORDINATOR">Coordinator</option>
                            <option value="SECRETARY">Secretary</option>
                            <option value="ADMIN">Admin</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label
                            className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400"
                            htmlFor={`status-${account.id}`}
                          >
                            Access
                          </label>
                          <select
                            id={`status-${account.id}`}
                            name="status"
                            defaultValue={account.status}
                            disabled={isCurrentSession}
                            className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-violet-400"
                          >
                            <option value="ACTIVE">Active</option>
                            <option value="DISABLED">Disabled</option>
                          </select>
                        </div>

                        <div className="flex items-end md:justify-end">
                          <div className="w-full space-y-2 md:w-auto">
                            {isCurrentSession ? (
                              <p className="text-xs text-slate-500">
                                Your role and access stay fixed here.
                              </p>
                            ) : null}
                            <SubmitButton
                              pendingLabel="Saving..."
                              className="w-full md:w-auto"
                            >
                              <Save size={16} />
                              {isCurrentSession ? "Save profile" : "Save account"}
                            </SubmitButton>
                          </div>
                        </div>
                      </form>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <aside className="space-y-5">
            <section className="rounded-lg border border-slate-800 bg-slate-900/88 p-5 shadow-[0_20px_70px_-45px_rgba(0,0,0,0.95)]">
              <h2 className="text-lg font-semibold text-white">
                Role distribution
              </h2>
              <div className="mt-4 space-y-3">
                {Object.entries(roleCounts).map(([role, count]) => (
                  <div
                    key={role}
                    className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm"
                  >
                    <span className="font-medium text-slate-300">
                      {roleLabels[role as keyof typeof roleLabels]}
                    </span>
                    <span className="font-semibold text-white">{count}</span>
                  </div>
                ))}
              </div>
            </section>

            <section id="activity" className="scroll-mt-5 rounded-lg border border-slate-800 bg-slate-900/88 p-5 shadow-[0_20px_70px_-45px_rgba(0,0,0,0.95)]">
              <h2 className="text-lg font-semibold text-white">
                Activity feed
              </h2>
              <div className="mt-4 space-y-3">
                {auditLogs.map((entry) => (
                  <article
                    key={entry.id}
                    className="rounded-lg border border-slate-800 bg-slate-950/70 p-4"
                  >
                    <div className="flex flex-col gap-2">
                      <p className="text-sm font-semibold text-white">
                        {formatActionLabel(entry.action)}
                      </p>
                      <p className="text-sm text-slate-400">
                        {entry.actor
                          ? `${entry.actor.name} (${formatRoleLabel(entry.actor.role)})`
                          : "System"}{" "}
                        / {entry.entityType}
                      </p>
                      <p className="text-sm text-slate-400">
                        {formatDateTime(entry.createdAt)}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </aside>
        </section>

        <ConcernWorkspace
          title="Admin concern oversight"
          description="Review full student concern threads and every response sent by the department team from one searchable oversight panel."
          concerns={concerns}
          filters={filters}
          categoryOptions={categoryOptions}
          currentPath="/admin"
          replyRedirectTo={adminConcernHref}
          persistentParams={{ scheduleMonth }}
          canReply={false}
          emptyMessage="No concerns match the current filter set."
        />

        <ScheduleBoard
          month={scheduleMonth}
          entries={scheduleEntries}
          canManage={false}
          previousMonthHref={previousMonthHref}
          nextMonthHref={nextMonthHref}
          redirectTo="/admin"
          title="Department schedule overview"
          description="Admin can monitor the posted coordinator and secretary schedule here so student-facing availability stays visible and current."
        />
      </div>
    </AppShell>
  );
}
