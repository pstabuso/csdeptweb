import { Role } from "@prisma/client";

import { AppShell } from "@/components/layout/app-shell";
import { ConcernQueue } from "@/components/portal/concern-queue";
import { Notice } from "@/components/ui/primitives";
import { requireUser } from "@/lib/auth";
import {
  type ConcernFilterDefaults,
  type ConcernSearchParams,
  getConcernCategoryOptions,
  getConcernQueue,
  normalizeConcernFilters,
} from "@/lib/dashboard-data";

type PageProps = {
  searchParams?: Promise<ConcernSearchParams & { notice?: string }>;
};

const ADMIN_QUEUE_DEFAULTS: ConcernFilterDefaults = {
  status: "ALL",
  scope: "all",
  sort: "recent",
};

export default async function AdminConcernsPage({ searchParams }: PageProps) {
  const user = await requireUser([Role.ADMIN]);
  const params = (await searchParams) ?? {};
  const filters = normalizeConcernFilters(params, ADMIN_QUEUE_DEFAULTS);
  const [queue, categoryOptions] = await Promise.all([
    getConcernQueue(filters, null),
    getConcernCategoryOptions(),
  ]);

  return (
    <AppShell
      user={user}
      title="Concerns"
      description="Read-only oversight of every concern thread."
    >
      <div className="space-y-4">
        <Notice code={params.notice} />
        <ConcernQueue
          listPath="/admin/concerns"
          detailBasePath="/admin/concerns"
          filters={filters}
          defaults={ADMIN_QUEUE_DEFAULTS}
          queue={queue}
          categoryOptions={categoryOptions}
          mineLabel={null}
        />
      </div>
    </AppShell>
  );
}
