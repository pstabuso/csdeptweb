import { Role, UserStatus } from "@prisma/client";

import { updateUserAccess } from "@/app/actions/admin";
import { AppShell } from "@/components/layout/app-shell";
import { StatusBadge } from "@/components/portal/status-badge";
import { SubmitButton } from "@/components/forms/submit-button";
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
      helper: `${stats.activeUsers} active · ${stats.disabledUsers} disabled`,
    },
    {
      label: "Concerns",
      value: stats.totalConcerns,
      helper: `${stats.openConcerns} still open`,
    },
    {
      label: "Resolved",
      value: stats.answeredConcerns + stats.closedConcerns,
      helper: `${stats.answeredConcerns} answered · ${stats.closedConcerns} closed`,
    },
    {
      label: "Replies sent",
      value: stats.repliesCount,
      helper: "All timestamps shown in Philippine time",
    },
  ];

  return (
    <AppShell
      user={user}
      title="Admin command center"
      description="Manage account access, monitor department operations, and audit the full portal activity stream from one cleaner control surface."
    >
      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card) => (
            <article
              key={card.label}
              className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6 shadow-[0_24px_90px_-50px_rgba(8,15,28,0.95)] backdrop-blur"
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
          <section className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6 shadow-[0_24px_90px_-50px_rgba(8,15,28,0.95)] backdrop-blur">
            <div className="flex flex-col gap-3 border-b border-white/10 pb-5 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
                  Access manager
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  Edit user roles and access states
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                  Promote users to staff roles, disable access when needed, and
                  keep department permissions under direct admin control.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                Current admin account changes are intentionally locked for safety.
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {users.map((account) => {
                const action = updateUserAccess.bind(null, account.id);
                const isCurrentAdmin = account.id === user.id;

                return (
                  <article
                    key={account.id}
                    className="rounded-[1.6rem] border border-white/10 bg-slate-900/80 p-5"
                  >
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="text-lg font-semibold text-white">
                            {account.name}
                          </span>
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold tracking-wide ${accessBadgeStyles[account.status]}`}
                          >
                            {formatRoleLabel(account.status)}
                          </span>
                          {isCurrentAdmin ? (
                            <span className="inline-flex rounded-full bg-fuchsia-400/15 px-3 py-1 text-xs font-semibold tracking-wide text-fuchsia-200 ring-1 ring-inset ring-fuchsia-300/30">
                              Current session
                            </span>
                          ) : null}
                        </div>
                        <div className="text-sm leading-6 text-slate-400">
                          <p>{account.email}</p>
                          <p>
                            Joined {formatDateTime(account.createdAt)} ·{" "}
                            {account._count.concerns} concerns ·{" "}
                            {account._count.replies} replies
                          </p>
                        </div>
                      </div>

                      <form
                        action={action}
                        className="grid gap-3 rounded-[1.4rem] border border-white/10 bg-slate-950/80 p-4 md:grid-cols-[180px_180px_auto]"
                      >
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
                            disabled={isCurrentAdmin}
                            className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
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
                            disabled={isCurrentAdmin}
                            className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <option value="ACTIVE">Active</option>
                            <option value="DISABLED">Disabled</option>
                          </select>
                        </div>

                        <div className="flex items-end">
                          <SubmitButton
                            pendingLabel="Updating..."
                            className="w-full md:w-auto"
                          >
                            Save access
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
            <section className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6 shadow-[0_24px_90px_-50px_rgba(8,15,28,0.95)] backdrop-blur">
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

            <section className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6 shadow-[0_24px_90px_-50px_rgba(8,15,28,0.95)] backdrop-blur">
              <h2 className="text-lg font-semibold text-white">
                Queue health
              </h2>
              <div className="mt-4 grid gap-3">
                <div className="rounded-2xl border border-amber-300/15 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
                  Open concerns: <span className="font-semibold">{stats.openConcerns}</span>
                </div>
                <div className="rounded-2xl border border-emerald-300/15 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
                  Answered concerns:{" "}
                  <span className="font-semibold">{stats.answeredConcerns}</span>
                </div>
                <div className="rounded-2xl border border-slate-300/15 bg-slate-400/10 px-4 py-3 text-sm text-slate-100">
                  Closed concerns: <span className="font-semibold">{stats.closedConcerns}</span>
                </div>
              </div>
            </section>
          </aside>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <section className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6 shadow-[0_24px_90px_-50px_rgba(8,15,28,0.95)] backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-fuchsia-300">
                  Recent concerns
                </p>
                <h2 className="mt-2 text-xl font-semibold text-white">
                  Latest student queue movement
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
                        {concern.student.name} · {concern.student.email}
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

          <section className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6 shadow-[0_24px_90px_-50px_rgba(8,15,28,0.95)] backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
                  Activity feed
                </p>
                <h2 className="mt-2 text-xl font-semibold text-white">
                  Audited admin and user events
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
                        · {entry.entityType}
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
