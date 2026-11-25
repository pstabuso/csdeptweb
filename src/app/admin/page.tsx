import { Role } from "@prisma/client";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { AppShell } from "@/components/layout/app-shell";
import { ActivityList } from "@/components/portal/activity-list";
import { Notice, SectionHeader, StatTile } from "@/components/ui/primitives";
import { requireUser } from "@/lib/auth";
import { getAdminOverview } from "@/lib/dashboard-data";

type PageProps = {
  searchParams?: Promise<{ notice?: string }>;
};

const roleLabels: Record<Role, string> = {
  STUDENT: "Students",
  COORDINATOR: "Coordinators",
  SECRETARY: "Secretaries",
  ADMIN: "Admins",
};

export default async function AdminOverviewPage({ searchParams }: PageProps) {
  const user = await requireUser([Role.ADMIN]);
  const { notice } = (await searchParams) ?? {};
  const overview = await getAdminOverview();
  const { concernCounts, roleCounts, accessCounts, openByOwner } = overview;
  const maxRole = Math.max(1, ...Object.values(roleCounts));

  return (
    <AppShell user={user} title="Overview" description="Department activity at a glance. All times are Philippine time.">
      <div className="space-y-6">
        <Notice code={notice} />

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile
            label="Needs reply"
            value={concernCounts.OPEN}
            helper={`Coordinator ${openByOwner.COORDINATOR} · Secretary ${openByOwner.SECRETARY}`}
            href="/admin/concerns?status=OPEN"
            highlight={concernCounts.OPEN > 0}
          />
          <StatTile
            label="Answered"
            value={concernCounts.ANSWERED}
            helper="Waiting on students"
            href="/admin/concerns?status=ANSWERED"
          />
          <StatTile
            label="Closed"
            value={concernCounts.CLOSED}
            helper={`${overview.repliesCount} replies sent overall`}
            href="/admin/concerns?status=CLOSED"
          />
          <StatTile
            label="Accounts"
            value={overview.totalUsers}
            helper={`${accessCounts.ACTIVE} active · ${accessCounts.DISABLED} disabled`}
            href="/admin/users"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <section className="card card-pad">
            <SectionHeader title="People" />
            <ul className="mt-4 space-y-3">
              {(Object.keys(roleCounts) as Role[]).map((role) => (
                <li key={role}>
                  <Link href={`/admin/users?role=${role}`} className="group block">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-ink-muted group-hover:text-ink">{roleLabels[role]}</span>
                      <span className="font-medium tabular-nums text-ink">{roleCounts[role]}</span>
                    </div>
                    <div className="mt-1.5 h-1.5 rounded-full bg-white/[0.06]">
                      <div
                        className="h-full rounded-full bg-violet-400"
                        style={{ width: `${(roleCounts[role] / maxRole) * 100}%` }}
                      />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="card card-pad">
            <SectionHeader
              title="Recent activity"
              action={
                <Link href="/admin/activity" className="btn-ghost btn-sm">
                  Full log
                  <ArrowRight size={14} />
                </Link>
              }
            />
            <div className="mt-2">
              <ActivityList entries={overview.recentActivity} />
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
