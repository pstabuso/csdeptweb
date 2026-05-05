import { AppShell } from "@/components/layout/app-shell";
import { StatusBadge } from "@/components/portal/status-badge";
import { formatDateTime } from "@/lib/format";
import { getAdminDashboardData } from "@/lib/dashboard-data";
import { requireUser } from "@/lib/auth";
import { Role } from "@prisma/client";

const roleLabels = {
  STUDENT: "Students",
  COORDINATOR: "Coordinators",
  SECRETARY: "Secretaries",
  ADMIN: "Admins",
};

export default async function AdminPage() {
  const user = await requireUser([Role.ADMIN]);
  const { stats, roleCounts, recentConcerns, auditLogs } =
    await getAdminDashboardData();

  const statCards = [
    { label: "Total users", value: stats.totalUsers },
    { label: "Total concerns", value: stats.totalConcerns },
    { label: "Open concerns", value: stats.openConcerns },
    { label: "Replies sent", value: stats.repliesCount },
  ];

  return (
    <AppShell
      user={user}
      title="Admin activity overview"
      description="View the entire department portal at a glance, including account distribution, concern status, and the latest system activity."
    >
      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card) => (
            <article
              key={card.label}
              className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-[0_20px_80px_-44px_rgba(15,23,42,0.45)]"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                {card.label}
              </p>
              <p className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
                {card.value}
              </p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="space-y-5">
            <div className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-[0_20px_80px_-44px_rgba(15,23,42,0.42)]">
              <h2 className="text-lg font-semibold text-slate-950">
                Account distribution
              </h2>
              <div className="mt-4 space-y-3">
                {Object.entries(roleCounts).map(([role, count]) => (
                  <div
                    key={role}
                    className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm"
                  >
                    <span className="font-medium text-slate-600">
                      {roleLabels[role as keyof typeof roleLabels]}
                    </span>
                    <span className="font-semibold text-slate-950">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-[0_20px_80px_-44px_rgba(15,23,42,0.42)]">
              <h2 className="text-lg font-semibold text-slate-950">
                Concern status mix
              </h2>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <p>Answered: {stats.answeredConcerns}</p>
                <p>Closed: {stats.closedConcerns}</p>
                <p>Open: {stats.openConcerns}</p>
              </div>
            </div>
          </aside>

          <div className="space-y-6">
            <section className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-[0_20px_80px_-44px_rgba(15,23,42,0.42)]">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-950">
                  Recent concerns
                </h2>
              </div>
              <div className="mt-5 space-y-4">
                {recentConcerns.map((concern) => (
                  <article
                    key={concern.id}
                    className="rounded-3xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <StatusBadge status={concern.status} />
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                            {concern.category}
                          </span>
                        </div>
                        <h3 className="mt-3 text-base font-semibold text-slate-950">
                          {concern.subject}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          {concern.student.name} · {concern.student.email}
                        </p>
                      </div>
                      <p className="text-sm text-slate-500">
                        {formatDateTime(concern.updatedAt)}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-[0_20px_80px_-44px_rgba(15,23,42,0.42)]">
              <h2 className="text-lg font-semibold text-slate-950">
                Activity feed
              </h2>
              <div className="mt-5 space-y-3">
                {auditLogs.map((entry) => (
                  <article
                    key={entry.id}
                    className="rounded-3xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-950">
                          {entry.action.replaceAll("_", " ")}
                        </p>
                        <p className="text-sm text-slate-500">
                          {entry.actor
                            ? `${entry.actor.name} (${entry.actor.role.replaceAll("_", " ")})`
                            : "System"}{" "}
                          · {entry.entityType}
                        </p>
                      </div>
                      <p className="text-sm text-slate-500">
                        {formatDateTime(entry.createdAt)}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
