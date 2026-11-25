import { Role } from "@prisma/client";
import { PenLine } from "lucide-react";
import Link from "next/link";

import { AppShell } from "@/components/layout/app-shell";
import { StudentConcernList } from "@/components/portal/student-concern-list";
import { EmptyState, LinkTabs, Notice } from "@/components/ui/primitives";
import { requireUser } from "@/lib/auth";
import { getStudentConcerns, normalizeStudentView } from "@/lib/dashboard-data";

type PageProps = {
  searchParams?: Promise<{ view?: string; notice?: string }>;
};

export default async function StudentConcernsPage({ searchParams }: PageProps) {
  const user = await requireUser([Role.STUDENT]);
  const params = (await searchParams) ?? {};
  const view = normalizeStudentView(params.view);
  const { items, activeCount, closedCount } = await getStudentConcerns(user.id, view);

  return (
    <AppShell
      user={user}
      title="My concerns"
      description="Concerns with a new staff reply are listed first."
      actions={
        user.studentNumber ? (
          <Link href="/student/concerns/new" className="btn-primary">
            <PenLine size={16} />
            New concern
          </Link>
        ) : null
      }
    >
      <div className="space-y-4">
        <Notice code={params.notice} />
        <LinkTabs
          label="Filter concerns"
          tabs={[
            { label: "Active", href: "/student/concerns", active: view === "active", count: activeCount },
            { label: "Closed", href: "/student/concerns?view=closed", active: view === "closed", count: closedCount },
            { label: "All", href: "/student/concerns?view=all", active: view === "all", count: activeCount + closedCount },
          ]}
        />
        {items.length ? (
          <StudentConcernList concerns={items} />
        ) : (
          <EmptyState
            title={view === "closed" ? "No closed concerns" : "No active concerns"}
            description={
              view === "active" ? "When you submit a concern, you can follow its replies here." : undefined
            }
          />
        )}
      </div>
    </AppShell>
  );
}
