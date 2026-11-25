import { Role } from "@prisma/client";

import { AppShell } from "@/components/layout/app-shell";
import { ActivityList } from "@/components/portal/activity-list";
import { Pagination } from "@/components/ui/primitives";
import { requireUser } from "@/lib/auth";
import { getAuditLogPage, normalizePage } from "@/lib/dashboard-data";
import { buildHref } from "@/lib/href";

type PageProps = {
  searchParams?: Promise<{ page?: string }>;
};

export default async function AdminActivityPage({ searchParams }: PageProps) {
  const user = await requireUser([Role.ADMIN]);
  const page = normalizePage((await searchParams)?.page);
  const log = await getAuditLogPage(page);

  return (
    <AppShell
      user={user}
      title="Activity log"
      description="Sign-ins, concern updates, calendar changes and account edits."
    >
      <div className="space-y-4">
        <section className="card card-pad">
          <ActivityList entries={log.items} />
        </section>
        <Pagination
          page={log.page}
          pageCount={log.pageCount}
          total={log.total}
          hrefForPage={(target) =>
            buildHref("/admin/activity", { page: target > 1 ? target : undefined })
          }
        />
      </div>
    </AppShell>
  );
}
