import { Role, UserStatus } from "@prisma/client";

import { updateUserAccess } from "@/app/actions/admin";
import { SubmitButton } from "@/components/forms/submit-button";
import { AppShell } from "@/components/layout/app-shell";
import { StatusBadge } from "@/components/portal/status-badge";
import { requireUser } from "@/lib/auth";
import { getAdminDashboardData } from "@/lib/dashboard-data";
import {
  formatActionLabel,
  formatDateTime,
  formatRoleLabel,
} from "@/lib/format";

const roleLabels = {
  STUDENT: "Students",
  COORDINATOR: "Coordinators",
  SECRETARY: "Secretaries",
  ADMIN: "Admins",
};

const roleBadgeStyles: Record<Role, string> = {
  STUDENT:
    "bg-slate-100/10 text-slate-200 ring-1 ring-inset ring-slate-200/15",
  COORDINATOR:
    "bg-cyan-400/15 text-cyan-200 ring-1 ring-inset ring-cyan-300/30",
  SECRETARY:
    "bg-amber-400/15 text-amber-100 ring-1 ring-inset ring-amber-300/30",
  ADMIN:
    "bg-fuchsia-400/15 text-fuchsia-200 ring-1 ring-inset ring-fuchsia-300/30",
};

const accessBadgeStyles: Record<UserStatus, string> = {
  ACTIVE:
    "bg-emerald-400/15 text-emerald-200 ring-1 ring-inset ring-emerald-300/30",
  DISABLED:
    "bg-rose-400/15 text-rose-200 ring-1 ring-inset ring-rose-300/30",
};

export default async function AdminPage() {
  const user = await requireUser([Role.ADMIN]);
  const { stats, roleCounts, recentConcerns, auditLogs, users } =
    await getAdminDashboardData();

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
      title="Admin operations hub"
      description="Control roles, account access, and profile records while monitoring concern flow and audited activity across the department portal."
    >
      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card) => (
            <article
              key={card.label}
              className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 shadow-[0_24px_90px_-50px_rgba(8,15,28,0.95)] backdrop-blur"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">
                {card.label}
              </p>
              <p className="mt-3 text-4xl font-semibold tracking-tight text-white">
                {card.value}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                {card.helper}
              </p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_360px]">
          <section className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 shadow-[0_24px_90px_-50px_rgba(8,15,28,0.95)] backdrop-blur">
            <div className="flex flex-col gap-4 border-b border-white/10 pb-6">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
                  Account governance
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  Edit names, emails, student numbers, roles, and access
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
                  Department roles are assigned here by admin. Any account that
                  is not granted coordinator, secretary, or admin access remains
                  a student account by default.
                </p>
              </div>
              <div className="rounded-[1.6rem] border border-cyan-300/15 bg-cyan-400/10 px-4 py-4 text-sm leading-6 text-cyan-100">
                This workspace follows a single-account model: one login,
                admin-managed permissions, and complete user records before a
                student can enter the concern queue.
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {users.map((account) => {
                const action = updateUserAccess.bind(null, account.id);
                const isCurrentSession = account.id === user.id;

                return (
                  <article
                    key={account.id}
                    className="rounded-[1.7rem] border border-white/10 bg-slate-900/85 p-5"
                  >
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                      <div className="max-w-xl space-y-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="text-lg font-semibold text-white">
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

                        <div className="space-y-1 text-sm leading-6 text-slate-400">
                          <p>{account.email}</p>
                          <p>
                            Student number: {account.studentNumber || "Not set"}
                          </p>
                          <p>
                            Joined {formatDateTime(account.createdAt)} /{" "}
                            {account._count.concerns} concerns /{" "}
                            {account._count.replies} replies
                          </p>
                        </div>

                        {isCurrentSession ? (
                          <p className="rounded-2xl border border-fuchsia-300/15 bg-fuchsia-400/10 px-4 py-3 text-sm leading-6 text-fuchsia-100">
                            Changes to this account take effect on the current
                            admin session immediately after save.
                          </p>
                        ) : null}
                      </div>

                      <form
                        action={action}
                        className="grid w-full gap-3 rounded-[1.5rem] border border-white/10 bg-slate-950/90 p-4 md:grid-cols-2"
                      >
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
                            className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
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
                            className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
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
                            className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
                            placeholder="Required before students can submit"
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
                            className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
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
                            className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
                          >
                            <option value="ACTIVE">Active</option>
                            <option value="DISABLED">Disabled</option>
                          </select>
                        </div>

                        <div className="flex items-end md:justify-end">
                          <SubmitButton
                            pendingLabel="Saving..."
                            className="w-full md:w-auto"
                          >
                            Save account
                          </SubmitButton>
                        </div>
                      </form>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 shadow-[0_24px_90px_-50px_rgba(8,15,28,0.95)] backdrop-blur">
              <h2 className="text-lg font-semibold text-white">
                Role distribution
              </h2>
              <div className="mt-4 space-y-3">
                {Object.entries(roleCounts).map(([role, count]) => (
                  <div
                    key={role}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
                  >
                    <span className="font-medium text-slate-300">
                      {roleLabels[role as keyof typeof roleLabels]}
                    </span>
                    <span className="font-semibold text-white">{count}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 shadow-[0_24px_90px_-50px_rgba(8,15,28,0.95)] backdrop-blur">
              <h2 className="text-lg font-semibold text-white">
                Queue health
              </h2>
              <div className="mt-4 grid gap-3">
                <div className="rounded-2xl border border-amber-300/15 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
                  Open concerns:{" "}
                  <span className="font-semibold">{stats.openConcerns}</span>
                </div>
                <div className="rounded-2xl border border-emerald-300/15 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
                  Answered concerns:{" "}
                  <span className="font-semibold">
                    {stats.answeredConcerns}
                  </span>
                </div>
                <div className="rounded-2xl border border-slate-300/15 bg-slate-400/10 px-4 py-3 text-sm text-slate-100">
                  Closed concerns:{" "}
                  <span className="font-semibold">{stats.closedConcerns}</span>
                </div>
              </div>
            </section>
          </aside>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <section className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 shadow-[0_24px_90px_-50px_rgba(8,15,28,0.95)] backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-fuchsia-300">
                  Recent concerns
                </p>
                <h2 className="mt-2 text-xl font-semibold text-white">
                  Latest queue movement
                </h2>
              </div>
              <p className="text-sm text-slate-400">Asia/Manila</p>
            </div>

            <div className="mt-5 space-y-4">
              {recentConcerns.map((concern) => (
                <article
                  key={concern.id}
                  className="rounded-[1.6rem] border border-white/10 bg-slate-900/80 p-4"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <StatusBadge status={concern.status} />
                        <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200 ring-1 ring-inset ring-white/10">
                          {concern.category}
                        </span>
                      </div>
                      <h3 className="mt-3 text-base font-semibold text-white">
                        {concern.subject}
                      </h3>
                      <p className="mt-1 text-sm text-slate-400">
                        {concern.student.name} / {concern.student.email}
                      </p>
                    </div>
                    <p className="text-sm text-slate-400">
                      {formatDateTime(concern.updatedAt)}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 shadow-[0_24px_90px_-50px_rgba(8,15,28,0.95)] backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
                  Activity feed
                </p>
                <h2 className="mt-2 text-xl font-semibold text-white">
                  Audited system events
                </h2>
              </div>
              <p className="text-sm text-slate-400">Philippine time</p>
            </div>

            <div className="mt-5 space-y-3">
              {auditLogs.map((entry) => (
                <article
                  key={entry.id}
                  className="rounded-[1.4rem] border border-white/10 bg-slate-900/80 p-4"
                >
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {formatActionLabel(entry.action)}
                      </p>
                      <p className="mt-1 text-sm text-slate-400">
                        {entry.actor
                          ? `${entry.actor.name} (${formatRoleLabel(entry.actor.role)})`
                          : "System"}{" "}
                        / {entry.entityType}
                      </p>
                    </div>
                    <p className="text-sm text-slate-400">
                      {formatDateTime(entry.createdAt)}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </section>
      </div>
    </AppShell>
  );
}
